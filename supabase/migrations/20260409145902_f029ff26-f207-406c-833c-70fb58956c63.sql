
-- Create vendor_tiers table
CREATE TABLE public.vendor_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  commission_rate numeric NOT NULL DEFAULT 20,
  min_sales_count integer NOT NULL DEFAULT 0,
  min_total_earnings numeric NOT NULL DEFAULT 0,
  color text NOT NULL DEFAULT '#CD7F32',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage vendor tiers" ON public.vendor_tiers FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can view active tiers" ON public.vendor_tiers FOR SELECT USING (is_active = true);

CREATE TRIGGER update_vendor_tiers_updated_at BEFORE UPDATE ON public.vendor_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert default tiers
INSERT INTO public.vendor_tiers (name, slug, commission_rate, min_sales_count, min_total_earnings, color, sort_order) VALUES
  ('Bronze', 'bronze', 20, 0, 0, '#CD7F32', 1),
  ('Silver', 'silver', 15, 20, 5000, '#C0C0C0', 2),
  ('Gold', 'gold', 10, 50, 20000, '#FFD700', 3);

-- Add tier_id to vendor_profiles
ALTER TABLE public.vendor_profiles ADD COLUMN tier_id uuid REFERENCES public.vendor_tiers(id);

-- Set existing vendors to Bronze tier
UPDATE public.vendor_profiles SET tier_id = (SELECT id FROM public.vendor_tiers WHERE slug = 'bronze');

-- Update the handle_vendor_payment trigger to auto-upgrade tiers
CREATE OR REPLACE FUNCTION public.handle_vendor_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_vendor_id uuid;
  v_commission_rate numeric;
  v_commission numeric;
  v_vendor_amount numeric;
  v_sales_count integer;
  v_total_earnings numeric;
  v_new_tier record;
BEGIN
  IF NEW.status != 'completed' OR NEW.product_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT vendor_id INTO v_vendor_id
  FROM public.products
  WHERE id = NEW.product_id AND is_vendor_product = true;

  IF v_vendor_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT commission_rate INTO v_commission_rate
  FROM public.vendor_profiles
  WHERE id = v_vendor_id;

  IF v_commission_rate IS NULL THEN
    v_commission_rate := 20;
  END IF;

  v_commission := NEW.amount * v_commission_rate / 100;
  v_vendor_amount := NEW.amount - v_commission;

  NEW.vendor_id := v_vendor_id;

  INSERT INTO public.vendor_earnings (vendor_id, payment_id, product_id, sale_amount, commission_amount, vendor_amount)
  VALUES (v_vendor_id, NEW.id, NEW.product_id, NEW.amount, v_commission, v_vendor_amount);

  UPDATE public.vendor_profiles
  SET total_earnings = total_earnings + v_vendor_amount,
      available_balance = available_balance + v_vendor_amount
  WHERE id = v_vendor_id;

  -- Auto-upgrade tier check
  SELECT COUNT(*) INTO v_sales_count FROM public.vendor_earnings WHERE vendor_id = v_vendor_id;
  SELECT total_earnings + v_vendor_amount INTO v_total_earnings FROM public.vendor_profiles WHERE id = v_vendor_id;

  SELECT * INTO v_new_tier FROM public.vendor_tiers
  WHERE is_active = true
    AND (v_sales_count >= min_sales_count OR v_total_earnings >= min_total_earnings)
  ORDER BY sort_order DESC
  LIMIT 1;

  IF v_new_tier.id IS NOT NULL THEN
    UPDATE public.vendor_profiles
    SET tier_id = v_new_tier.id,
        commission_rate = v_new_tier.commission_rate
    WHERE id = v_vendor_id;
  END IF;

  RETURN NEW;
END;
$$;
