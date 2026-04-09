import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useHasPurchased(productId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["has-purchased", productId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("id")
        .eq("user_id", user!.id)
        .eq("product_id", productId!)
        .eq("status", "completed")
        .limit(1);
      if (error) throw error;
      return data && data.length > 0;
    },
    enabled: !!user && !!productId,
  });
}
