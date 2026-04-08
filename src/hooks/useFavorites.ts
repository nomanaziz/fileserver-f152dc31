import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useFavorites() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("favorites")
        .select("*, products(id, title, slug, thumbnail_url, price, is_paid)")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useToggleFavorite() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { data: existing } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();
      if (existing) {
        await supabase.from("favorites").delete().eq("id", existing.id);
      } else {
        await supabase.from("favorites").insert({ user_id: user.id, product_id: productId });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });
}
