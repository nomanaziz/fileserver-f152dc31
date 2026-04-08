import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function AdminSubscriptions() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState(""); const [description, setDescription] = useState(""); const [price, setPrice] = useState(0);
  const [durationDays, setDurationDays] = useState(30); const [features, setFeatures] = useState("");
  const [dailyLimit, setDailyLimit] = useState(5); const [totalLimit, setTotalLimit] = useState(50);

  const { data: plans } = useQuery({ queryKey: ["admin-subscription-plans"], queryFn: async () => { const { data, error } = await supabase.from("subscription_plans").select("*").order("price"); if (error) throw error; return data; } });
  const { data: subCounts } = useQuery({ queryKey: ["admin-sub-counts"], queryFn: async () => { const { data, error } = await supabase.from("subscriptions").select("plan_id, is_active"); if (error) throw error; const counts: Record<string, number> = {}; data?.forEach(s => { if (s.is_active) counts[s.plan_id] = (counts[s.plan_id] || 0) + 1; }); return counts; } });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { name, description: description || null, price, duration_days: durationDays, features: features.split("\n").map(f => f.trim()).filter(Boolean), daily_download_limit: dailyLimit, total_download_limit: totalLimit } as any;
      if (editId) { const { error } = await supabase.from("subscription_plans").update(payload).eq("id", editId); if (error) throw error; }
      else { const { error } = await supabase.from("subscription_plans").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-subscription-plans"] }); setDialogOpen(false); resetForm(); toast.success("Plan saved!"); },
    onError: (e: any) => toast.error(e.message),
  });
  const toggleMutation = useMutation({ mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => { const { error } = await supabase.from("subscription_plans").update({ is_active }).eq("id", id); if (error) throw error; }, onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-subscription-plans"] }) });
  const deleteMutation = useMutation({ mutationFn: async (id: string) => { const { error } = await supabase.from("subscription_plans").delete().eq("id", id); if (error) throw error; }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-subscription-plans"] }); toast.success("Plan deleted"); } });
  const resetForm = () => { setName(""); setDescription(""); setPrice(0); setDurationDays(30); setFeatures(""); setDailyLimit(5); setTotalLimit(50); setEditId(null); };
  const openEdit = (plan: any) => { setName(plan.name); setDescription(plan.description || ""); setPrice(plan.price); setDurationDays(plan.duration_days); setFeatures((plan.features || []).join("\n")); setDailyLimit(plan.daily_download_limit ?? 5); setTotalLimit(plan.total_download_limit ?? 50); setEditId(plan.id); setDialogOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Subscription Plans ({plans?.length || 0})</h2>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Plan</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "Edit" : "New"} Plan</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Description</Label><Input value={description} onChange={e => setDescription(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Price (৳)</Label><Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} /></div><div className="space-y-2"><Label>Duration (days)</Label><Input type="number" value={durationDays} onChange={e => setDurationDays(Number(e.target.value))} /></div></div>
              <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Daily Limit</Label><Input type="number" value={dailyLimit} onChange={e => setDailyLimit(Number(e.target.value))} /></div><div className="space-y-2"><Label>Total Limit</Label><Input type="number" value={totalLimit} onChange={e => setTotalLimit(Number(e.target.value))} /></div></div>
              <div className="space-y-2"><Label>Features (one per line)</Label><Textarea value={features} onChange={e => setFeatures(e.target.value)} rows={4} /></div>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !name.trim()} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Price</TableHead><TableHead>Duration</TableHead><TableHead>Limits</TableHead><TableHead>Subscribers</TableHead><TableHead>Active</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
        <TableBody>{plans?.map(p => (
          <TableRow key={p.id}>
            <TableCell className="font-medium">{p.name}</TableCell><TableCell>৳{p.price}</TableCell><TableCell>{p.duration_days} days</TableCell>
            <TableCell className="text-xs">{(p as any).daily_download_limit ?? 5}/day, {(p as any).total_download_limit ?? 50} total</TableCell>
            <TableCell><Badge variant="outline">{subCounts?.[p.id] || 0}</Badge></TableCell>
            <TableCell><Switch checked={p.is_active} onCheckedChange={v => toggleMutation.mutate({ id: p.id, is_active: v })} /></TableCell>
            <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
    </div>
  );
}
