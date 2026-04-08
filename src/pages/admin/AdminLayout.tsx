import { Navigate, Link, Outlet, useLocation } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Package, FolderTree, Users, CreditCard,
  Server, MessageSquare, FileText, Newspaper, Menu as MenuIcon,
  Image, Tag, Tv, Settings, Activity, Mail, Shield, Star,
  BarChart3, Globe, Wallet, LogOut, ExternalLink
} from "lucide-react";

const adminLinks = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Categories", url: "/admin/categories", icon: FolderTree },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Orders", url: "/admin/orders", icon: CreditCard },
  { title: "Payments", url: "/admin/payment-methods", icon: Wallet },
  { title: "Requests", url: "/admin/requests", icon: MessageSquare },
  { title: "Reviews", url: "/admin/reviews", icon: Star },
  { title: "Subscriptions", url: "/admin/subscriptions", icon: Tag },
  { title: "Coupons", url: "/admin/coupons", icon: Tag },
  { title: "Servers", url: "/admin/servers", icon: Server },
  { title: "Scraping", url: "/admin/scraping", icon: Globe },
  { title: "Ads", url: "/admin/ads", icon: Image },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Activity Log", url: "/admin/activity", icon: Activity },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

const cmsLinks = [
  { title: "Blog Posts", url: "/admin/blog", icon: Newspaper },
  { title: "Pages", url: "/admin/pages", icon: FileText },
  { title: "Menu Items", url: "/admin/menu", icon: MenuIcon },
  { title: "Messages", url: "/admin/messages", icon: Mail },
  { title: "Live Chat", url: "/admin/chat", icon: MessageSquare },
  { title: "Live TV", url: "/admin/live-tv", icon: Tv },
];

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
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
                Admin Panel
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

            <SidebarGroup>
              <SidebarGroupLabel>CMS</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {cmsLinks.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
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
          <header className="h-14 flex items-center justify-between border-b px-4 bg-card">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <span className="font-semibold text-lg">Admin Panel</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <Button variant="outline" size="sm" asChild>
                <Link to="/"><ExternalLink className="h-3 w-3 mr-1" /> View Site</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-3 w-3 mr-1" /> Sign Out
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
