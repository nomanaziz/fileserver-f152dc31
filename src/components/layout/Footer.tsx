import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Github, Twitter, Youtube, Facebook, Send as Telegram, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import defaultLogo from "@/assets/fileserver-white-logo.png";

const socialIcons: Record<string, any> = {
  facebook_url: Facebook,
  twitter_url: Twitter,
  youtube_url: Youtube,
  telegram_url: Telegram,
  whatsapp_url: MessageCircle,
};

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

  // Group menu items: parent items (no parent_id) become section headers, children become links
  const parentItems = menuItems?.filter(item => !item.parent_id) || [];
  const childItems = menuItems?.filter(item => item.parent_id) || [];

  const sections = parentItems.map(parent => ({
    title: parent.label,
    url: parent.url,
    links: childItems.filter(child => child.parent_id === parent.id),
  }));

  // Standalone items (no parent, no children pointing to them) go into a general section
  const parentIds = new Set(childItems.map(c => c.parent_id));
  const standaloneItems = parentItems.filter(p => !parentIds.has(p.id));

  const socialLinks = Object.entries(socialIcons)
    .filter(([key]) => settings?.[key])
    .map(([key, Icon]) => ({ url: settings![key], Icon }));

  return (
    <footer className="border-t border-border mt-auto bg-muted/40">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <img src={settings?.site_logo || defaultLogo} alt={settings?.site_name || "FileServer"} className="h-8 object-contain" />
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4 max-w-xs">
              Your trusted source for software, apps, games, and digital content. Fast downloads, always free.
            </p>
            <div className="flex gap-2">
              <Input placeholder="Your email" className="h-8 text-xs bg-background border-border max-w-[200px]" />
              <Button size="sm" className="h-8 text-xs px-3">
                <Mail className="h-3 w-3 mr-1" />
                Subscribe
              </Button>
            </div>
          </div>

          {/* Dynamic footer sections from admin */}
          {sections.filter(s => s.links.length > 0).map((section, idx) => (
            <div key={idx}>
              <h4 className="font-semibold text-xs mb-3 text-foreground uppercase tracking-wider">{section.title}</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {section.links.map(link => (
                  <li key={link.id}>
                    {link.url.startsWith("http") ? (
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{link.label}</a>
                    ) : (
                      <Link to={link.url} className="hover:text-primary transition-colors">{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Standalone footer links (items without children) */}
          {standaloneItems.length > 0 && (
            <div>
              <h4 className="font-semibold text-xs mb-3 text-foreground uppercase tracking-wider">লিংক</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {standaloneItems.map(item => (
                  <li key={item.id}>
                    {item.url.startsWith("http") ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{item.label}</a>
                    ) : (
                      <Link to={item.url} className="hover:text-primary transition-colors">{item.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fallback if no menu items exist */}
          {(!menuItems || menuItems.length === 0) && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">
                Admin Panel → Menu Items থেকে footer লিংক যোগ করুন।
              </p>
            </div>
          )}
        </div>

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
              [Github, Twitter, Youtube].map((Icon, i) => (
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
