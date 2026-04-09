import { useState, useEffect } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Monitor, LayoutGrid, FileText, Download, Check, Users, Eye, TrendingUp, Copy, ShoppingCart } from "lucide-react";
import { useAdSlotAvailability } from "@/hooks/useAds";
import { useQuery } from "@tanstack/react-query";

const PLACEMENT_META: Record<string, { name: string; icon: any; desc: string }> = {
  header: { name: "হেডার ব্যানার", icon: Monitor, desc: "হোমপেজের উপরে ফুল-ওয়াইড ব্যানার" },
  sidebar: { name: "সাইডবার", icon: LayoutGrid, desc: "প্রতিটি পেজের ডান পাশে" },
  in_content: { name: "ইন-কন্টেন্ট", icon: FileText, desc: "কন্টেন্টের মাঝে" },
  before_download: { name: "ডাউনলোডের আগে", icon: Download, desc: "ডাউনলোড বাটনের উপরে" },
  footer: { name: "ফুটার", icon: LayoutGrid, desc: "পেজের নিচে" },
};

const DURATION_OPTIONS = [
  { months: 1, label: "১ মাস", discount: 0 },
  { months: 3, label: "৩ মাস", discount: 5 },
  { months: 6, label: "৬ মাস", discount: 10 },
  { months: 12, label: "১২ মাস", discount: 20 },
];

const stats = [
  { label: "মাসিক ভিজিটর", value: "৫০,০০০+", icon: Users },
  { label: "পেজ ভিউ", value: "২,০০,০০০+", icon: Eye },
  { label: "গ্রোথ রেট", value: "১৫%", icon: TrendingUp },
];

export default function Advertise() {
  const { user, profile, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedPlacements, setSelectedPlacements] = useState<string[]>([]);
  const [duration, setDuration] = useState(1);
  const [phone, setPhone] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }
  const { data: slots } = useAdSlotAvailability();

  const { data: paymentMethods } = useQuery({
    queryKey: ["active-payment-methods"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payment_methods").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

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
  const monthlyTotal = selectedSlots.reduce((sum: number, s: any) => sum + (s.price_per_month || 0), 0);
  const durationOption = DURATION_OPTIONS.find((d) => d.months === duration) || DURATION_OPTIONS[0];
  const subtotal = monthlyTotal * duration;
  const discountAmount = Math.round(subtotal * durationOption.discount / 100);
  const grandTotal = subtotal - discountAmount;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("কপি করা হয়েছে!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async () => {
    if (selectedPlacements.length === 0) {
      toast.error("অন্তত একটি বিজ্ঞাপনের স্থান নির্বাচন করুন।");
      return;
    }
    if (!phone.trim()) {
      toast.error("মোবাইল নম্বর আবশ্যক।");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("ad_inquiries").insert({
      name: profile?.display_name || user?.email || "",
      email: user?.email || "",
      phone: phone.trim(),
      placement: selectedPlacements.join(","),
      message: JSON.stringify({
        duration_months: duration,
        discount_percent: durationOption.discount,
        monthly_total: monthlyTotal,
        grand_total: grandTotal,
        payment_method: selectedPayment,
      }),
    });
    setLoading(false);
    if (error) {
      toast.error("পাঠাতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    } else {
      setSubmitted(true);
      toast.success("আপনার অর্ডার পাঠানো হয়েছে!");
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="container py-16 max-w-lg mx-auto text-center">
          <div className="bg-primary/10 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">ধন্যবাদ!</h1>
          <p className="text-muted-foreground">আপনার বিজ্ঞাপন অর্ডার পাওয়া গেছে। আমরা শীঘ্রই যোগাযোগ করবো।</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">আমাদের ওয়েবসাইটে বিজ্ঞাপন দিন</h1>
          <p className="text-muted-foreground">আপনার প্রোডাক্ট বা সার্ভিস হাজারো ভিজিটরের কাছে পৌঁছান</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {stats.map((s) => (
            <Card key={s.label} className="text-center">
              <CardContent className="pt-4 pb-4">
                <s.icon className="h-5 w-5 mx-auto mb-1.5 text-primary" />
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main 2-column layout */}
        <div className="grid md:grid-cols-[1fr_340px] gap-6 items-start">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Placement Selection */}
            <div>
              <h2 className="text-lg font-semibold mb-3">বিজ্ঞাপনের স্থান নির্বাচন করুন</h2>
              <div className="space-y-2">
                {slots?.map((slot: any) => {
                  const meta = PLACEMENT_META[slot.placement] || { name: slot.placement, icon: Monitor, desc: "" };
                  const Icon = meta.icon;
                  const isSelected = selectedPlacements.includes(slot.placement);
                  const isFull = slot.available <= 0;

                  return (
                    <div
                      key={slot.id}
                      onClick={() => !isFull && togglePlacement(slot.placement)}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                        isFull
                          ? "opacity-50 cursor-not-allowed border-border"
                          : isSelected
                          ? "border-primary bg-primary/5 cursor-pointer"
                          : "border-border hover:border-primary/40 cursor-pointer"
                      }`}
                    >
                      <div className={`flex items-center justify-center h-5 w-5 rounded border-2 shrink-0 ${
                        isSelected ? "bg-primary border-primary" : "border-muted-foreground/40"
                      }`}>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                      </div>
                      <Icon className={`h-5 w-5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{meta.name}</span>
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">{slot.size_label}</span>
                          {isFull ? (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">পূর্ণ</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{slot.available}/{slot.max_ads} খালি</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{meta.desc}</p>
                      </div>
                      <span className="font-semibold text-sm text-primary whitespace-nowrap">
                        ৳{Number(slot.price_per_month).toLocaleString("bn-BD")}/মাস
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Duration */}
            <div>
              <h2 className="text-lg font-semibold mb-3">মেয়াদ নির্বাচন করুন</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d.months}
                    onClick={() => setDuration(d.months)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      duration === d.months
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <p className="font-semibold text-sm">{d.label}</p>
                    {d.discount > 0 && (
                      <p className="text-xs text-green-600 font-medium">{d.discount}% ছাড়</p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-lg font-semibold mb-3">আপনার তথ্য</h2>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">নাম</Label>
                  <p className="text-sm font-medium">{profile?.display_name || user?.email || "—"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">ইমেইল</Label>
                  <p className="text-sm font-medium">{user?.email || "—"}</p>
                </div>
                <div>
                  <Label className="text-xs">মোবাইল নম্বর *</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} placeholder="০১৭XXXXXXXX" required />
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            {paymentMethods && paymentMethods.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">পেমেন্ট মেথড</h2>
                <div className="space-y-2">
                  {paymentMethods.map((pm) => (
                    <div
                      key={pm.id}
                      onClick={() => setSelectedPayment(pm.slug)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPayment === pm.slug
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {pm.logo_url ? (
                          <img src={pm.logo_url} alt={pm.name} className="h-8 w-8 rounded object-contain" />
                        ) : (
                          <div className="h-8 w-8 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: pm.color || "#E2136E" }}>
                            {pm.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{pm.name}</p>
                          {pm.account_type && <p className="text-xs text-muted-foreground">{pm.account_type}</p>}
                        </div>
                        <div className={`h-4 w-4 rounded-full border-2 ${
                          selectedPayment === pm.slug ? "border-primary bg-primary" : "border-muted-foreground/40"
                        }`} />
                      </div>
                      {selectedPayment === pm.slug && pm.account_number && (
                        <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2 mt-2">
                          <span className="text-sm font-mono flex-1">{pm.account_number}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(pm.account_number!, pm.id); }}
                          >
                            {copiedId === pm.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      )}
                      {selectedPayment === pm.slug && pm.instructions && (
                        <p className="text-xs text-muted-foreground mt-2">{pm.instructions}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            <div>
              <h2 className="text-lg font-semibold mb-3">সচরাচর জিজ্ঞাসা</h2>
              <div className="space-y-2">
                {[
                  { q: "পেমেন্ট কিভাবে করবো?", a: "বিকাশ, নগদ বা ব্যাংক ট্রান্সফারে পেমেন্ট করতে পারবেন।" },
                  { q: "বিজ্ঞাপনের সময়কাল কত?", a: "সর্বনিম্ন ১ মাস। দীর্ঘমেয়াদী প্যাকেজে ডিসকাউন্ট পাবেন।" },
                  { q: "কাস্টম সাইজ সম্ভব?", a: "হ্যাঁ, কাস্টম সাইজ ও প্লেসমেন্ট আলোচনা সাপেক্ষে সম্ভব।" },
                ].map((faq, i) => (
                  <Card key={i}>
                    <CardContent className="pt-3 pb-3">
                      <h4 className="font-medium text-sm mb-0.5">{faq.q}</h4>
                      <p className="text-xs text-muted-foreground">{faq.a}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column — Sticky Purchase Summary */}
          <div className="md:sticky md:top-20">
            <Card className="border-primary/30">
              <CardContent className="p-5">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" /> অর্ডার সারাংশ
                </h3>

                {selectedSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    বাম পাশ থেকে বিজ্ঞাপনের স্থান নির্বাচন করুন
                  </p>
                ) : (
                  <div className="space-y-3">
                    {/* Selected items */}
                    <div className="space-y-2">
                      {selectedSlots.map((s: any) => {
                        const meta = PLACEMENT_META[s.placement] || { name: s.placement };
                        return (
                          <div key={s.id} className="flex items-center justify-between text-sm">
                            <span>{meta.name}</span>
                            <span className="font-medium">৳{Number(s.price_per_month).toLocaleString("bn-BD")}/মাস</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-border pt-3 space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">মাসিক মোট</span>
                        <span>৳{monthlyTotal.toLocaleString("bn-BD")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">মেয়াদ</span>
                        <span>{durationOption.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">সাবটোটাল</span>
                        <span>৳{subtotal.toLocaleString("bn-BD")}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>ছাড় ({durationOption.discount}%)</span>
                          <span>-৳{discountAmount.toLocaleString("bn-BD")}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                      <span>মোট</span>
                      <span className="text-primary">৳{grandTotal.toLocaleString("bn-BD")}</span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full mt-4"
                  size="lg"
                  disabled={loading || selectedPlacements.length === 0 || !phone.trim()}
                  onClick={handleSubmit}
                >
                  {loading ? "পাঠানো হচ্ছে..." : `অর্ডার করুন${grandTotal > 0 ? ` — ৳${grandTotal.toLocaleString("bn-BD")}` : ""}`}
                </Button>

                {selectedPayment && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    পেমেন্ট: {paymentMethods?.find(p => p.slug === selectedPayment)?.name}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
