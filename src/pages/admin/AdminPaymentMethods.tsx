import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPaymentMethods() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Payment Methods</h1>
      <Card>
        <CardHeader><CardTitle>Payment Gateway Configuration</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Payment methods management (bKash, Nagad, Bank Transfer, etc.) will be configured here. This requires a dedicated payment_methods table to be created.</p>
        </CardContent>
      </Card>
    </div>
  );
}
