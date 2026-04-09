import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useVendorProfile, useCreateVendorProfile } from "@/hooks/useVendor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, CheckCircle, Clock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function BecomeVendor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: vendorProfile, isLoading } = useVendorProfile();
  const createVendor = useCreateVendorProfile();
  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  if (!user) {
    navigate("/login");
    return null;
  }

  if (isLoading) return <Layout><div className="container py-16 text-center text-muted-foreground">লোড হচ্ছে...</div></Layout>;

  if (vendorProfile) {
    return (
      <Layout>
        <div className="container py-16 max-w-lg mx-auto text-center space-y-6">
          <Store className="h-16 w-16 mx-auto text-primary" />
          <h1 className="text-2xl font-bold">{vendorProfile.store_name}</h1>
          {vendorProfile.is_verified ? (
            <Badge className="gap-1"><ShieldCheck className="h-3 w-3" /> ভেরিফাইড</Badge>
          ) : (
            <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> ভেরিফিকেশন পেন্ডিং</Badge>
          )}
          <p className="text-muted-foreground text-sm">
            {vendorProfile.is_verified
              ? "আপনার স্টোর ভেরিফাই হয়েছে। এখন প্রোডাক্ট আপলোড করতে পারবেন।"
              : "আপনার আবেদন রিভিউ করা হচ্ছে। অ্যাডমিন অনুমোদন দিলে প্রোডাক্ট আপলোড করতে পারবেন।"}
          </p>
          <Button onClick={() => navigate("/vendor")}>ভেন্ডর ড্যাশবোর্ড</Button>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) { toast.error("স্টোরের নাম দিন"); return; }
    try {
      await createVendor.mutateAsync({
        store_name: storeName.trim(),
        store_description: storeDesc.trim() || undefined,
        logo_url: logoUrl.trim() || undefined,
      });
      toast.success("ভেন্ডর আবেদন সফল হয়েছে!");
    } catch (err: any) {
      toast.error(err.message || "ত্রুটি হয়েছে");
    }
  };

  return (
    <Layout>
      <div className="container py-12 max-w-lg mx-auto">
        <Card>
          <CardHeader className="text-center">
            <Store className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle className="text-xl">ভেন্ডর হোন</CardTitle>
            <p className="text-sm text-muted-foreground">
              আপনার সফটওয়্যার, থিম, প্লাগিন, গেম বিক্রি করুন। প্রতিটা বিক্রি থেকে ৮০% আপনার!
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>স্টোরের নাম *</Label>
                <Input value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="যেমন: TechBD Store" />
              </div>
              <div className="space-y-2">
                <Label>স্টোরের বিবরণ</Label>
                <Textarea value={storeDesc} onChange={e => setStoreDesc(e.target.value)} placeholder="আপনার স্টোর সম্পর্কে কিছু লিখুন..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>লোগো URL</Label>
                <Input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="bg-muted p-3 rounded-md text-xs text-muted-foreground space-y-1">
                <p>✅ প্রতিটা বিক্রি থেকে ৮০% আপনি পাবেন</p>
                <p>✅ প্ল্যাটফর্ম কমিশন মাত্র ২০%</p>
                <p>✅ পেমেন্ট আমাদের সিস্টেমে প্রসেস হবে</p>
                <p>⏳ অ্যাডমিন ভেরিফিকেশনের পর প্রোডাক্ট আপলোড করতে পারবেন</p>
              </div>
              <Button type="submit" className="w-full" disabled={createVendor.isPending}>
                {createVendor.isPending ? "প্রসেসিং..." : "আবেদন করুন"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
