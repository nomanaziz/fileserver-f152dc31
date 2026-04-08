-- 1. Products: add missing columns
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS thumbnail_icon text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_trending boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS file_type text,
  ADD COLUMN IF NOT EXISTS release_date text,
  ADD COLUMN IF NOT EXISTS developer text,
  ADD COLUMN IF NOT EXISTS discount_price numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS affiliate_link text,
  ADD COLUMN IF NOT EXISTS license_type text DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS video_duration text,
  ADD COLUMN IF NOT EXISTS git_url text,
  ADD COLUMN IF NOT EXISTS programming_language text;

-- 2. Activity logs: add target columns
ALTER TABLE activity_logs
  ADD COLUMN IF NOT EXISTS target_type text,
  ADD COLUMN IF NOT EXISTS target_id text;

-- 3. Download servers: add server_type
ALTER TABLE download_servers
  ADD COLUMN IF NOT EXISTS server_type text DEFAULT 'local';

-- 4. Coupons: add discount_type and discount_value
ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS discount_type text DEFAULT 'percent',
  ADD COLUMN IF NOT EXISTS discount_value numeric DEFAULT 10;

-- 5. Ads: add new columns
ALTER TABLE ads
  ADD COLUMN IF NOT EXISTS placement text DEFAULT 'sidebar',
  ADD COLUMN IF NOT EXISTS ad_type text DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS content text,
  ADD COLUMN IF NOT EXISTS device_target text DEFAULT 'all',
  ADD COLUMN IF NOT EXISTS priority integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS impressions integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clicks integer DEFAULT 0;

-- 6. Subscription plans: add download limits
ALTER TABLE subscription_plans
  ADD COLUMN IF NOT EXISTS daily_download_limit integer DEFAULT 5,
  ADD COLUMN IF NOT EXISTS total_download_limit integer DEFAULT 50;

-- 7. Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  color text DEFAULT '#000000',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  account_type text,
  account_number text,
  bank_name text,
  branch_name text,
  routing_number text,
  instructions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payment methods" ON payment_methods FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view active payment methods" ON payment_methods FOR SELECT USING (is_active = true);

-- 8. Create scrape_queue table
CREATE TABLE IF NOT EXISTS scrape_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  source_site text,
  content_type text DEFAULT 'software',
  status text DEFAULT 'pending',
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scrape_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scrape queue" ON scrape_queue FOR ALL USING (has_role(auth.uid(), 'admin'));