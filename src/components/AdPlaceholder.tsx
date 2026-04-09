import { Link } from "react-router-dom";

type AdPlacement = "header-banner" | "sidebar" | "in-content" | "before-download";

const AD_DATA: Record<AdPlacement, { size: string; width: string; height: string; price: string; label: string }> = {
  "header-banner": { size: "728×90", width: "100%", height: "90px", price: "৳৫,০০০", label: "হেডার ব্যানার" },
  "sidebar": { size: "300×250", width: "100%", height: "250px", price: "৳৩,০০০", label: "সাইডবার" },
  "in-content": { size: "468×60", width: "100%", height: "60px", price: "৳২,০০০", label: "ইন-কন্টেন্ট" },
  "before-download": { size: "728×90", width: "100%", height: "90px", price: "৳৪,০০০", label: "ডাউনলোডের আগে" },
};

export default function AdPlaceholder({ placement }: { placement: AdPlacement }) {
  const ad = AD_DATA[placement];

  return (
    <Link
      to={`/advertise?placement=${placement}`}
      className="block relative border border-dashed border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden"
      style={{ height: ad.height, maxHeight: ad.height }}
    >
      {/* Corner label */}
      <span className="absolute top-1 left-1.5 text-[9px] text-muted-foreground/60 font-medium tracking-wide">
        বিজ্ঞাপন
      </span>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="text-xs font-semibold text-muted-foreground">{ad.size}</span>
        <span className="text-[10px] text-muted-foreground/70">{ad.price}/মাস · ৩০ দিন</span>
        <span className="text-[10px] text-primary mt-1 hover:underline">এখানে বিজ্ঞাপন দিন →</span>
      </div>
    </Link>
  );
}
