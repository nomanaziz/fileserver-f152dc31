import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ShieldCheck, Ban, CheckCircle, XCircle, Edit2, Trash2, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVendorTiers } from "@/hooks/useVendor";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

function TierBadge({ tier }: { tier: any }) {
  if (!tier) return <Badge variant="secondary">—</Badge>;
  return (
    <Badge style={{ backgroundColor: tier.color, color: "#fff" }} className="gap-1">
      {tier.name}
    </Badge>
  );
}

function TiersTab() {
  const qc = useQueryClient();
  const { data: tiers } = useVendorTiers();
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", slug: "", commission_rate: 20, min_sales_count: 0, min_total_earnings: 0, color: "#CD7F32", sort_order: 0 });

  const saveMutation = useMutation({
    mutationFn: async (tier: any) => {
      if (tier.id) {
        const { error } = await supabase.from("vendor_tiers").update({
          name: tier.name, slug: tier.slug, commission_rate: tier.commission_rate,
          min_sales_count: tier.min_sales_count, min_total_earnings: tier.min_total_earnings,
          color: tier.color, sort_order: tier.sort_order,
        }).eq("id", tier.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("vendor_tiers").insert(tier);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vendor-tiers"] }); toast.success("সেভ হয়েছে"); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vendor_tiers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vendor-tiers"] }); toast.success("ডিলিট হয়েছে"); },
  });

  const openEdit = (tier?: any) => {
    if (tier) {
      setForm({ name: tier.name, slug: tier.slug, commission_rate: tier.commission_rate, min_sales_count: tier.min_sales_count, min_total_earnings: tier.min_total_earnings, color: tier.color, sort_order: tier.sort_order });
      setEditing(tier);
    } else {
      setForm({ name: "", slug: "", commission_rate: 20, min_sales_count: 0, min_total_earnings: 0, color: "#CD7F32", sort_order: (tiers?.length || 0) + 1 });
      setEditing({});
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => openEdit()}><Plus className="h-3 w-3 mr-1" /> নতুন টিয়ার</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>নাম</TableHead>
            <TableHead>কমিশন</TableHead>
            <TableHead>মিনিমাম বিক্রি</TableHead>
            <TableHead>মিনিমাম আয়</TableHead>
            <TableHead>রঙ</TableHead>
            <TableHead className="text-right">অ্যাকশন</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tiers?.map((t: any) => (
            <TableRow key={t.id}>
              <TableCell><TierBadge tier={t} /></TableCell>
              <TableCell>{t.commission_rate}%</TableCell>
              <TableCell>{t.min_sales_count}</TableCell>
              <TableCell>৳{t.min_total_earnings}</TableCell>
              <TableCell><div className="w-6 h-6 rounded-full border" style={{ backgroundColor: t.color }} /></TableCell>
              <TableCell className="text-right space-x-1">
                <Button size="sm" variant="outline" onClick={() => openEdit(t)}><Edit2 className="h-3 w-3" /></Button>
                <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(t.id)}><Trash2 className="h-3 w-3" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "টিয়ার এডিট" : "নতুন টিয়ার"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>নাম</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>কমিশন %</Label><Input type="number" value={form.commission_rate} onChange={e => setForm({ ...form, commission_rate: +e.target.value })} /></div>
              <div><Label>সর্ট অর্ডার</Label><Input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: +e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>মিনিমাম বিক্রি</Label><Input type="number" value={form.min_sales_count} onChange={e => setForm({ ...form, min_sales_count: +e.target.value })} /></div>
              <div><Label>মিনিমাম আয় (৳)</Label><Input type="number" value={form.min_total_earnings} onChange={e => setForm({ ...form, min_total_earnings: +e.target.value })} /></div>
            </div>
            <div><Label>রঙ</Label><Input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="h-10 w-20" /></div>
            <Button onClick={() => saveMutation.mutate(editing?.id ? { ...form, id: editing.id } : form)} className="w-full">
              {editing?.id ? "আপডেট" : "তৈরি করুন"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminVendors() {
  const qc = useQueryClient();
  const { data: tiers } = useVendorTiers();

  const { data: vendors } = useQuery({
    queryKey: ["admin-vendors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendor_profiles").select("*, vendor_tiers(*)").order("created_at", { ascending: false });
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

  const tierOverrideMutation = useMutation({
    mutationFn: async ({ vendorId, tierId }: { vendorId: string; tierId: string }) => {
      const tier = tiers?.find((t: any) => t.id === tierId);
      const { error } = await supabase.from("vendor_profiles").update({
        tier_id: tierId,
        commission_rate: tier?.commission_rate ?? 20,
      }).eq("id", vendorId);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-vendors"] }); toast.success("টিয়ার আপডেট হয়েছে"); },
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
          <TabsTrigger value="tiers">টিয়ার</TabsTrigger>
        </TabsList>

        <TabsContent value="vendors">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>স্টোর</TableHead>
                <TableHead>টিয়ার</TableHead>
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
                    <Select value={v.tier_id || ""} onValueChange={(val) => tierOverrideMutation.mutate({ vendorId: v.id, tierId: val })}>
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue>
                          {v.vendor_tiers ? <TierBadge tier={v.vendor_tiers} /> : "—"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {tiers?.map((t: any) => (
                          <SelectItem key={t.id} value={t.id}>
                            <span style={{ color: t.color }} className="font-semibold">{t.name}</span> ({t.commission_rate}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
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

        <TabsContent value="tiers">
          <TiersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
