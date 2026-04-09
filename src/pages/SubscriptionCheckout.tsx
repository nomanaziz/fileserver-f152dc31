import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Crown, Loader2, Copy, Check, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export default function SubscriptionCheckout() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan");
  const [processing, setProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const { data: plan } = useQuery({
    queryKey: ["plan-detail", planId],
    queryFn: async () => {
      const { data, error } = await supabase.from("subscription_plans").select("*").eq("id", planId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!planId,
  });

  const { data: paymentMethods, isLoading: methodsLoading } = useQuery({
    queryKey: ["active-payment-methods"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payment_methods").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: paystationEnabled } = useQuery({
    queryKey: ["paystation-enabled"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "paystation_enabled").maybeSingle();
      return data?.value === "true";
    },
  });

  const { data: bkashEnabled } = useQuery({
    queryKey: ["bkash-enabled"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "bkash_enabled").maybeSingle();
      return data?.value === "true";
    },
  });

  if (!user) { navigate("/login"); return null; }
  if (!planId) { navigate("/pricing"); return null; }

  const formatDuration = (days: number) => {
    if (days >= 36500) return "Lifetime";
    if (days >= 365) return `${Math.round(days / 365)} Year`;
    if (days >= 30) return `${Math.round(days / 30)} Month`;
    return `${days} Days`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("কপি করা হয়েছে!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBkash = async () => {
    if (!plan) return;
    setProcessing(true);
    try {
      const { data: payment, error: payErr } = await supabase
        .from("payments")
        .insert({ user_id: user.id, amount: plan.price, status: "pending", payment_method: "bkash" })
        .select("id").single();
      if (payErr) throw payErr;

      const { data, error } = await supabase.functions.invoke("bkash-initiate", {
        body: {
          payment_id: payment.id,
          amount: plan.price,
          cust_name: profile?.display_name || user.email,
          cust_email: user.email,
          cust_phone: profile?.phone || "",
          subscription_plan_id: plan.id,
          redirect_url: window.location.origin + "/dashboard",
        },
      });
      if (error) throw error;
      if (data?.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error("Payment URL not received");
      }
    } catch (e: any) {
      toast.error(e.message || "bKash পেমেন্ট শুরু করা যায়নি");
    } finally {
      setProcessing(false);
    }
  };

  const handlePayStation = async () => {
    if (!plan) return;
    setProcessing(true);
    try {
      const { data: payment, error: payErr } = await supabase
        .from("payments")
        .insert({ user_id: user.id, amount: plan.price, status: "pending", payment_method: "paystation" })
        .select("id").single();
      if (payErr) throw payErr;

      const { data, error } = await supabase.functions.invoke("paystation-initiate", {
        body: {
          payment_id: payment.id,
          amount: plan.price,
          cust_name: profile?.display_name || user.email,
          cust_email: user.email,
          cust_phone: profile?.phone || "",
          subscription_plan_id: plan.id,
          redirect_url: window.location.origin + "/dashboard",
        },
      });
      if (error) throw error;
      if (data?.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error("Payment URL not received");
      }
    } catch (e: any) {
      toast.error(e.message || "পেমেন্ট শুরু করা যায়নি");
    } finally {
      setProcessing(false);
    }
  };

  const handleManualCheckout = async () => {
    if (!plan) return;
    setProcessing(true);
    try {
      const { error: payError } = await supabase.from("payments").insert({
        user_id: user.id,
        amount: plan.price,
        status: "pending",
        payment_method: selectedMethod || "manual",
      });
      if (payError) throw payError;
      toast.success("পেমেন্ট রিকোয়েস্ট পাঠানো হয়েছে! অ্যাডমিন কনফার্ম করলে সাবস্ক্রিপশন সক্রিয় হবে।");
      navigate("/dashboard");
    } catch (e: any) {
      toast.error(e.message || "পেমেন্ট ব্যর্থ হয়েছে");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Crown className="h-6 w-6 text-primary" /> সাবস্ক্রাইব করুন
        </h1>

        <div className="space-y-6">
          {plan ? (
            <Card className="border-primary/30">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {formatDuration(plan.duration_days)} · {plan.daily_download_limit} downloads/day · {plan.total_download_limit} total
                </p>
                <div className="flex justify-between font-bold text-lg border-t border-border pt-3">
                  <span>মোট</span>
                  <span>৳{plan.price}</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Skeleton className="h-32 w-full" />
          )}

          {/* Payment Gateway Buttons */}
          <div className="space-y-3">
            {bkashEnabled && (
              <Button
                className="w-full h-11 bg-[#E2136E] hover:bg-[#C8115F] text-white"
                onClick={handleBkash}
                disabled={processing || !plan}
              >
                {processing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> প্রসেসিং...</>
                ) : (
                  <><Smartphone className="h-4 w-4 mr-2" /> bKash দিয়ে পে করুন — ৳{plan?.price || 0}</>
                )}
              </Button>
            )}

            {paystationEnabled && (
              <Button className="w-full h-11" onClick={handlePayStation} disabled={processing || !plan}>
                {processing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> প্রসেসিং...</>
                ) : (
                  `PayStation দিয়ে পে করুন — ৳${plan?.price || 0}`
                )}
              </Button>
            )}
          </div>

          {/* Manual Payment Methods */}
          {methodsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : paymentMethods && paymentMethods.length > 0 ? (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-3 text-sm">ম্যানুয়াল পেমেন্ট মেথড</h3>
                <div className="space-y-3">
                  {paymentMethods.map((pm) => (
                    <div
                      key={pm.id}
                      onClick={() => setSelectedMethod(pm.slug)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedMethod === pm.slug
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {pm.logo_url ? (
                          <img src={pm.logo_url} alt={pm.name} className="h-8 w-8 rounded object-contain" />
                        ) : (
                          <div className="h-8 w-8 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: pm.color || "#E2136E" }}>
                            {pm.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-sm">{pm.name}</p>
                          {pm.account_type && <p className="text-xs text-muted-foreground">{pm.account_type}</p>}
                        </div>
                      </div>
                      {pm.account_number && (
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
                      {pm.instructions && (
                        <p className="text-xs text-muted-foreground mt-2">{pm.instructions}</p>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full h-11 mt-4"
                  variant="outline"
                  onClick={handleManualCheckout}
                  disabled={processing || !plan || !selectedMethod}
                >
                  {processing ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> প্রসেসিং...</>
                  ) : (
                    "পেমেন্ট করেছি — কনফার্ম করুন"
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : !bkashEnabled && !paystationEnabled ? (
            <p className="text-center text-muted-foreground text-sm">কোনো পেমেন্ট মেথড সক্রিয় নেই।</p>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}
