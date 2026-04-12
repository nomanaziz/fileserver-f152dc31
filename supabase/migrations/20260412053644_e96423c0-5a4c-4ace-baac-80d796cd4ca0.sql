
CREATE TABLE public.download_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  download_id uuid NOT NULL REFERENCES public.product_downloads(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address text NOT NULL,
  is_working boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (download_id, ip_address)
);

ALTER TABLE public.download_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can view feedback (for stats)
CREATE POLICY "Anyone can view download feedback"
ON public.download_feedback FOR SELECT
USING (true);

-- Anyone can insert feedback (anonymous allowed)
CREATE POLICY "Anyone can insert download feedback"
ON public.download_feedback FOR INSERT
WITH CHECK (true);

-- Anyone can update own feedback by IP (handled via edge function)
CREATE POLICY "Admins can manage all feedback"
ON public.download_feedback FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can delete own feedback
CREATE POLICY "Users can delete own feedback"
ON public.download_feedback FOR DELETE
USING (auth.uid() = user_id);

-- Index for fast aggregation
CREATE INDEX idx_download_feedback_download_id ON public.download_feedback(download_id);
CREATE INDEX idx_download_feedback_product_id ON public.download_feedback(product_id);
