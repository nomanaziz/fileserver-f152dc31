CREATE TABLE public.user_saved_bdix_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  links text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_saved_bdix_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved links"
ON public.user_saved_bdix_links
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved links"
ON public.user_saved_bdix_links
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved links"
ON public.user_saved_bdix_links
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved links"
ON public.user_saved_bdix_links
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all saved links"
ON public.user_saved_bdix_links
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));