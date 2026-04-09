import { useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAdsForPlacement, type AdPlacement } from "@/hooks/useAds";
import { supabase } from "@/integrations/supabase/client";

const SIZE_MAP: Record<AdPlacement, { height: string }> = {
  header: { height: "90px" },
  sidebar: { height: "250px" },
  in_content: { height: "60px" },
  before_download: { height: "90px" },
  footer: { height: "90px" },
};

export default function AdSlot({ placement }: { placement: AdPlacement }) {
  const { data: ads } = useAdsForPlacement(placement);
  const style = SIZE_MAP[placement];

  // Pick one random ad weighted by priority
  const ad = useMemo(() => {
    if (!ads || ads.length === 0) return null;
    // Weighted random: higher priority = more likely
    const totalWeight = ads.reduce((s, a) => s + ((a as any).priority || 1), 0);
    let r = Math.random() * totalWeight;
    for (const a of ads) {
      r -= (a as any).priority || 1;
      if (r <= 0) return a;
    }
    return ads[0];
  }, [ads]);

  // Track impression
  useEffect(() => {
    if (!ad) return;
    supabase
      .from("ads")
      .update({ impressions: ((ad as any).impressions || 0) + 1 })
      .eq("id", ad.id)
      .then(() => {});
  }, [ad?.id]);

  // Track click
  const trackClick = useCallback(() => {
    if (!ad) return;
    supabase
      .from("ads")
      .update({ clicks: ((ad as any).clicks || 0) + 1 })
      .eq("id", ad.id)
      .then(() => {});
  }, [ad]);

  // No ads — show placeholder
  if (!ad) {
    return (
      <Link
        to={`/advertise?placement=${placement}`}
        className="block relative border border-dashed border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden"
        style={{ height: style.height, maxHeight: style.height }}
      >
        <span className="absolute top-1 left-1.5 text-[9px] text-muted-foreground/60 font-medium tracking-wide">
          বিজ্ঞাপন
        </span>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-[10px] text-primary hover:underline">এখানে বিজ্ঞাপন দিন →</span>
        </div>
      </Link>
    );
  }

  const adType = (ad as any).ad_type || "image";

  // Google/HTML ad
  if (adType === "html" && (ad as any).content) {
    return (
      <div
        className="rounded-lg overflow-hidden"
        style={{ minHeight: style.height }}
        dangerouslySetInnerHTML={{ __html: (ad as any).content }}
      />
    );
  }

  // Image/Video ad
  const imageUrl = ad.image_url || (ad as any).content;
  const linkUrl = ad.link_url;

  const imgElement = (
    <div
      className="rounded-lg overflow-hidden bg-muted relative"
      style={{ height: style.height, maxHeight: style.height }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={ad.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
          {ad.title}
        </div>
      )}
      <span className="absolute top-1 left-1.5 text-[9px] text-white/60 font-medium tracking-wide drop-shadow">
        বিজ্ঞাপন
      </span>
    </div>
  );

  if (linkUrl) {
    return (
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        onClick={trackClick}
        className="block"
      >
        {imgElement}
      </a>
    );
  }

  return imgElement;
}
