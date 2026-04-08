import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminRequests() {
  const qc = useQueryClient();
  const { data: requests } = useQuery({
    queryKey: ["admin-requests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("software_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, status, admin_note }: { id: string; status: string; admin_note?: string }) => {
      const { error } = await supabase.from("software_requests").update({ status, admin_note }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-requests"] }); toast.success("Updated!"); },
  });

  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Software Requests</h1>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reply to Request</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div><Label>Title</Label><p className="font-medium">{editing.title}</p></div>
              <div><Label>Description</Label><p className="text-sm text-muted-foreground">{editing.description}</p></div>
              <div className="space-y-2"><Label>Admin Note</Label><Textarea value={editing.admin_note || ""} onChange={(e) => setEditing({ ...editing, admin_note: e.target.value })} /></div>
              <div className="flex gap-2">
                <Button onClick={() => { update.mutate({ id: editing.id, status: "approved", admin_note: editing.admin_note }); setOpen(false); }} className="flex-1">Approve</Button>
                <Button variant="destructive" onClick={() => { update.mutate({ id: editing.id, status: "rejected", admin_note: editing.admin_note }); setOpen(false); }} className="flex-1">Reject</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <div className="border rounded-lg">
        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Description</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {requests?.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.title}</TableCell>
                <TableCell className="max-w-xs truncate">{r.description}</TableCell>
                <TableCell><Badge variant={r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "secondary"}>{r.status}</Badge></TableCell>
                <TableCell className="text-sm">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(r); setOpen(true); }}>Review</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
