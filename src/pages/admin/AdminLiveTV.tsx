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
import ImageUploadField from "@/components/ImageUploadField";

export default function AdminLiveTV() {
  const qc = useQueryClient();
  const { data: channels } = useQuery({
    queryKey: ["admin-live-tv"],
    queryFn: async () => {
      const { data, error } = await supabase.from("live_channels").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const save = useMutation({
    mutationFn: async (c: any) => {
      const payload = { name: c.name, stream_url: c.stream_url, thumbnail_url: c.thumbnail_url, category: c.category, sort_order: Number(c.sort_order) || 0, is_active: c.is_active };
      if (c.id) {
        const { error } = await supabase.from("live_channels").update(payload).eq("id", c.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("live_channels").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-live-tv"] }); setOpen(false); toast.success("Saved!"); },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("live_channels").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-live-tv"] }); toast.success("Deleted!"); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Live TV Channels</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing({ name: "", stream_url: "", thumbnail_url: "", category: "", sort_order: 0, is_active: true })}><Plus className="h-4 w-4 mr-1" /> Add Channel</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} Channel</DialogTitle></DialogHeader>
            {editing && (
              <div className="space-y-4">
                <div className="space-y-2"><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Stream URL</Label><Input value={editing.stream_url} onChange={(e) => setEditing({ ...editing, stream_url: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <ImageUploadField value={editing.thumbnail_url || ""} onChange={(url) => setEditing({ ...editing, thumbnail_url: url })} folder="livetv" label="থাম্বনেইল" />
                  <div className="space-y-2"><Label>Category</Label><Input value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} /></div>
                <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
                <Button onClick={() => save.mutate(editing)} className="w-full">Save</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Order</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {channels?.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.category || "-"}</TableCell>
                <TableCell>{c.sort_order}</TableCell>
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
