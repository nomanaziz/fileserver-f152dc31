import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AdPlacement = "header" | "sidebar" | "in_content" | "before_download" | "footer";

export function useAdsForPlacement(placement: AdPlacement) {
  return useQuery({
    queryKey: ["ads", placement],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("ads")
        .select("id, title, image_url, link_url, content, ad_type, ad_source, placement, position, device_target, priority, starts_at, ends_at, impressions, clicks")
        .eq("is_active", true)
        .eq("placement", placement)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order("priority", { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useAdSlots() {
  return useQuery({
    queryKey: ["ad-slots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_slots" as any)
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data as any[];
    },
    staleTime: 60_000,
  });
}

export function useAdSlotAvailability() {
  return useQuery({
    queryKey: ["ad-slot-availability"],
    queryFn: async () => {
      // Get slot configs
      const { data: slots, error: slotsErr } = await supabase
        .from("ad_slots" as any)
        .select("*")
        .eq("is_active", true);
      if (slotsErr) throw slotsErr;

      // Get active ad counts per placement
      const now = new Date().toISOString();
      const { data: ads, error: adsErr } = await supabase
        .from("ads")
        .select("placement")
        .eq("is_active", true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`);
      if (adsErr) throw adsErr;

      const countMap: Record<string, number> = {};
      ads?.forEach((a: any) => {
        const p = a.placement || "sidebar";
        countMap[p] = (countMap[p] || 0) + 1;
      });

      return (slots as any[])?.map((slot: any) => ({
        ...slot,
        active_count: countMap[slot.placement] || 0,
        available: (slot.max_ads || 10) - (countMap[slot.placement] || 0),
      }));
    },
    staleTime: 30_000,
  });
}
