import { useVendorProfile, useVendorProducts, useVendorEarnings } from "@/hooks/useVendor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, DollarSign, Wallet, TrendingUp, ShieldCheck, Clock } from "lucide-react";

export default function VendorDashboard() {
  const { data: profile } = useVendorProfile();
  const { data: products } = useVendorProducts();
  const { data: earnings } = useVendorEarnings();

  const totalSales = earnings?.length || 0;
  const totalProducts = products?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ড্যাশবোর্ড</h1>
        {profile?.is_verified ? (
          <Badge className="gap-1"><ShieldCheck className="h-3 w-3" /> ভেরিফাইড</Badge>
        ) : (
          <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> পেন্ডিং</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{profile?.total_earnings || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">উত্তোলনযোগ্য</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{profile?.available_balance || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">প্রোডাক্ট</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">মোট বিক্রি</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">কমিশন তথ্য</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>প্ল্যাটফর্ম কমিশন: <span className="font-semibold text-foreground">{profile?.commission_rate || 20}%</span></p>
          <p>আপনার শেয়ার: <span className="font-semibold text-foreground">{100 - (profile?.commission_rate || 20)}%</span></p>
          <p className="text-xs mt-2">প্রতিটা বিক্রি থেকে স্বয়ংক্রিয়ভাবে কমিশন কেটে আপনার ব্যালেন্সে জমা হয়।</p>
        </CardContent>
      </Card>
    </div>
  );
}
