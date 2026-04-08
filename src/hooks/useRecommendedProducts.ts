import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/hooks/useProducts";
import type { DetectedPlatform } from "@/hooks/useDevicePlatform";

const platformCategorySlugs: Record<string, string[]> = {
  android: ["android", "apk", "mobile"],
  windows: ["windows", "software", "pc"],
  mac: ["mac", "macos", "apple"],
  ios: ["ios", "iphone", "ipad"],
  linux: ["linux", "ubuntu"],
};

export function useRecommendedProducts(platform: DetectedPlatform) {
  return useQuery({
    queryKey: ["recommended-products", platform],
    queryFn: async () => {
      if (platform === "unknown") return [];

      // First get matching category IDs
      const keywords = platformCategorySlugs[platform] || [];
      if (keywords.length === 0) return [];

      const { data: categories } = await supabase
        .from("categories")
        .select("id, slug")
        .eq("is_active", true);

      if (!categories || categories.length === 0) return [];

      const matchingIds = categories
        .filter((c) => keywords.some((kw) => c.slug.toLowerCase().includes(kw)))
        .map((c) => c.id);

      if (matchingIds.length === 0) return [];

      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug, icon)")
        .eq("status", "published")
        .in("category_id", matchingIds)
        .order("download_count", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as Product[];
    },
    enabled: platform !== "unknown",
  });
}
