import { Navigate, Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useVendorProfile } from "@/hooks/useVendor";
import {
  SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, DollarSign, Wallet, Settings, Store, ExternalLink, LogOut } from "lucide-react";

const vendorLinks = [
  { title: "ওভারভিউ", url: "/vendor", icon: LayoutDashboard },
  { title: "প্রোডাক্ট", url: "/vendor/products", icon: Package },
  { title: "আয়", url: "/vendor/earnings", icon: DollarSign },
  { title: "পেআউট", url: "/vendor/payouts", icon: Wallet },
  { title: "সেটিংস", url: "/vendor/settings", icon: Settings },
];

export default function VendorLayout() {
  const { user, signOut } = useAuth();
  const { data: vendorProfile, isLoading } = useVendorProfile();

  if (!user) return <Navigate to="/login" />;
  if (isLoading) return null;
  if (!vendorProfile) return <Navigate to="/become-vendor" />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>
                <Store className="h-4 w-4 mr-2" />
                {vendorProfile.store_name}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {vendorLinks.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} end={item.url === "/vendor"} className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
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
              <span className="font-semibold text-lg">ভেন্ডর প্যানেল</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <Button variant="outline" size="sm" asChild>
                <Link to="/"><ExternalLink className="h-3 w-3 mr-1" /> সাইট দেখুন</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-3 w-3 mr-1" /> সাইন আউট
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
