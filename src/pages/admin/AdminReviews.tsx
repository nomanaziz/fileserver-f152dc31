import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminReviews() {
  const qc = useQueryClient();
  const { data: reviews } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*, products(title)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleApprove = useMutation({
    mutationFn: async ({ id, is_approved }: { id: string; is_approved: boolean }) => {
      const { error } = await supabase.from("reviews").update({ is_approved }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-reviews"] }); toast.success("Updated!"); },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-reviews"] }); toast.success("Deleted!"); },
  });

  const pending = reviews?.filter((r) => !r.is_approved) || [];
  const approved = reviews?.filter((r) => r.is_approved) || [];

  const ReviewTable = ({ items }: { items: any[] }) => (
    <Table>
      <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Rating</TableHead><TableHead>Comment</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
      <TableBody>
        {items.map((r: any) => (
          <TableRow key={r.id}>
            <TableCell>{r.products?.title || "-"}</TableCell>
            <TableCell>{"⭐".repeat(r.rating)}</TableCell>
            <TableCell className="max-w-xs truncate">{r.comment || "-"}</TableCell>
            <TableCell className="text-sm">{new Date(r.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right space-x-1">
              <Button variant="ghost" size="sm" onClick={() => toggleApprove.mutate({ id: r.id, is_approved: !r.is_approved })}>{r.is_approved ? "Reject" : "Approve"}</Button>
              <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete?")) remove.mutate(r.id); }}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
        {items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-4">No reviews.</TableCell></TableRow>}
      </TableBody>
    </Table>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reviews</h1>
      <Tabs defaultValue="pending">
        <TabsList><TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger><TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger></TabsList>
        <TabsContent value="pending"><div className="border rounded-lg"><ReviewTable items={pending} /></div></TabsContent>
        <TabsContent value="approved"><div className="border rounded-lg"><ReviewTable items={approved} /></div></TabsContent>
      </Tabs>
    </div>
  );
}
