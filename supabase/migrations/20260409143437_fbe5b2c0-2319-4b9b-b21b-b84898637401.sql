
-- 1. vendor_profiles table
CREATE TABLE public.vendor_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name text NOT NULL,
  store_description text,
  logo_url text,
  is_verified boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  commission_rate numeric NOT NULL DEFAULT 20,
  total_earnings numeric NOT NULL DEFAULT 0,
  available_balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active verified vendors" ON public.vendor_profiles
  FOR SELECT USING (is_active = true AND is_verified = true);

CREATE POLICY "Users can view own vendor profile" ON public.vendor_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own vendor profile" ON public.vendor_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own vendor profile" ON public.vendor_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage vendor profiles" ON public.vendor_profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_vendor_profiles_updated_at
  BEFORE UPDATE ON public.vendor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 2. vendor_earnings table
CREATE TABLE public.vendor_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  sale_amount numeric NOT NULL DEFAULT 0,
  commission_amount numeric NOT NULL DEFAULT 0,
  vendor_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own earnings" ON public.vendor_earnings
  FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Admins can manage vendor earnings" ON public.vendor_earnings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 3. vendor_payouts table
CREATE TABLE public.vendor_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  payment_method text,
  account_details jsonb,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own payouts" ON public.vendor_payouts
  FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can create own payouts" ON public.vendor_payouts
  FOR INSERT WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Admins can manage vendor payouts" ON public.vendor_payouts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 4. Alter products table
ALTER TABLE public.products
  ADD COLUMN vendor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN is_vendor_product boolean NOT NULL DEFAULT false,
  ADD COLUMN vendor_status text NOT NULL DEFAULT 'pending';

-- RLS: Vendors can insert their own products
CREATE POLICY "Vendors can insert own products" ON public.products
  FOR INSERT WITH CHECK (
    auth.uid() = vendor_id AND is_vendor_product = true
  );

-- RLS: Vendors can update their own products
CREATE POLICY "Vendors can update own products" ON public.products
  FOR UPDATE USING (
    auth.uid() = vendor_id AND is_vendor_product = true
  );

-- RLS: Vendors can delete their own products
CREATE POLICY "Vendors can delete own products" ON public.products
  FOR DELETE USING (
    auth.uid() = vendor_id AND is_vendor_product = true
  );

-- Vendors can also manage download links for their own products
CREATE POLICY "Vendors can insert own product downloads" ON public.product_downloads
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_downloads.product_id
        AND products.vendor_id = auth.uid()
        AND products.is_vendor_product = true
    )
  );

CREATE POLICY "Vendors can delete own product downloads" ON public.product_downloads
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_downloads.product_id
        AND products.vendor_id = auth.uid()
        AND products.is_vendor_product = true
    )
  );

-- 5. Alter payments table
ALTER TABLE public.payments
  ADD COLUMN vendor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 6. Trigger: on payment completed for vendor product, calculate earnings
CREATE OR REPLACE FUNCTION public.handle_vendor_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vendor_id uuid;
  v_commission_rate numeric;
  v_commission numeric;
  v_vendor_amount numeric;
BEGIN
  -- Only process completed payments with a product_id
  IF NEW.status != 'completed' OR NEW.product_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if product is a vendor product
  SELECT vendor_id INTO v_vendor_id
  FROM public.products
  WHERE id = NEW.product_id AND is_vendor_product = true;

  IF v_vendor_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get commission rate
  SELECT commission_rate INTO v_commission_rate
  FROM public.vendor_profiles
  WHERE id = v_vendor_id;

  IF v_commission_rate IS NULL THEN
    v_commission_rate := 20;
  END IF;

  v_commission := NEW.amount * v_commission_rate / 100;
  v_vendor_amount := NEW.amount - v_commission;

  -- Update payment with vendor_id
  NEW.vendor_id := v_vendor_id;

  -- Insert earnings record
  INSERT INTO public.vendor_earnings (vendor_id, payment_id, product_id, sale_amount, commission_amount, vendor_amount)
  VALUES (v_vendor_id, NEW.id, NEW.product_id, NEW.amount, v_commission, v_vendor_amount);

  -- Update vendor balance
  UPDATE public.vendor_profiles
  SET total_earnings = total_earnings + v_vendor_amount,
      available_balance = available_balance + v_vendor_amount
  WHERE id = v_vendor_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_vendor_payment_completed
  BEFORE INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_vendor_payment();
