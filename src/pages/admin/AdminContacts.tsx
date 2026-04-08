import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function AdminContacts() {
  const qc = useQueryClient();
  const [viewing, setViewing] = useState<any>(null);
  const { data: messages, isLoading } = useQuery({ queryKey: ["admin-contacts"], queryFn: async () => { const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false }); if (error) throw error; return data; } });
  const markRead = useMutation({ mutationFn: async (id: string) => { const { error } = await supabase.from("contact_messages").update({ is_read: true }).eq("id", id); if (error) throw error; }, onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-contacts"] }) });
  const del = useMutation({ mutationFn: async (id: string) => { const { error } = await supabase.from("contact_messages").delete().eq("id", id); if (error) throw error; }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-contacts"] }); toast.success("Deleted"); } });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Contact Messages</h2>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
        <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Subject</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
          <TableBody>{messages?.map(m => (
            <TableRow key={m.id} className={!m.is_read ? "bg-primary/5" : ""}>
              <TableCell className="font-medium">{m.name}</TableCell><TableCell className="text-xs">{m.email}</TableCell>
              <TableCell className="text-xs">{m.subject || "—"}</TableCell><TableCell className="text-xs">{format(new Date(m.created_at), "MMM d, yyyy")}</TableCell>
              <TableCell><Badge variant={m.is_read ? "secondary" : "default"}>{m.is_read ? "Read" : "New"}</Badge></TableCell>
              <TableCell><div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => { setViewing(m); if (!m.is_read) markRead.mutate(m.id); }}><Eye className="h-4 w-4" /></Button>
                <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => del.mutate(m.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
              </div></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      )}
      <Dialog open={!!viewing} onOpenChange={v => { if (!v) setViewing(null); }}><DialogContent><DialogHeader><DialogTitle>Message from {viewing?.name}</DialogTitle></DialogHeader><div className="space-y-2 text-sm"><p><strong>Email:</strong> {viewing?.email}</p><p><strong>Subject:</strong> {viewing?.subject || "—"}</p><p className="whitespace-pre-wrap border rounded p-3 bg-muted/30">{viewing?.message}</p></div></DialogContent></Dialog>
    </div>
  );
}
