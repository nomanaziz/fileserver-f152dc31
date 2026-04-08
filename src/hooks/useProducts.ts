import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  content_type: string;
  os_type: string | null;
  version: string | null;
  file_size: string | null;
  price: number;
  is_paid: boolean;
  is_featured: boolean;
  status: string;
  thumbnail_url: string | null;
  screenshots: string[];
  download_count: number;
  view_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  categories?: { name: string; slug: string } | null;
}

export function useProducts(filters?: { category_id?: string; search?: string; featured?: boolean; limit?: number }) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      let query = supabase.from("products").select("*, categories(name, slug)");
      if (filters?.category_id) query = query.eq("category_id", filters.category_id);
      if (filters?.search) query = query.ilike("title", `%${filters.search}%`);
      if (filters?.featured) query = query.eq("is_featured", true);
      if (filters?.limit) query = query.limit(filters.limit);
      query = query.order("created_at", { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Product;
    },
    enabled: !!slug,
  });
}

export function useMutateProduct() {
  const qc = useQueryClient();
  const upsert = useMutation({
    mutationFn: async (product: Partial<Product> & { id?: string }) => {
      const { categories, ...rest } = product as any;
      if (rest.id) {
        const { data, error } = await supabase.from("products").update(rest).eq("id", rest.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from("products").insert(rest).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  return { upsert, remove };
}
