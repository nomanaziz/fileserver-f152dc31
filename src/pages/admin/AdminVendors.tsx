import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ShieldCheck, Ban, CheckCircle, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminVendors() {
  const qc = useQueryClient();

  const { data: vendors } = useQuery({
    queryKey: ["admin-vendors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendor_profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: vendorProducts } = useQuery({
    queryKey: ["admin-vendor-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name), vendor_profiles!products_vendor_id_fkey(store_name)")
        .eq("is_vendor_product", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: payouts } = useQuery({
    queryKey: ["admin-vendor-payouts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendor_payouts").select("*, vendor_profiles!vendor_payouts_vendor_id_fkey(store_name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, verified }: { id: string; verified: boolean }) => {
      const { error } = await supabase.from("vendor_profiles").update({ is_verified: verified }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-vendors"] }); toast.success("আপডেট হয়েছে"); },
  });

  const approveProductMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const update: any = { vendor_status: status };
      if (status === "approved") update.status = "published";
      const { error } = await supabase.from("products").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-vendor-products"] }); toast.success("আপডেট হয়েছে"); },
  });

  const payoutMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("vendor_payouts").update({ status, processed_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-vendor-payouts"] }); toast.success("আপডেট হয়েছে"); },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">ভেন্ডর ম্যানেজমেন্ট</h2>

      <Tabs defaultValue="vendors">
        <TabsList>
          <TabsTrigger value="vendors">ভেন্ডর ({vendors?.length || 0})</TabsTrigger>
          <TabsTrigger value="products">প্রোডাক্ট ({vendorProducts?.length || 0})</TabsTrigger>
          <TabsTrigger value="payouts">পেআউট ({payouts?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="vendors">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>স্টোর</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead>কমিশন</TableHead>
                <TableHead>আয়</TableHead>
                <TableHead>ব্যালেন্স</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors?.map((v: any) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.store_name}</TableCell>
                  <TableCell>
                    {v.is_verified
                      ? <Badge className="gap-1"><ShieldCheck className="h-3 w-3" /> ভেরিফাইড</Badge>
                      : <Badge variant="secondary">পেন্ডিং</Badge>
                    }
                  </TableCell>
                  <TableCell>{v.commission_rate}%</TableCell>
                  <TableCell>৳{v.total_earnings}</TableCell>
                  <TableCell>৳{v.available_balance}</TableCell>
                  <TableCell className="text-right">
                    {!v.is_verified ? (
                      <Button size="sm" variant="outline" onClick={() => verifyMutation.mutate({ id: v.id, verified: true })}>
                        <CheckCircle className="h-3 w-3 mr-1" /> ভেরিফাই
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => verifyMutation.mutate({ id: v.id, verified: false })}>
                        <Ban className="h-3 w-3 mr-1" /> সাসপেন্ড
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="products">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>টাইটেল</TableHead>
                <TableHead>ভেন্ডর</TableHead>
                <TableHead>দাম</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendorProducts?.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>{(p as any).vendor_profiles?.store_name || "—"}</TableCell>
                  <TableCell>{p.is_paid ? `৳${p.price}` : "ফ্রি"}</TableCell>
                  <TableCell>
                    <Badge variant={p.vendor_status === "approved" ? "default" : p.vendor_status === "rejected" ? "destructive" : "secondary"}>
                      {p.vendor_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {p.vendor_status === "pending" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => approveProductMutation.mutate({ id: p.id, status: "approved" })}>
                          <CheckCircle className="h-3 w-3 mr-1" /> অনুমোদন
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => approveProductMutation.mutate({ id: p.id, status: "rejected" })}>
                          <XCircle className="h-3 w-3 mr-1" /> বাতিল
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="payouts">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ভেন্ডর</TableHead>
                <TableHead>পরিমাণ</TableHead>
                <TableHead>মেথড</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts?.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>{(p as any).vendor_profiles?.store_name || "—"}</TableCell>
                  <TableCell className="font-medium">৳{p.amount}</TableCell>
                  <TableCell>{p.payment_method || "—"}</TableCell>
                  <TableCell><Badge variant={p.status === "paid" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
                  <TableCell className="text-right space-x-1">
                    {p.status === "pending" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => payoutMutation.mutate({ id: p.id, status: "paid" })}>
                          <CheckCircle className="h-3 w-3 mr-1" /> পেইড
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => payoutMutation.mutate({ id: p.id, status: "rejected" })}>
                          <XCircle className="h-3 w-3 mr-1" /> বাতিল
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
