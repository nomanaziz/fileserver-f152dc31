import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function AdminCoupons() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [code, setCode] = useState(""); const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState(10); const [maxUses, setMaxUses] = useState<number | "">(100); const [expiresAt, setExpiresAt] = useState("");

  const { data: coupons } = useQuery({ queryKey: ["admin-coupons"], queryFn: async () => { const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false }); if (error) throw error; return data; } });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { code: code.toUpperCase(), discount_type: discountType, discount_value: discountValue, discount_percent: discountType === "percent" ? discountValue : 0, max_uses: maxUses || null, expires_at: expiresAt || null } as any;
      if (editId) { const { error } = await supabase.from("coupons").update(payload).eq("id", editId); if (error) throw error; }
      else { const { error } = await supabase.from("coupons").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-coupons"] }); setDialogOpen(false); resetForm(); toast.success("Coupon saved!"); },
    onError: (e: any) => toast.error(e.message),
  });
  const toggleMutation = useMutation({ mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => { const { error } = await supabase.from("coupons").update({ is_active }).eq("id", id); if (error) throw error; }, onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coupons"] }) });
  const deleteMutation = useMutation({ mutationFn: async (id: string) => { const { error } = await supabase.from("coupons").delete().eq("id", id); if (error) throw error; }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-coupons"] }); toast.success("Coupon deleted"); } });
  const resetForm = () => { setCode(""); setDiscountType("percent"); setDiscountValue(10); setMaxUses(100); setExpiresAt(""); setEditId(null); };
  const openEdit = (c: any) => { setCode(c.code); setDiscountType(c.discount_type || "percent"); setDiscountValue(c.discount_value || c.discount_percent || 10); setMaxUses(c.max_uses ?? ""); setExpiresAt(c.expires_at ? c.expires_at.split("T")[0] : ""); setEditId(c.id); setDialogOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Coupons ({coupons?.length || 0})</h2>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Coupon</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "Edit" : "New"} Coupon</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Code</Label><Input value={code} onChange={e => setCode(e.target.value)} placeholder="SAVE20" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Type</Label><Select value={discountType} onValueChange={setDiscountType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percent">Percentage (%)</SelectItem><SelectItem value="fixed">Fixed (৳)</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Value</Label><Input type="number" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Max Uses</Label><Input type="number" value={maxUses} onChange={e => setMaxUses(e.target.value ? Number(e.target.value) : "")} /></div>
                <div className="space-y-2"><Label>Expires</Label><Input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} /></div>
              </div>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !code.trim()} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Table><TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Discount</TableHead><TableHead>Used</TableHead><TableHead>Max</TableHead><TableHead>Expires</TableHead><TableHead>Active</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
        <TableBody>{coupons?.map(c => (
          <TableRow key={c.id}>
            <TableCell className="font-mono font-medium">{c.code}</TableCell>
            <TableCell>{(c as any).discount_type === "fixed" ? `৳${(c as any).discount_value || c.discount_percent}` : `${(c as any).discount_value || c.discount_percent}%`}</TableCell>
            <TableCell>{c.used_count}</TableCell><TableCell>{c.max_uses ?? "∞"}</TableCell>
            <TableCell className="text-sm">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "Never"}</TableCell>
            <TableCell><Switch checked={c.is_active} onCheckedChange={v => toggleMutation.mutate({ id: c.id, is_active: v })} /></TableCell>
            <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
    </div>
  );
}
