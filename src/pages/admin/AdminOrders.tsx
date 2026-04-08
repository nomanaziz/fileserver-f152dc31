import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminOrders() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: payments } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payments").select("*, products(title)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("payments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-orders"] }); toast.success("Updated!"); },
  });

  const filtered = payments?.filter((p) => statusFilter === "all" || p.status === statusFilter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders / Payments</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader><TableRow><TableHead>Transaction</TableHead><TableHead>Product</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {filtered?.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-sm">{p.transaction_id || "-"}</TableCell>
                <TableCell>{p.products?.title || "-"}</TableCell>
                <TableCell>৳{p.amount}</TableCell>
                <TableCell>{p.payment_method || "-"}</TableCell>
                <TableCell><Badge variant={p.status === "completed" ? "default" : p.status === "pending" ? "secondary" : "destructive"}>{p.status}</Badge></TableCell>
                <TableCell className="text-sm">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-1">
                  {p.status === "pending" && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => updateStatus.mutate({ id: p.id, status: "completed" })}>Approve</Button>
                      <Button variant="ghost" size="sm" onClick={() => updateStatus.mutate({ id: p.id, status: "failed" })}>Reject</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered?.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No orders found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
