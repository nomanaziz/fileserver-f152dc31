CREATE TABLE public.bdix_servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL,
  links text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bdix_servers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active bdix servers"
  ON public.bdix_servers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage bdix servers"
  ON public.bdix_servers FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_bdix_servers_updated_at
  BEFORE UPDATE ON public.bdix_servers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();