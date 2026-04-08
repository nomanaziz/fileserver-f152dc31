import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Check, X, Trash2, Star } from "lucide-react";

type FilterTab = "all" | "pending" | "approved";

export default function AdminReviews() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<FilterTab>("pending");
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => { const { data, error } = await supabase.from("reviews").select("*, products(title), profiles(display_name)").order("created_at", { ascending: false }); if (error) throw error; return data; },
  });
  const filtered = reviews?.filter(r => { if (filter === "pending") return !r.is_approved; if (filter === "approved") return r.is_approved; return true; });
  const pendingCount = reviews?.filter(r => !r.is_approved).length || 0;
  const approvedCount = reviews?.filter(r => r.is_approved).length || 0;

  const approveMutation = useMutation({ mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => { const { error } = await supabase.from("reviews").update({ is_approved: approved }).eq("id", id); if (error) throw error; }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-reviews"] }); toast.success("Review updated"); } });
  const deleteMutation = useMutation({ mutationFn: async (id: string) => { const { error } = await supabase.from("reviews").delete().eq("id", id); if (error) throw error; }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-reviews"] }); toast.success("Review deleted"); } });

  if (isLoading) return <div className="animate-pulse h-32 bg-card rounded-xl" />;
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Reviews ({reviews?.length || 0})</h2>
      <Tabs value={filter} onValueChange={v => setFilter(v as FilterTab)}><TabsList><TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger><TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger><TabsTrigger value="all">All ({reviews?.length || 0})</TabsTrigger></TabsList></Tabs>
      <Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Product</TableHead><TableHead>Rating</TableHead><TableHead>Comment</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
        <TableBody>{filtered?.map(r => (
          <TableRow key={r.id}>
            <TableCell className="text-sm">{(r as any).profiles?.display_name || "User"}</TableCell>
            <TableCell className="text-sm">{(r as any).products?.title || "—"}</TableCell>
            <TableCell><div className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /><span className="text-sm">{r.rating}</span></div></TableCell>
            <TableCell className="text-sm max-w-[200px] truncate">{r.comment}</TableCell>
            <TableCell><Badge variant={r.is_approved ? "default" : "secondary"}>{r.is_approved ? "Approved" : "Pending"}</Badge></TableCell>
            <TableCell><div className="flex gap-1">
              {!r.is_approved && <Button variant="ghost" size="icon" onClick={() => approveMutation.mutate({ id: r.id, approved: true })}><Check className="h-4 w-4 text-green-500" /></Button>}
              {r.is_approved && <Button variant="ghost" size="icon" onClick={() => approveMutation.mutate({ id: r.id, approved: false })}><X className="h-4 w-4 text-orange-500" /></Button>}
              <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div></TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
    </div>
  );
}
