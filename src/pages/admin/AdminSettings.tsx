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

export default function AdminSettings() {
  const qc = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").order("key");
      if (error) throw error;
      return data;
    },
  });
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const save = useMutation({
    mutationFn: async (s: any) => {
      if (s.id) {
        const { error } = await supabase.from("site_settings").update({ key: s.key, value: s.value } as any).eq("id", s.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_settings").insert({ key: s.key, value: s.value } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-settings"] }); setOpen(false); toast.success("সেভ হয়েছে!"); },
  });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">সাইট সেটিংস</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing({ key: "", value: "" })}><Plus className="h-4 w-4 mr-1" /> নতুন</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>সেটিং</DialogTitle></DialogHeader>
            {editing && (
              <div className="space-y-4">
                <div className="space-y-2"><Label>Key</Label><Input value={editing.key} onChange={(e) => setEditing({ ...editing, key: e.target.value })} /></div>
                <div className="space-y-2"><Label>Value</Label><Input value={editing.value || ""} onChange={(e) => setEditing({ ...editing, value: e.target.value })} /></div>
                <Button onClick={() => save.mutate(editing)} className="w-full">সেভ করুন</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader><TableRow><TableHead>Key</TableHead><TableHead>Value</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
          <TableBody>
            {settings?.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-sm">{s.key}</TableCell>
                <TableCell className="text-sm">{s.value}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(s); setOpen(true); }}>এডিট</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
