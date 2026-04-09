import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products"> & {
  categories: { name: string; slug: string; icon: string | null } | null;
};

export function useProducts(filters?: { category_id?: string; category_ids?: string[]; search?: string; featured?: boolean; limit?: number }) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      let query = supabase.from("products").select("*, categories(name, slug, icon)").eq("status", "published");
      if (filters?.category_ids && filters.category_ids.length > 0) {
        query = query.in("category_id", filters.category_ids);
      } else if (filters?.category_id) {
        query = query.eq("category_id", filters.category_id);
      }
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
        .select("*, categories(name, slug, icon)")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Product;
    },
    enabled: !!slug,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug, icon)")
        .eq("status", "published")
        .order("download_count", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useLatestProducts() {
  return useQuery({
    queryKey: ["latest-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug, icon)")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data as Product[];
    },
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