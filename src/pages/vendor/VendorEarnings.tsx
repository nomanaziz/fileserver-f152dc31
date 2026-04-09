import { useVendorEarnings } from "@/hooks/useVendor";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VendorEarnings() {
  const { data: earnings, isLoading } = useVendorEarnings();

  const totalSale = earnings?.reduce((s, e) => s + Number(e.sale_amount), 0) || 0;
  const totalCommission = earnings?.reduce((s, e) => s + Number(e.commission_amount), 0) || 0;
  const totalVendor = earnings?.reduce((s, e) => s + Number(e.vendor_amount), 0) || 0;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">আয়ের হিসাব</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">মোট বিক্রি</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">৳{totalSale}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">কমিশন কর্তন</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-destructive">৳{totalCommission}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">আপনার আয়</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-primary">৳{totalVendor}</div></CardContent></Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>প্রোডাক্ট</TableHead>
            <TableHead>বিক্রি</TableHead>
            <TableHead>কমিশন</TableHead>
            <TableHead>আপনার আয়</TableHead>
            <TableHead>তারিখ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {earnings?.map((e: any) => (
            <TableRow key={e.id}>
              <TableCell>{e.products?.title || "—"}</TableCell>
              <TableCell>৳{e.sale_amount}</TableCell>
              <TableCell className="text-destructive">৳{e.commission_amount}</TableCell>
              <TableCell className="text-primary font-medium">৳{e.vendor_amount}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{new Date(e.created_at).toLocaleDateString("bn-BD")}</TableCell>
            </TableRow>
          ))}
          {(!earnings || earnings.length === 0) && (
            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">এখনো কোনো আয় হয়নি</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
