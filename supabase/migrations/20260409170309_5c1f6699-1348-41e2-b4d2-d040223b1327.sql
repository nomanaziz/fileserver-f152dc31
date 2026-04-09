
-- Admin can view all cart items
CREATE POLICY "Admins can view all cart items"
ON public.cart_items
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can view all favorites
CREATE POLICY "Admins can view all favorites"
ON public.favorites
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));
