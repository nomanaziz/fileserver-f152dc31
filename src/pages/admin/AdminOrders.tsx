import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Eye, Check, X } from "lucide-react";

export default function AdminOrders() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewing, setViewing] = useState<any>(null);

  const { data: payments, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payments").select("*, products(title)").order("created_at", { ascending: false });
      if (error) throw error;
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, display_name").in("id", userIds);
      const nameMap: Record<string, string> = {}; profiles?.forEach(p => { nameMap[p.id] = p.display_name || "User"; });
      return data.map(p => ({ ...p, user_name: nameMap[p.user_id] || "User" }));
    },
  });
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => { const { error } = await supabase.from("payments").update({ status } as any).eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-orders"] }); toast.success("Order updated!"); },
    onError: (e: any) => toast.error(e.message),
  });
  const filtered = payments?.filter(p => statusFilter === "all" || p.status === statusFilter);
  const statusBadge = (s: string) => { const map: Record<string, "default" | "secondary" | "destructive"> = { completed: "default", pending: "secondary", failed: "destructive" }; return <Badge variant={map[s] || "secondary"} className="capitalize">{s}</Badge>; };

  const getManualInfo = (p: any) => {
    const gr = p.gateway_response as any;
    return {
      senderNumber: gr?.sender_number || null,
      txnId: gr?.transaction_id || p.transaction_id || null,
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Orders ({payments?.length || 0})</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="failed">Failed</SelectItem></SelectContent></Select>
      </div>
      {isLoading ? <div className="animate-pulse h-48 bg-card rounded-xl" /> : (
        <Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Product</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Sender/TxnID</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>{filtered?.map((p: any) => {
            const mi = getManualInfo(p);
            return (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.user_name}</TableCell><TableCell className="text-sm">{p.products?.title || "—"}</TableCell>
              <TableCell>৳{p.amount}</TableCell><TableCell className="text-sm">{p.payment_method || "—"}</TableCell>
              <TableCell className="text-xs">
                {mi.senderNumber && <div>📱 {mi.senderNumber}</div>}
                {mi.txnId && <div className="font-mono">{mi.txnId}</div>}
                {!mi.senderNumber && !mi.txnId && "—"}
              </TableCell>
              <TableCell>{statusBadge(p.status)}</TableCell><TableCell className="text-sm">{new Date(p.created_at).toLocaleDateString()}</TableCell>
              <TableCell><div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setViewing(p)}><Eye className="h-4 w-4" /></Button>
                {p.status === "pending" && (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => updateStatus.mutate({ id: p.id, status: "completed" })}><Check className="h-4 w-4 text-green-500" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => updateStatus.mutate({ id: p.id, status: "failed" })}><X className="h-4 w-4 text-destructive" /></Button>
                  </>
                )}
              </div></TableCell>
            </TableRow>
          );})}{(!filtered || filtered.length === 0) && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No orders</TableCell></TableRow>}</TableBody>
        </Table>
      )}
      <Dialog open={!!viewing} onOpenChange={v => { if (!v) setViewing(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Order Details</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            <p><strong>User:</strong> {viewing?.user_name}</p>
            <p><strong>Product:</strong> {viewing?.products?.title || "—"}</p>
            <p><strong>Amount:</strong> ৳{viewing?.amount}</p>
            <p><strong>Method:</strong> {viewing?.payment_method || "—"}</p>
            <p><strong>Transaction ID:</strong> {viewing?.transaction_id || (viewing?.gateway_response as any)?.transaction_id || "—"}</p>
            <p><strong>Sender Number:</strong> {(viewing?.gateway_response as any)?.sender_number || "—"}</p>
            <p><strong>Status:</strong> {viewing?.status}</p>
            {viewing?.status === "pending" && (
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1" onClick={() => { updateStatus.mutate({ id: viewing.id, status: "completed" }); setViewing(null); }}>
                  <Check className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="destructive" className="flex-1" onClick={() => { updateStatus.mutate({ id: viewing.id, status: "failed" }); setViewing(null); }}>
                  <X className="h-4 w-4 mr-1" /> Reject
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
