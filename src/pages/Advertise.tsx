import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Monitor, LayoutGrid, FileText, Download, Check, Users, Eye, TrendingUp } from "lucide-react";
import { useAdSlotAvailability } from "@/hooks/useAds";

const PLACEMENT_META: Record<string, { name: string; icon: any }> = {
  header: { name: "হেডার ব্যানার", icon: Monitor },
  sidebar: { name: "সাইডবার", icon: LayoutGrid },
  in_content: { name: "ইন-কন্টেন্ট", icon: FileText },
  before_download: { name: "ডাউনলোডের আগে", icon: Download },
  footer: { name: "ফুটার", icon: LayoutGrid },
};

const stats = [
  { label: "মাসিক ভিজিটর", value: "৫০,০০০+", icon: Users },
  { label: "পেজ ভিউ", value: "২,০০,০০০+", icon: Eye },
  { label: "গ্রোথ রেট", value: "১৫%", icon: TrendingUp },
];

export default function Advertise() {
  const [searchParams] = useSearchParams();
  const [selectedPlacements, setSelectedPlacements] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { data: slots } = useAdSlotAvailability();

  useEffect(() => {
    const p = searchParams.get("placement");
    if (p && slots?.some((s: any) => s.placement === p)) {
      setSelectedPlacements((prev) => (prev.includes(p) ? prev : [p]));
    }
  }, [searchParams, slots]);

  const togglePlacement = (id: string) => {
    setSelectedPlacements((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const selectedSlots = slots?.filter((s: any) => selectedPlacements.includes(s.placement)) || [];
  const totalPrice = selectedSlots.reduce((sum: number, s: any) => sum + (s.price_per_month || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlacements.length === 0) {
      toast.error("অন্তত একটি বিজ্ঞাপনের স্থান নির্বাচন করুন।");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("ad_inquiries").insert({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      placement: selectedPlacements.join(","),
      message: form.message || null,
    });
    setLoading(false);
    if (error) {
      toast.error("পাঠাতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    } else {
      setSubmitted(true);
      toast.success("আপনার অনুরোধ পাঠানো হয়েছে!");
    }
  };

  return (
    <Layout>
      <div className="container py-8 max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">আমাদের ওয়েবসাইটে বিজ্ঞাপন দিন</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            আমাদের সাইটে আপনার প্রোডাক্ট বা সার্ভিস প্রচার করুন। হাজারো ডেইলি ভিজিটরের কাছে পৌঁছান।
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {stats.map((s) => (
            <Card key={s.label} className="text-center">
              <CardContent className="pt-6">
                <s.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Placement Cards with Availability */}
        <h2 className="text-xl font-semibold mb-4">বিজ্ঞাপনের স্থান ও মূল্য</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {slots?.map((slot: any) => {
            const meta = PLACEMENT_META[slot.placement] || { name: slot.placement, icon: Monitor };
            const Icon = meta.icon;
            const isSelected = selectedPlacements.includes(slot.placement);
            const isFull = slot.available <= 0;

            return (
              <Card
                key={slot.id}
                className={`cursor-pointer transition-all ${isFull ? "opacity-60 cursor-not-allowed" : ""} ${isSelected ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"}`}
                onClick={() => !isFull && togglePlacement(slot.placement)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${isSelected ? "bg-primary/10" : "bg-muted"}`}>
                      <Icon className={`h-6 w-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold">{meta.name}</h3>
                        <div className="flex items-center gap-2">
                          {isFull ? (
                            <Badge variant="destructive" className="text-[10px]">স্লট পূর্ণ</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">{slot.available}/{slot.max_ads} খালি</Badge>
                          )}
                          {isSelected && <Check className="h-5 w-5 text-primary" />}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{slot.description}</p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="bg-muted px-2 py-0.5 rounded text-xs font-mono">{slot.size_label}</span>
                        <span className="font-semibold text-primary">৳{Number(slot.price_per_month).toLocaleString("bn-BD")}/মাস</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Form */}
        {submitted ? (
          <Card className="max-w-lg mx-auto text-center">
            <CardContent className="pt-8 pb-8">
              <Check className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">ধন্যবাদ!</h3>
              <p className="text-muted-foreground">আপনার অনুরোধ পাওয়া গেছে। আমরা শীঘ্রই যোগাযোগ করবো।</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-lg mx-auto">
            <CardHeader><CardTitle>অর্ডার করুন</CardTitle></CardHeader>
            <CardContent>
              {/* Checkbox selection */}
              <div className="mb-6">
                <Label className="text-base font-semibold mb-3 block">আপনার কাঙ্ক্ষিত বিজ্ঞাপন নির্বাচন করুন *</Label>
                <div className="space-y-3">
                  {slots?.map((slot: any) => {
                    const meta = PLACEMENT_META[slot.placement] || { name: slot.placement };
                    const isFull = slot.available <= 0;
                    return (
                      <label key={slot.id} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isFull ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted/50"}`}>
                        <Checkbox
                          checked={selectedPlacements.includes(slot.placement)}
                          onCheckedChange={() => !isFull && togglePlacement(slot.placement)}
                          disabled={isFull}
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-sm font-medium">{meta.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {isFull ? "স্লট পূর্ণ" : `৳${Number(slot.price_per_month).toLocaleString("bn-BD")}/মাস`}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {selectedPlacements.length > 0 && (
                <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20 text-sm">
                  <p className="font-medium mb-1">নির্বাচিত: {selectedSlots.map((s: any) => PLACEMENT_META[s.placement]?.name || s.placement).join(", ")}</p>
                  <p className="text-primary font-semibold">মোট: ৳{totalPrice.toLocaleString("bn-BD")}/মাস</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>নাম *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label>ইমেইল *</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={255} />
                </div>
                <div className="space-y-2">
                  <Label>ফোন</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} placeholder="০১৭XXXXXXXX" />
                </div>
                <div className="space-y-2">
                  <Label>মেসেজ</Label>
                  <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} maxLength={500} placeholder="আপনার বিজ্ঞাপন সম্পর্কে বিস্তারিত..." />
                </div>
                <Button type="submit" disabled={loading || selectedPlacements.length === 0} className="w-full">
                  {loading ? "পাঠানো হচ্ছে..." : "অর্ডার পাঠান"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* FAQ */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-center">সচরাচর জিজ্ঞাসা</h2>
          <div className="space-y-4">
            {[
              { q: "পেমেন্ট কিভাবে করবো?", a: "বিকাশ, নগদ বা ব্যাংক ট্রান্সফারে পেমেন্ট করতে পারবেন।" },
              { q: "বিজ্ঞাপনের সময়কাল কত?", a: "সর্বনিম্ন ১ মাস। দীর্ঘমেয়াদী প্যাকেজে ডিসকাউন্ট পাবেন।" },
              { q: "কাস্টম সাইজ সম্ভব?", a: "হ্যাঁ, কাস্টম সাইজ ও প্লেসমেন্ট আলোচনা সাপেক্ষে সম্ভব।" },
            ].map((faq, i) => (
              <Card key={i}>
                <CardContent className="pt-4 pb-4">
                  <h4 className="font-medium mb-1">{faq.q}</h4>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
