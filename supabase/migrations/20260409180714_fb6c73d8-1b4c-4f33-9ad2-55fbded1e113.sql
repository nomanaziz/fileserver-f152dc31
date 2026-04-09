
-- 1. Create ad_slots config table
CREATE TABLE public.ad_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement text NOT NULL UNIQUE,
  max_ads integer NOT NULL DEFAULT 10,
  price_per_month numeric NOT NULL DEFAULT 0,
  size_label text NOT NULL DEFAULT '',
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ad_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active ad slots" ON public.ad_slots FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage ad slots" ON public.ad_slots FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_ad_slots_updated_at BEFORE UPDATE ON public.ad_slots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert default slot configs
INSERT INTO public.ad_slots (placement, max_ads, price_per_month, size_label, description) VALUES
  ('header', 5, 5000, '728×90', 'সাইটের উপরে প্রতিটি পেজে দেখায়। সর্বোচ্চ ভিজিবিলিটি।'),
  ('sidebar', 10, 3000, '300×250', 'ক্যাটাগরি ও প্রোডাক্ট পেজের পাশে। টার্গেটেড অডিয়েন্স।'),
  ('in_content', 15, 2000, '468×60', 'কন্টেন্টের মাঝে, স্বাভাবিকভাবে মিশে যায়।'),
  ('before_download', 10, 4000, '728×90', 'ডাউনলোড বাটনের ঠিক আগে। সর্বোচ্চ ক্লিক রেট।'),
  ('footer', 5, 1500, '728×90', 'ফুটারের উপরে। সব পেজে দেখায়।');

-- 2. Add new columns to ads table
ALTER TABLE public.ads
  ADD COLUMN IF NOT EXISTS advertiser_email text,
  ADD COLUMN IF NOT EXISTS advertiser_name text,
  ADD COLUMN IF NOT EXISTS ad_source text NOT NULL DEFAULT 'custom';

-- 3. Create ad-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-images', 'ad-images', true);

CREATE POLICY "Anyone can view ad images" ON storage.objects FOR SELECT USING (bucket_id = 'ad-images');
CREATE POLICY "Admins can upload ad images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ad-images' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update ad images" ON storage.objects FOR UPDATE USING (bucket_id = 'ad-images' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete ad images" ON storage.objects FOR DELETE USING (bucket_id = 'ad-images' AND has_role(auth.uid(), 'admin'::app_role));
