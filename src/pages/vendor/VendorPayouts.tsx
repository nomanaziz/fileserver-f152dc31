import { useState } from "react";
import { useVendorPayouts, useVendorProfile, useRequestPayout } from "@/hooks/useVendor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Wallet } from "lucide-react";

export default function VendorPayouts() {
  const { data: profile } = useVendorProfile();
  const { data: payouts } = useVendorPayouts();
  const requestPayout = useRequestPayout();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState("");
  const [accountNo, setAccountNo] = useState("");

  const handleRequest = async () => {
    if (amount <= 0) { toast.error("পরিমাণ দিন"); return; }
    if (amount > (profile?.available_balance || 0)) { toast.error("পর্যাপ্ত ব্যালেন্স নেই"); return; }
    if (!method.trim()) { toast.error("পেমেন্ট মেথড দিন"); return; }
    try {
      await requestPayout.mutateAsync({ amount, payment_method: method, account_details: { account_number: accountNo } });
      toast.success("পেআউট রিকোয়েস্ট সফল!");
      setDialogOpen(false);
      setAmount(0); setMethod(""); setAccountNo("");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const statusColor = (s: string) => s === "paid" ? "default" : s === "approved" ? "secondary" : s === "rejected" ? "destructive" : "outline";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">পেআউট</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Wallet className="h-4 w-4 mr-2" /> উত্তোলন করুন</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>পেআউট রিকোয়েস্ট</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">উত্তোলনযোগ্য: <span className="font-bold text-foreground">৳{profile?.available_balance || 0}</span></p>
              <div className="space-y-2"><Label>পরিমাণ (৳)</Label><Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} /></div>
              <div className="space-y-2"><Label>পেমেন্ট মেথড</Label><Input value={method} onChange={e => setMethod(e.target.value)} placeholder="bKash / Nagad / Bank" /></div>
              <div className="space-y-2"><Label>অ্যাকাউন্ট নম্বর</Label><Input value={accountNo} onChange={e => setAccountNo(e.target.value)} /></div>
              <Button onClick={handleRequest} disabled={requestPayout.isPending} className="w-full">
                {requestPayout.isPending ? "প্রসেসিং..." : "রিকোয়েস্ট করুন"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">উত্তোলনযোগ্য ব্যালেন্স</CardTitle></CardHeader>
        <CardContent><div className="text-3xl font-bold">৳{profile?.available_balance || 0}</div></CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>পরিমাণ</TableHead>
            <TableHead>মেথড</TableHead>
            <TableHead>স্ট্যাটাস</TableHead>
            <TableHead>তারিখ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payouts?.map((p: any) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">৳{p.amount}</TableCell>
              <TableCell>{p.payment_method || "—"}</TableCell>
              <TableCell><Badge variant={statusColor(p.status) as any}>{p.status}</Badge></TableCell>
              <TableCell className="text-muted-foreground text-sm">{new Date(p.created_at).toLocaleDateString("bn-BD")}</TableCell>
            </TableRow>
          ))}
          {(!payouts || payouts.length === 0) && (
            <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">কোনো পেআউট নেই</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
