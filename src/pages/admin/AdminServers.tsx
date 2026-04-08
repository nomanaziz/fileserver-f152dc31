import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function AdminServers() {
  const qc = useQueryClient();
  const { data: servers } = useQuery({
    queryKey: ["admin-servers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("download_servers").select("*").order("priority");
      if (error) throw error;
      return data;
    },
  });
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const save = useMutation({
    mutationFn: async (s: any) => {
      if (s.id) {
        const { error } = await supabase.from("download_servers").update(s).eq("id", s.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("download_servers").insert(s as any);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-servers"] }); setOpen(false); toast.success("সেভ হয়েছে!"); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("download_servers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-servers"] }); toast.success("মুছে ফেলা হয়েছে!"); },
  });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ডাউনলোড সার্ভার</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing({ name: "", label: "", base_url: "", priority: 0 })}><Plus className="h-4 w-4 mr-1" /> নতুন</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>সার্ভার</DialogTitle></DialogHeader>
            {editing && (
              <div className="space-y-4">
                <div className="space-y-2"><Label>নাম</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>লেবেল</Label><Input value={editing.label || ""} onChange={(e) => setEditing({ ...editing, label: e.target.value })} /></div>
                <div className="space-y-2"><Label>Base URL</Label><Input value={editing.base_url} onChange={(e) => setEditing({ ...editing, base_url: e.target.value })} /></div>
                <Button onClick={() => save.mutate(editing)} className="w-full">সেভ করুন</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader><TableRow><TableHead>নাম</TableHead><TableHead>লেবেল</TableHead><TableHead>URL</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
          <TableBody>
            {servers?.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.label || "-"}</TableCell>
                <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">{s.base_url}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm("মুছে ফেলতে চান?")) del.mutate(s.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
