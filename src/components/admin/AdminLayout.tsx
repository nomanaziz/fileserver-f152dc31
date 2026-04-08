import { ReactNode } from "react";
import { Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, Package, FolderTree, Users, CreditCard,
  Server, MessageSquare, FileText, Newspaper, Menu as MenuIcon,
  Image, Tag, Tv, Settings, Activity, Mail, Shield
} from "lucide-react";

const adminLinks = [
  { title: "ড্যাশবোর্ড", url: "/admin", icon: LayoutDashboard },
  { title: "প্রোডাক্ট", url: "/admin/products", icon: Package },
  { title: "ক্যাটাগরি", url: "/admin/categories", icon: FolderTree },
  { title: "ইউজার", url: "/admin/users", icon: Users },
  { title: "পেমেন্ট", url: "/admin/payments", icon: CreditCard },
  { title: "সার্ভার", url: "/admin/servers", icon: Server },
  { title: "রিভিউ", url: "/admin/reviews", icon: MessageSquare },
  { title: "ব্লগ", url: "/admin/blog", icon: Newspaper },
  { title: "পেজ", url: "/admin/pages", icon: FileText },
  { title: "মেনু", url: "/admin/menu", icon: MenuIcon },
  { title: "বিজ্ঞাপন", url: "/admin/ads", icon: Image },
  { title: "কুপন", url: "/admin/coupons", icon: Tag },
  { title: "লাইভ টিভি", url: "/admin/live-tv", icon: Tv },
  { title: "মেসেজ", url: "/admin/messages", icon: Mail },
  { title: "অ্যাক্টিভিটি লগ", url: "/admin/logs", icon: Activity },
  { title: "সেটিংস", url: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (!loading && !user) return <Navigate to="/login" />;
  if (!loading && !isAdmin) return <Navigate to="/" />;
  if (loading) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>
                <Shield className="h-4 w-4 mr-2" />
                অ্যাডমিন
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminLinks.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === "/admin"}
                          className="hover:bg-muted/50"
                          activeClassName="bg-muted text-primary font-medium"
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b px-4 bg-card">
            <SidebarTrigger className="mr-4" />
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← সাইটে ফিরে যান
            </Link>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
