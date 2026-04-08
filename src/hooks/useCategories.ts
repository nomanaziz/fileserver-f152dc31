import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });
}

export function useCategoryBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Category;
    },
    enabled: !!slug,
  });
}

export function useMutateCategory() {
  const qc = useQueryClient();
  const upsert = useMutation({
    mutationFn: async (cat: Partial<Category> & { id?: string }) => {
      if (cat.id) {
        const { data, error } = await supabase.from("categories").update(cat).eq("id", cat.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from("categories").insert(cat).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  return { upsert, remove };
}
