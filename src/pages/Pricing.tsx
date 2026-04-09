import { useNavigate } from "react-router-dom";
import { Crown, Check, Zap, Star, Download, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveSubscription } from "@/hooks/useSubscription";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: activeSub } = useActiveSubscription();

  const { data: plans, isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("price");
      if (error) throw error;
      return data;
    },
  });

  const handleSubscribe = (planId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/checkout/subscription?plan=${planId}`);
  };

  const formatDuration = (days: number) => {
    if (days >= 36500) return "Lifetime";
    if (days >= 365) return `${Math.round(days / 365)} Year${days >= 730 ? "s" : ""}`;
    if (days >= 30) return `${Math.round(days / 30)} Month${days >= 60 ? "s" : ""}`;
    return `${days} Day${days > 1 ? "s" : ""}`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Crown className="h-4 w-4" /> সাবস্ক্রিপশন প্ল্যান
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            আনলিমিটেড ডাউনলোড আনলক করুন
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            একটি প্ল্যান সাবস্ক্রাইব করুন এবং আপনার প্ল্যান লিমিটের মধ্যে সব paid সফটওয়্যার ফ্রিতে ডাউনলোড করুন।
          </p>
        </div>

        {activeSub && (
          <div className="max-w-md mx-auto mb-8">
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4 flex items-center gap-3">
                <Check className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium">আপনার একটি সক্রিয় সাবস্ক্রিপশন আছে</p>
                  <p className="text-xs text-muted-foreground">
                    মেয়াদ: {new Date(activeSub.ends_at).toLocaleDateString("bn-BD")}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="ml-auto" onClick={() => navigate("/dashboard")}>
                  দেখুন
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 space-y-4">
                  <div className="h-6 w-24 bg-muted rounded" />
                  <div className="h-10 w-32 bg-muted rounded" />
                  <div className="space-y-2">
                    {[1, 2, 3].map((j) => <div key={j} className="h-4 w-full bg-muted rounded" />)}
                  </div>
                  <div className="h-10 w-full bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans?.map((plan, idx) => {
              const isPopular = idx === 1;
              const isActive = activeSub?.plan_id === plan.id;
              return (
                <Card
                  key={plan.id}
                  className={`relative transition-all hover:shadow-lg ${
                    isPopular ? "border-primary shadow-md scale-[1.02]" : "border-border"
                  } ${isActive ? "ring-2 ring-primary" : ""}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground gap-1">
                        <Star className="h-3 w-3" /> Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6 space-y-5">
                    <div>
                      <h3 className="text-lg font-bold">{plan.name}</h3>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDuration(plan.duration_days)}
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">৳{plan.price}</span>
                      <span className="text-muted-foreground text-sm">
                        /{plan.duration_days >= 36500 ? "one-time" : formatDuration(plan.duration_days).toLowerCase()}
                      </span>
                    </div>

                    <ul className="space-y-2.5 text-sm">
                      <li className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-primary shrink-0" />
                        <span>{plan.daily_download_limit} downloads/day</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary shrink-0" />
                        <span>{plan.total_download_limit} total downloads</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span>All paid software included</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span>Priority support</span>
                      </li>
                    </ul>

                    <Button
                      className="w-full"
                      variant={isPopular ? "default" : "outline"}
                      disabled={isActive}
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      {isActive ? "বর্তমান প্ল্যান" : "সাবস্ক্রাইব করুন"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
