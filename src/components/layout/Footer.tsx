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

  const socialLinks = Object.entries(socialIcons)
    .filter(([key]) => settings?.[key])
    .map(([key, Icon]) => ({ url: settings![key], Icon }));

  return (
    <footer className="border-t border-border mt-auto bg-muted/40">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
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

          <div>
            <h4 className="font-semibold text-xs mb-3 text-foreground uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/category/software" className="hover:text-primary transition-colors">Software</Link></li>
              <li><Link to="/category/android" className="hover:text-primary transition-colors">Android</Link></li>
              <li><Link to="/category/games" className="hover:text-primary transition-colors">Games</Link></li>
              <li><Link to="/category/movies" className="hover:text-primary transition-colors">Movies</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-xs mb-3 text-foreground uppercase tracking-wider">More</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/page/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-xs mb-3 text-foreground uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/page/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/page/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/page/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              {menuItems?.map(item => (
                <li key={item.id}><Link to={item.url} className="hover:text-primary transition-colors">{item.label}</Link></li>
              ))}
            </ul>
          </div>
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