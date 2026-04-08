import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminCoupons() {
  const qc = useQueryClient();
  const { data: coupons } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const save = useMutation({
    mutationFn: async (c: any) => {
      const payload = { code: c.code, discount_percent: Number(c.discount_percent), max_uses: c.max_uses ? Number(c.max_uses) : null, expires_at: c.expires_at || null, is_active: c.is_active };
      if (c.id) {
        const { error } = await supabase.from("coupons").update(payload).eq("id", c.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("coupons").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-coupons"] }); setOpen(false); toast.success("Saved!"); },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-coupons"] }); toast.success("Deleted!"); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing({ code: "", discount_percent: 10, max_uses: "", expires_at: "", is_active: true })}><Plus className="h-4 w-4 mr-1" /> Add Coupon</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} Coupon</DialogTitle></DialogHeader>
            {editing && (
              <div className="space-y-4">
                <div className="space-y-2"><Label>Code</Label><Input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Discount %</Label><Input type="number" value={editing.discount_percent} onChange={(e) => setEditing({ ...editing, discount_percent: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Max Uses</Label><Input type="number" value={editing.max_uses || ""} onChange={(e) => setEditing({ ...editing, max_uses: e.target.value })} placeholder="Unlimited" /></div>
                </div>
                <div className="space-y-2"><Label>Expires At</Label><Input type="datetime-local" value={editing.expires_at ? editing.expires_at.slice(0, 16) : ""} onChange={(e) => setEditing({ ...editing, expires_at: e.target.value })} /></div>
                <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
                <Button onClick={() => save.mutate(editing)} className="w-full">Save</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Discount</TableHead><TableHead>Used</TableHead><TableHead>Max Uses</TableHead><TableHead>Expires</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {coupons?.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono font-medium">{c.code}</TableCell>
                <TableCell>{c.discount_percent}%</TableCell>
                <TableCell>{c.used_count}</TableCell>
                <TableCell>{c.max_uses || "∞"}</TableCell>
                <TableCell className="text-sm">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "Never"}</TableCell>
                <TableCell><Badge variant={c.is_active ? "default" : "secondary"}>{c.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete?")) remove.mutate(c.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
