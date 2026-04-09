import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Youtube, Facebook, Send as Telegram } from "lucide-react";
import defaultLogo from "@/assets/fileserver-white-logo.png";

export default function Footer() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*");
      const map: Record<string, string> = {};
      data?.forEach(s => { map[s.key] = s.value || ""; });
      return map;
    },
  });

  const { data: menuItems } = useQuery({
    queryKey: ["footer-menu"],
    queryFn: async () => {
      const { data } = await supabase.from("menu_items").select("*").eq("location", "footer").eq("is_active", true).order("sort_order");
      return data || [];
    },
  });

  const parentItems = menuItems?.filter(item => !item.parent_id) || [];
  const childItems = menuItems?.filter(item => item.parent_id) || [];

  const sections = parentItems
    .map(parent => ({
      title: parent.label,
      links: childItems.filter(child => child.parent_id === parent.id),
    }))
    .filter(s => s.links.length > 0);

  const socialLinks = [
    { key: "facebook_url", Icon: Facebook },
    { key: "youtube_url", Icon: Youtube },
    { key: "telegram_url", Icon: Telegram },
  ].filter(s => settings?.[s.key]).map(s => ({ url: settings![s.key], Icon: s.Icon }));

  // Fallback sections when DB has no items
  const fallbackSections = [
    {
      title: "কুইক লিংক",
      links: [
        { label: "হোম", url: "/" },
        { label: "ক্যাটাগরি", url: "/categories" },
        { label: "প্রাইসিং", url: "/pricing" },
        { label: "লাইভ টিভি", url: "/live-tv" },
        { label: "বিজ্ঞাপন দিন", url: "/advertise" },
        { label: "যোগাযোগ", url: "/contact" },
      ],
    },
    {
      title: "তথ্য",
      links: [
        { label: "আমাদের সম্পর্কে", url: "/page/about-us" },
        { label: "ব্লগ", url: "/blog" },
        { label: "FAQ", url: "/page/faq" },
        { label: "রিফান্ড পলিসি", url: "/page/refund-policy" },
        { label: "ভেন্ডর হোন", url: "/become-vendor" },
      ],
    },
    {
      title: "আইনি",
      links: [
        { label: "প্রাইভেসি পলিসি", url: "/page/privacy-policy" },
        { label: "শর্তাবলী", url: "/page/terms-of-service" },
        { label: "DMCA", url: "/page/dmca" },
      ],
    },
  ];

  // Use DB sections if available, otherwise fallback — always exactly 3
  const displaySections = sections.length > 0 ? sections.slice(0, 3) : fallbackSections;

  const renderLink = (label: string, url: string) =>
    url.startsWith("http") ? (
      <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{label}</a>
    ) : (
      <Link to={url} className="hover:text-primary transition-colors">{label}</Link>
    );

  return (
    <footer className="border-t border-border mt-auto bg-muted/40">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <img src={settings?.site_logo || defaultLogo} alt={settings?.site_name || "FileServer"} className="h-8 object-contain" />
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Your trusted source for software, apps, games, and digital content. Fast downloads, always free.
            </p>
          </div>

          {/* 3 Menu Columns */}
          {displaySections.map((section, idx) => (
            <div key={idx}>
              <h4 className="font-semibold text-xs mb-3 text-foreground uppercase tracking-wider">{section.title}</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {section.links.map((link: any, i: number) => (
                  <li key={link.id || link.url || i}>
                    {renderLink(link.label, link.url)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} {settings?.site_name || "FileServer"}.com.bd — All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.length > 0 ? socialLinks.map(({ url, Icon }, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon className="h-4 w-4" />
              </a>
            )) : (
              [Facebook, Youtube, Telegram].map((Icon, i) => (
                <a key={i} href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
