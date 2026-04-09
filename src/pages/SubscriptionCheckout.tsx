import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export default function SubscriptionCheckout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan");
  const [processing, setProcessing] = useState(false);

  const { data: plan } = useQuery({
    queryKey: ["plan-detail", planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("id", planId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!planId,
  });

  const { data: paymentMethods, isLoading: methodsLoading } = useQuery({
    queryKey: ["active-payment-methods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
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

  const handleCheckout = async () => {
    if (!plan) return;
    setProcessing(true);
    try {
      // Create subscription
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + plan.duration_days);

      const { error: subError } = await supabase.from("subscriptions").insert({
        user_id: user.id,
        plan_id: plan.id,
        ends_at: endsAt.toISOString(),
        is_active: true,
        status: "active",
      });
      if (subError) throw subError;

      // Create payment record
      const { error: payError } = await supabase.from("payments").insert({
        user_id: user.id,
        amount: plan.price,
        status: "completed",
        payment_method: "manual",
      });
      if (payError) throw payError;

      toast.success("সাবস্ক্রিপশন সফল হয়েছে!");
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

          {methodsLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : paymentMethods && paymentMethods.length > 0 ? (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-2 text-sm text-muted-foreground">
                  পেমেন্ট মেথড
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {paymentMethods.map((pm) => (
                    <div key={pm.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-xs font-medium">
                      {pm.logo_url ? (
                        <img src={pm.logo_url} alt={pm.name} className="h-4 w-4 rounded object-contain" />
                      ) : (
                        <div className="h-4 w-4 rounded" style={{ backgroundColor: pm.color || "#ccc" }} />
                      )}
                      {pm.name}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Button className="w-full h-11" onClick={handleCheckout} disabled={processing || !plan}>
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                প্রসেসিং...
              </>
            ) : (
              `পে করুন — ৳${plan?.price || 0}`
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
