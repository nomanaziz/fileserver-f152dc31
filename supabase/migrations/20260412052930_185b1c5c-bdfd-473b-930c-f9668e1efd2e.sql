
CREATE TABLE public.product_categories (
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product categories"
ON public.product_categories FOR SELECT
USING (true);

CREATE POLICY "Admins can manage product categories"
ON public.product_categories FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Vendors can insert own product categories"
ON public.product_categories FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.products
  WHERE products.id = product_categories.product_id
    AND products.vendor_id = auth.uid()
    AND products.is_vendor_product = true
));

CREATE POLICY "Vendors can delete own product categories"
ON public.product_categories FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.products
  WHERE products.id = product_categories.product_id
    AND products.vendor_id = auth.uid()
    AND products.is_vendor_product = true
));

CREATE INDEX idx_product_categories_product ON public.product_categories(product_id);
CREATE INDEX idx_product_categories_category ON public.product_categories(category_id);
