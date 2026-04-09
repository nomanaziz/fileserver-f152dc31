import { useVendorProfile, useVendorProducts, useVendorEarnings, useVendorTiers } from "@/hooks/useVendor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, DollarSign, Wallet, TrendingUp, ShieldCheck, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function VendorDashboard() {
  const { data: profile } = useVendorProfile();
  const { data: products } = useVendorProducts();
  const { data: earnings } = useVendorEarnings();
  const { data: tiers } = useVendorTiers();

  const totalSales = earnings?.length || 0;
  const totalProducts = products?.length || 0;

  // Find current and next tier
  const sortedTiers = tiers?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [];
  const currentTier = sortedTiers.find((t: any) => t.id === profile?.tier_id);
  const currentIdx = sortedTiers.findIndex((t: any) => t.id === profile?.tier_id);
  const nextTier = currentIdx >= 0 && currentIdx < sortedTiers.length - 1 ? sortedTiers[currentIdx + 1] : null;

  // Progress to next tier
  let salesProgress = 0;
  let earningsProgress = 0;
  let salesRemaining = 0;
  let earningsRemaining = 0;
  if (nextTier) {
    const currentMin = currentTier?.min_sales_count || 0;
    const nextMin = nextTier.min_sales_count;
    salesProgress = nextMin > currentMin ? Math.min(100, ((totalSales - currentMin) / (nextMin - currentMin)) * 100) : 100;
    salesRemaining = Math.max(0, nextMin - totalSales);

    const currentEarnMin = currentTier?.min_total_earnings || 0;
    const nextEarnMin = nextTier.min_total_earnings;
    earningsProgress = nextEarnMin > currentEarnMin ? Math.min(100, (((profile?.total_earnings || 0) - currentEarnMin) / (nextEarnMin - currentEarnMin)) * 100) : 100;
    earningsRemaining = Math.max(0, nextEarnMin - (profile?.total_earnings || 0));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ড্যাশবোর্ড</h1>
        <div className="flex items-center gap-2">
          {currentTier && (
            <Badge style={{ backgroundColor: currentTier.color, color: "#fff" }} className="gap-1 text-sm px-3 py-1">
              {currentTier.name}
            </Badge>
          )}
          {profile?.is_verified ? (
            <Badge className="gap-1"><ShieldCheck className="h-3 w-3" /> ভেরিফাইড</Badge>
          ) : (
            <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> পেন্ডিং</Badge>
          )}
        </div>
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

      {/* Tier Progress */}
      {nextTier && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              পরবর্তী লেভেল:
              <Badge style={{ backgroundColor: nextTier.color, color: "#fff" }}>{nextTier.name}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>বিক্রি: {totalSales}/{nextTier.min_sales_count}</span>
                <span>আরো {salesRemaining}টি বিক্রি দরকার</span>
              </div>
              <Progress value={salesProgress} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>আয়: ৳{profile?.total_earnings || 0}/৳{nextTier.min_total_earnings}</span>
                <span>আরো ৳{earningsRemaining} দরকার</span>
              </div>
              <Progress value={earningsProgress} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground">
              {nextTier.name} লেভেলে কমিশন হবে মাত্র {nextTier.commission_rate}%
            </p>
          </CardContent>
        </Card>
      )}

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
