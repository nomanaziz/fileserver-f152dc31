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

const serverTypes = ["local", "cdn", "backup", "live_tv"];

export default function AdminServers() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [priority, setPriority] = useState(0);
  const [serverType, setServerType] = useState("local");

  const { data: servers } = useQuery({
    queryKey: ["admin-servers"],
    queryFn: async () => { const { data, error } = await supabase.from("download_servers").select("*").order("priority"); if (error) throw error; return data; },
  });
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { name, label: label || null, base_url: baseUrl, priority, server_type: serverType } as any;
      if (editId) { const { error } = await supabase.from("download_servers").update(payload).eq("id", editId); if (error) throw error; }
      else { const { error } = await supabase.from("download_servers").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-servers"] }); setDialogOpen(false); resetForm(); toast.success("Server saved!"); },
    onError: (e: any) => toast.error(e.message),
  });
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => { const { error } = await supabase.from("download_servers").update({ is_active }).eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-servers"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("download_servers").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-servers"] }); toast.success("Server deleted"); },
  });
  const resetForm = () => { setName(""); setLabel(""); setBaseUrl(""); setPriority(0); setServerType("local"); setEditId(null); };
  const openEdit = (s: any) => { setName(s.name); setLabel(s.label || ""); setBaseUrl(s.base_url); setPriority(s.priority); setServerType(s.server_type || "local"); setEditId(s.id); setDialogOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Download Servers ({servers?.length || 0})</h2>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Server</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "Edit" : "New"} Server</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Label</Label><Input value={label} onChange={e => setLabel(e.target.value)} /></div>
              <div className="space-y-2"><Label>Base URL</Label><Input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://cdn.example.com" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Priority</Label><Input type="number" value={priority} onChange={e => setPriority(Number(e.target.value))} /></div>
                <div className="space-y-2"><Label>Type</Label><Select value={serverType} onValueChange={setServerType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{serverTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !name.trim() || !baseUrl.trim()} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Label</TableHead><TableHead>Type</TableHead><TableHead>Priority</TableHead><TableHead>Active</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
        <TableBody>{servers?.map(s => (
          <TableRow key={s.id}>
            <TableCell className="font-medium">{s.name}</TableCell>
            <TableCell>{s.label || "—"}</TableCell>
            <TableCell><Badge variant="outline" className="capitalize text-xs">{(s as any).server_type || "local"}</Badge></TableCell>
            <TableCell>{s.priority}</TableCell>
            <TableCell><Switch checked={s.is_active} onCheckedChange={v => toggleMutation.mutate({ id: s.id, is_active: v })} /></TableCell>
            <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
    </div>
  );
}
