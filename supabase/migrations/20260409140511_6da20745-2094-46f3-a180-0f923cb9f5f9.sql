
-- Insert subscription plans
INSERT INTO subscription_plans (name, description, price, duration_days, daily_download_limit, total_download_limit, features, is_active)
VALUES
  ('Basic', 'প্রতিদিন ৩টি ডাউনলোড, মাসে ৩০টি', 99, 30, 3, 30, ARRAY['3 downloads/day', '30 total downloads', 'All paid software'], true),
  ('Premium', 'প্রতিদিন ১০টি ডাউনলোড, মাসে ১০০টি', 199, 30, 10, 100, ARRAY['10 downloads/day', '100 total downloads', 'All paid software', 'Priority support'], true),
  ('Lifetime', 'আনলিমিটেড অ্যাক্সেস, একবার পেমেন্ট', 999, 36500, 50, 999, ARRAY['50 downloads/day', '999 total downloads', 'All paid software', 'Priority support', 'Lifetime access'], true);

-- Insert paid products
INSERT INTO products (title, slug, description, category_id, content_type, os_type, price, is_paid, is_featured, status, version, file_size, developer)
VALUES
  ('Kaspersky Total Security 2025', 'kaspersky-total-security-2025', 'Complete protection for your PC with antivirus, firewall, and privacy tools.', 'cadcf077-7f2e-479d-a123-c80a7aa827bf', 'software', 'windows', 350, true, true, 'published', '25.0.1', '450 MB', 'Kaspersky Lab'),
  ('FL Studio 24 Producer Edition', 'fl-studio-24-producer', 'Professional music production software with all plugins included.', '8012d62c-efa6-4ecd-ae85-78cffee8a5f1', 'software', 'windows', 500, true, true, 'published', '24.1.2', '1.2 GB', 'Image-Line'),
  ('JEEMAIN Prep Pro', 'jeemain-prep-pro', 'Complete JEE Main preparation app with mock tests and video lectures.', '79426c31-790e-459c-a56e-d63ece3befc0', 'android', 'android', 150, true, false, 'published', '3.5.0', '85 MB', 'EduTech BD'),
  ('GTA V Premium Edition', 'gta-v-premium-edition', 'Grand Theft Auto V with all DLC and online content included.', 'ae70c75d-e586-4e0a-97e5-1c19d95bbd7e', 'game', 'windows', 450, true, true, 'published', '1.68', '95 GB', 'Rockstar Games'),
  ('Adobe Premiere Pro 2025', 'adobe-premiere-pro-2025', 'Industry-leading video editing software for professionals.', 'ad1ee733-75c2-45dd-b4f4-1aee88f0f46d', 'software', 'cross_platform', 600, true, true, 'published', '25.1', '2.1 GB', 'Adobe Inc.');
