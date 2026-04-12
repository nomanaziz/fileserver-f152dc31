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
import ImageUploadField from "@/components/ImageUploadField";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminPaymentMethods() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [color, setColor] = useState("#000000");
  const [sortOrder, setSortOrder] = useState(0);
  const [accountType, setAccountType] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [instructions, setInstructions] = useState("");

  const { data: methods } = useQuery({
    queryKey: ["admin-payment-methods"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payment_methods" as any).select("*").order("sort_order");
      if (error) throw error;
      return data as any[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name, slug: slug || slugify(name), logo_url: logoUrl || null, color,
        sort_order: sortOrder, account_type: accountType || null,
        account_number: accountNumber || null, bank_name: bankName || null,
        branch_name: branchName || null, routing_number: routingNumber || null,
        instructions: instructions || null,
      };
      if (editId) {
        const { error } = await (supabase.from("payment_methods" as any) as any).update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from("payment_methods" as any) as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-payment-methods"] });
      setDialogOpen(false);
      resetForm();
      toast.success("Payment method saved!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await (supabase.from("payment_methods" as any) as any).update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-payment-methods"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("payment_methods" as any) as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-payment-methods"] });
      toast.success("Payment method deleted");
    },
  });

  const resetForm = () => {
    setName(""); setSlug(""); setLogoUrl(""); setColor("#000000"); setSortOrder(0);
    setAccountType(""); setAccountNumber(""); setBankName(""); setBranchName("");
    setRoutingNumber(""); setInstructions(""); setEditId(null);
  };

  const openEdit = (m: any) => {
    setName(m.name); setSlug(m.slug); setLogoUrl(m.logo_url || ""); setColor(m.color || "#000000");
    setSortOrder(m.sort_order); setAccountType(m.account_type || "");
    setAccountNumber(m.account_number || ""); setBankName(m.bank_name || "");
    setBranchName(m.branch_name || ""); setRoutingNumber(m.routing_number || "");
    setInstructions(m.instructions || ""); setEditId(m.id);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Payment Methods ({methods?.length || 0})</h2>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Method</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? "Edit" : "New"} Payment Method</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => { setName(e.target.value); if (!editId) setSlug(slugify(e.target.value)); }} /></div>
                <div className="space-y-2"><Label>Slug</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <ImageUploadField value={logoUrl} onChange={setLogoUrl} folder="payment-methods" label="লোগো" maxWidth={200} />
                <div className="space-y-2"><Label>Color</Label><Input type="color" value={color} onChange={(e) => setColor(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Account Type</Label><Input value={accountType} onChange={(e) => setAccountType(e.target.value)} placeholder="Personal / Agent" /></div>
                <div className="space-y-2"><Label>Account Number</Label><Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Bank Name</Label><Input value={bankName} onChange={(e) => setBankName(e.target.value)} /></div>
                <div className="space-y-2"><Label>Branch Name</Label><Input value={branchName} onChange={(e) => setBranchName(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Routing Number</Label><Input value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value)} /></div>
                <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} /></div>
              </div>
              <div className="space-y-2"><Label>Instructions</Label><Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} placeholder="Payment instructions for customers..." /></div>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !name.trim()} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Bank</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {methods?.map((m: any) => (
            <TableRow key={m.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                  {m.name}
                </div>
              </TableCell>
              <TableCell className="text-sm">{m.account_number || "—"}</TableCell>
              <TableCell className="text-sm">{m.bank_name || "—"}</TableCell>
              <TableCell>{m.sort_order}</TableCell>
              <TableCell>
                <Switch checked={m.is_active} onCheckedChange={(v) => toggleMutation.mutate({ id: m.id, is_active: v })} />
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(m)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {(!methods || methods.length === 0) && (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No payment methods yet</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
