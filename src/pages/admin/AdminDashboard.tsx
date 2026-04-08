import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, Users, Download, CreditCard } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, profiles, payments] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("amount"),
      ]);
      const totalRevenue = payments.data?.reduce((s: number, p: any) => s + Number(p.amount), 0) || 0;
      return {
        products: products.count || 0,
        users: profiles.count || 0,
        revenue: totalRevenue,
      };
    },
  });

  const cards = [
    { title: "মোট প্রোডাক্ট", value: stats?.products || 0, icon: Package },
    { title: "মোট ইউজার", value: stats?.users || 0, icon: Users },
    { title: "মোট আয়", value: `৳${stats?.revenue || 0}`, icon: CreditCard },
  ];

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">অ্যাডমিন ড্যাশবোর্ড</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <c.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
