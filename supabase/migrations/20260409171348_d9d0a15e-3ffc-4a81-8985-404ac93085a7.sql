
CREATE TABLE public.ad_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  placement text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ad_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit ad inquiry"
  ON public.ad_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view ad inquiries"
  ON public.ad_inquiries FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update ad inquiries"
  ON public.ad_inquiries FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));
