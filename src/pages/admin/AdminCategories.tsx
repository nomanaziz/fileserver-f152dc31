import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

function slugify(text: string) { return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

export default function AdminCategories() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [parentId, setParentId] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => { const { data, error } = await supabase.from("categories").select("*").order("sort_order"); if (error) throw error; return data; },
  });
  const parents = categories?.filter(c => !c.parent_id) || [];

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { name, slug: slug || slugify(name), description: description || null, icon: icon || null, parent_id: parentId || null, sort_order: sortOrder, is_active: isActive };
      if (editId) { const { error } = await supabase.from("categories").update(payload).eq("id", editId); if (error) throw error; }
      else { const { error } = await supabase.from("categories").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-categories"] }); setDialogOpen(false); resetForm(); toast.success("Category saved!"); },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("categories").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-categories"] }); toast.success("Category deleted"); },
  });
  const resetForm = () => { setName(""); setSlug(""); setDescription(""); setIcon(""); setParentId(""); setSortOrder(0); setIsActive(true); setEditId(null); };
  const openEdit = (cat: any) => { setName(cat.name); setSlug(cat.slug); setDescription(cat.description || ""); setIcon(cat.icon || ""); setParentId(cat.parent_id || ""); setSortOrder(cat.sort_order); setIsActive(cat.is_active); setEditId(cat.id); setDialogOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Categories ({categories?.length || 0})</h2>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Category</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "Edit" : "New"} Category</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => { setName(e.target.value); if (!editId) setSlug(slugify(e.target.value)); }} /></div>
              <div className="space-y-2"><Label>Slug</Label><Input value={slug} onChange={e => setSlug(e.target.value)} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} /></div>
              <div className="space-y-2"><Label>Icon</Label><Input value={icon} onChange={e => setIcon(e.target.value)} /></div>
              <div className="space-y-2"><Label>Parent</Label><Select value={parentId || "none"} onValueChange={v => setParentId(v === "none" ? "" : v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">— None —</SelectItem>{parents.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} /></div><div className="flex items-center gap-2 pt-6"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label>Active</Label></div></div>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !name.trim()} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <div className="animate-pulse h-48 bg-card rounded-xl" /> : (
        <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Parent</TableHead><TableHead>Order</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>{categories?.map(cat => (
            <TableRow key={cat.id}>
              <TableCell className="font-medium">{cat.parent_id ? "  └ " : ""}{cat.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{cat.slug}</TableCell>
              <TableCell className="text-sm">{cat.parent_id ? parents.find(p => p.id === cat.parent_id)?.name || "—" : "—"}</TableCell>
              <TableCell>{cat.sort_order}</TableCell>
              <TableCell><Badge variant={cat.is_active ? "default" : "secondary"}>{cat.is_active ? "Active" : "Inactive"}</Badge></TableCell>
              <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(cat)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(cat.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      )}
    </div>
  );
}
