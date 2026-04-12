
-- Create storage bucket for vendor logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('vendor-logos', 'vendor-logos', true, 102400, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Public read access
CREATE POLICY "Vendor logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'vendor-logos');

-- Authenticated users can upload their own logo
CREATE POLICY "Users can upload vendor logo"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vendor-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can update their own logo
CREATE POLICY "Users can update vendor logo"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vendor-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own logo
CREATE POLICY "Users can delete vendor logo"
ON storage.objects FOR DELETE
USING (bucket_id = 'vendor-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
