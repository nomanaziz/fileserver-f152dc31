import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Download, Heart, User, ShoppingBag, FileText } from "lucide-react";

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const { data: favorites } = useFavorites();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");

  const { data: downloadHistory } = useQuery({
    queryKey: ["download-history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("download_history")
        .select("*, products(title, slug)")
        .eq("user_id", user!.id)
        .order("downloaded_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: payments } = useQuery({
    queryKey: ["payments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*, products(title)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!loading && !user) return <Navigate to="/login" />;
  if (loading) return null;

  const updateProfile = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, phone } as any)
      .eq("id", user!.id);
    if (error) toast.error("আপডেট ব্যর্থ হয়েছে");
    else toast.success("প্রোফাইল আপডেট হয়েছে!");
  };

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">ড্যাশবোর্ড</h1>
        <Tabs defaultValue="profile">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="profile"><User className="h-4 w-4 mr-1" /> প্রোফাইল</TabsTrigger>
            <TabsTrigger value="favorites"><Heart className="h-4 w-4 mr-1" /> ফেভারিট</TabsTrigger>
            <TabsTrigger value="downloads"><Download className="h-4 w-4 mr-1" /> ডাউনলোড</TabsTrigger>
            <TabsTrigger value="purchases"><ShoppingBag className="h-4 w-4 mr-1" /> পারচেজ</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader><CardTitle>প্রোফাইল সেটিংস</CardTitle></CardHeader>
              <CardContent className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label>ইমেইল</Label>
                  <Input value={user?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label>নাম</Label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>ফোন</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <Button onClick={updateProfile}>সেভ করুন</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {favorites?.map((fav: any) => (
                <Link key={fav.id} to={`/product/${fav.products?.slug}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm">{fav.products?.title}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {favorites?.length === 0 && <p className="col-span-full text-muted-foreground">কোনো ফেভারিট নেই।</p>}
            </div>
          </TabsContent>

          <TabsContent value="downloads">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {downloadHistory?.map((dh: any) => (
                    <div key={dh.id} className="flex items-center justify-between p-4">
                      <span className="text-sm">{dh.products?.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(dh.downloaded_at).toLocaleDateString("bn-BD")}
                      </span>
                    </div>
                  ))}
                  {downloadHistory?.length === 0 && <p className="p-4 text-muted-foreground">কোনো ডাউনলোড ইতিহাস নেই।</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {payments?.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-4">
                      <span className="text-sm">{p.products?.title || "Subscription"}</span>
                      <div className="text-right">
                        <span className="text-sm font-medium">৳{p.amount}</span>
                        <p className="text-xs text-muted-foreground">{p.status}</p>
                      </div>
                    </div>
                  ))}
                  {payments?.length === 0 && <p className="p-4 text-muted-foreground">কোনো পারচেজ নেই।</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
