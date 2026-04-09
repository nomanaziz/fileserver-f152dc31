import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, Users, Download, CreditCard, Star, MessageSquare, Tag, ShoppingCart, Heart, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, profiles, payments, reviews, downloads, requests, pendingReviews, activeSubs, pendingOrders, cartItems, favorites, abandonedCheckouts] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("amount"),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
        supabase.from("download_history").select("id", { count: "exact", head: true }),
        supabase.from("software_requests").select("id", { count: "exact", head: true }),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("is_approved", false),
        supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("cart_items").select("id", { count: "exact", head: true }),
        supabase.from("favorites").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      const totalRevenue = payments.data?.reduce((s: number, p: any) => s + Number(p.amount), 0) || 0;
      return {
        products: products.count || 0,
        users: profiles.count || 0,
        revenue: totalRevenue,
        reviews: reviews.count || 0,
        downloads: downloads.count || 0,
        requests: requests.count || 0,
        pendingReviews: pendingReviews.count || 0,
        activeSubs: activeSubs.count || 0,
        pendingOrders: pendingOrders.count || 0,
        cartItems: cartItems.count || 0,
        favorites: favorites.count || 0,
        abandonedCheckouts: abandonedCheckouts.count || 0,
      };
    },
  });

  const { data: recentProducts } = useQuery({
    queryKey: ["admin-recent-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, title, status, created_at, download_count, view_count")
        .order("created_at", { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  const { data: topDownloaded } = useQuery({
    queryKey: ["admin-top-downloaded"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, title, download_count, view_count")
        .order("download_count", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const { data: recentLogs } = useQuery({
    queryKey: ["admin-recent-logs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  const mainCards = [
    { title: "Total Products", value: stats?.products || 0, icon: Package, color: "text-blue-500" },
    { title: "Total Users", value: stats?.users || 0, icon: Users, color: "text-green-500" },
    { title: "Total Revenue", value: `৳${stats?.revenue || 0}`, icon: CreditCard, color: "text-yellow-500" },
    { title: "Total Downloads", value: stats?.downloads || 0, icon: Download, color: "text-purple-500" },
  ];

  const secondaryCards = [
    { title: "Pending Reviews", value: stats?.pendingReviews || 0, icon: Star, color: "text-orange-500" },
    { title: "Active Subs", value: stats?.activeSubs || 0, icon: Tag, color: "text-cyan-500" },
    { title: "Pending Orders", value: stats?.pendingOrders || 0, icon: MessageSquare, color: "text-pink-500" },
    { title: "Cart Items", value: stats?.cartItems || 0, icon: ShoppingCart, color: "text-emerald-500" },
    { title: "Total Favorites", value: stats?.favorites || 0, icon: Heart, color: "text-red-500" },
    { title: "Abandoned Checkouts", value: stats?.abandonedCheckouts || 0, icon: AlertTriangle, color: "text-amber-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {mainCards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {secondaryCards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Recent Uploads</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProducts?.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell><Badge variant={p.status === "published" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
                    <TableCell>{p.download_count}</TableCell>
                    <TableCell>{p.view_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Downloaded</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topDownloaded?.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>{p.download_count}</TableCell>
                    <TableCell>{p.view_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLogs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{JSON.stringify(log.details)}</TableCell>
                    <TableCell className="text-sm">{new Date(log.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {recentLogs?.length === 0 && (
                  <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-4">No activity yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
