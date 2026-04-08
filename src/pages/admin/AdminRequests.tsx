import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, PackagePlus, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminRequests() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-requests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("software_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      const userIds = [...new Set((data || []).map(r => r.user_id).filter(Boolean))] as string[];
      let profileMap: Record<string, string> = {};
      if (userIds.length > 0) { const { data: profiles } = await supabase.from("profiles").select("id, display_name").in("id", userIds); profiles?.forEach(p => { profileMap[p.id] = p.display_name || "—"; }); }
      return (data || []).map(r => ({ ...r, user_display_name: r.user_id ? (profileMap[r.user_id] || "—") : "Guest" }));
    },
  });
  const updateStatus = useMutation({ mutationFn: async ({ id, status }: { id: string; status: string }) => { const { error } = await supabase.from("software_requests").update({ status }).eq("id", id); if (error) throw error; }, onSuccess: () => { toast.success("Updated"); queryClient.invalidateQueries({ queryKey: ["admin-requests"] }); }, onError: (e: any) => toast.error(e.message) });
  const deleteRequest = useMutation({ mutationFn: async (id: string) => { const { error } = await supabase.from("software_requests").delete().eq("id", id); if (error) throw error; }, onSuccess: () => { toast.success("Deleted"); queryClient.invalidateQueries({ queryKey: ["admin-requests"] }); }, onError: (e: any) => toast.error(e.message) });
  const handleConvert = (r: any) => { updateStatus.mutate({ id: r.id, status: "fulfilled" }); navigate(`/admin/products?new=true&title=${encodeURIComponent(r.title)}`); };
  if (isLoading) return <div className="animate-pulse h-48 bg-card rounded-xl" />;
  const statusBadge = (s: string) => { const map: Record<string, "default" | "secondary" | "destructive"> = { pending: "secondary", fulfilled: "default", rejected: "destructive" }; return <Badge variant={map[s] || "secondary"} className="capitalize">{s}</Badge>; };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Software Requests ({requests?.length || 0})</h2>
      <Table><TableHeader><TableRow><TableHead>Software</TableHead><TableHead>Description</TableHead><TableHead>User</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
        <TableBody>{requests?.map((r: any) => (
          <TableRow key={r.id}>
            <TableCell className="font-medium">{r.title}</TableCell>
            <TableCell className="max-w-[200px] truncate text-muted-foreground">{r.description || "—"}</TableCell>
            <TableCell>{r.user_display_name}</TableCell><TableCell>{statusBadge(r.status)}</TableCell>
            <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
            <TableCell><div className="flex gap-1">
              {r.status === "pending" && <><Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleConvert(r)}><PackagePlus className="h-3 w-3" /> Convert</Button><Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={() => updateStatus.mutate({ id: r.id, status: "rejected" })}><XCircle className="h-3 w-3" /> Reject</Button></>}
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteRequest.mutate(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div></TableCell>
          </TableRow>
        ))}{(!requests || requests.length === 0) && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No requests</TableCell></TableRow>}</TableBody>
      </Table>
    </div>
  );
}
