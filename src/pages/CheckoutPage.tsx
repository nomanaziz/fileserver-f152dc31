import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Loader2, Copy, Check, Smartphone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export default function CheckoutPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { data: cartItems } = useCart();
  const [processing, setProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

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

  const total = cartItems?.reduce((sum: number, item: any) => sum + (item.products?.price || 0), 0) || 0;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("কপি করা হয়েছে!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBkash = async () => {
    if (!cartItems || cartItems.length === 0) return;
    setProcessing(true);
    try {
      const firstProduct = cartItems[0]?.products as any;
      const { data: payment, error: payErr } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          product_id: cartItems.length === 1 ? cartItems[0].product_id : null,
          amount: total,
          status: "pending",
          payment_method: "bkash",
          vendor_id: firstProduct?.vendor_id || null,
        })
        .select("id")
        .single();
      if (payErr) throw payErr;

      const { data, error } = await supabase.functions.invoke("bkash-initiate", {
        body: {
          payment_id: payment.id,
          amount: total,
          cust_name: profile?.display_name || user.email,
          cust_email: user.email,
          cust_phone: profile?.phone || "",
          product_id: cartItems.length === 1 ? cartItems[0].product_id : null,
          vendor_id: firstProduct?.vendor_id || null,
          redirect_url: window.location.origin + "/dashboard",
        },
      });

      if (error) throw error;
      if (data?.payment_url) {
        for (const item of cartItems) {
          await supabase.from("cart_items").delete().eq("id", item.id);
        }
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
    if (!cartItems || cartItems.length === 0) return;
    setProcessing(true);
    try {
      const firstProduct = cartItems[0]?.products as any;
      const { data: payment, error: payErr } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          product_id: cartItems.length === 1 ? cartItems[0].product_id : null,
          amount: total,
          status: "pending",
          payment_method: "paystation",
          vendor_id: firstProduct?.vendor_id || null,
        })
        .select("id")
        .single();
      if (payErr) throw payErr;

      const { data, error } = await supabase.functions.invoke("paystation-initiate", {
        body: {
          payment_id: payment.id,
          amount: total,
          cust_name: profile?.display_name || user.email,
          cust_email: user.email,
          cust_phone: profile?.phone || "",
          product_id: cartItems.length === 1 ? cartItems[0].product_id : null,
          vendor_id: firstProduct?.vendor_id || null,
          redirect_url: window.location.origin + "/dashboard",
        },
      });

      if (error) throw error;
      if (data?.payment_url) {
        for (const item of cartItems) {
          await supabase.from("cart_items").delete().eq("id", item.id);
        }
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
    if (!cartItems || cartItems.length === 0) return;
    setProcessing(true);
    try {
      for (const item of cartItems) {
        const product = item.products as any;
        const { error } = await supabase.from("payments").insert({
          user_id: user.id,
          product_id: item.product_id,
          amount: product?.price || 0,
          status: "pending",
          payment_method: selectedMethod || "manual",
          vendor_id: product?.vendor_id || null,
        });
        if (error) throw error;
      }
      for (const item of cartItems) {
        await supabase.from("cart_items").delete().eq("id", item.id);
      }
      toast.success("পেমেন্ট রিকোয়েস্ট পাঠানো হয়েছে! অ্যাডমিন কনফার্ম করলে অ্যাক্সেস পাবেন।");
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
          <CreditCard className="h-6 w-6" /> চেকআউট
        </h1>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold mb-3">অর্ডার সামারি</h3>
              {cartItems?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                  <span>{item.products?.title}</span>
                  <span className="font-medium">৳{item.products?.price || 0}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold mt-3 pt-3 border-t border-border">
                <span>মোট</span>
                <span>৳{total}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Gateway Buttons */}
          <div className="space-y-3">
            {bkashEnabled && (
              <Button
                className="w-full h-11 bg-[#E2136E] hover:bg-[#C8115F] text-white"
                onClick={handleBkash}
                disabled={processing || !cartItems?.length}
              >
                {processing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> প্রসেসিং...</>
                ) : (
                  <><Smartphone className="h-4 w-4 mr-2" /> bKash দিয়ে পে করুন — ৳{total}</>
                )}
              </Button>
            )}

            {paystationEnabled && (
              <Button
                className="w-full h-11"
                onClick={handlePayStation}
                disabled={processing || !cartItems?.length}
              >
                {processing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> প্রসেসিং...</>
                ) : (
                  `PayStation দিয়ে পে করুন — ৳${total}`
                )}
              </Button>
            )}
          </div>

          {/* Manual Payment Methods — Radio-style collapsed/expanded */}
          {methodsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : paymentMethods && paymentMethods.length > 0 ? (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-4 text-sm">পেমেন্ট মেথড সিলেক্ট করুন</h3>
                <RadioGroup
                  value={selectedMethod || ""}
                  onValueChange={(val) => setSelectedMethod(val)}
                  className="space-y-2"
                >
                  {paymentMethods.map((pm) => {
                    const isSelected = selectedMethod === pm.slug;
                    return (
                      <div
                        key={pm.id}
                        className={`rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        {/* Header — always visible */}
                        <label
                          htmlFor={`pm-${pm.id}`}
                          className="flex items-center gap-3 p-3 cursor-pointer"
                        >
                          <RadioGroupItem value={pm.slug} id={`pm-${pm.id}`} />
                          {pm.logo_url ? (
                            <img src={pm.logo_url} alt={pm.name} className="h-7 w-7 rounded object-contain" />
                          ) : (
                            <div
                              className="h-7 w-7 rounded flex items-center justify-center text-white text-xs font-bold shrink-0"
                              style={{ backgroundColor: pm.color || "#E2136E" }}
                            >
                              {pm.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{pm.name}</p>
                            {pm.account_type && (
                              <p className="text-xs text-muted-foreground">{pm.account_type}</p>
                            )}
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform ${
                              isSelected ? "rotate-180" : ""
                            }`}
                          />
                        </label>

                        {/* Expanded details — only when selected */}
                        {isSelected && (
                          <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border/50">
                            {pm.account_number && (
                              <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2">
                                <span className="text-sm font-mono flex-1">{pm.account_number}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2"
                                  onClick={() => copyToClipboard(pm.account_number!, pm.id)}
                                >
                                  {copiedId === pm.id ? (
                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </div>
                            )}
                            {pm.bank_name && (
                              <p className="text-xs text-muted-foreground">
                                ব্যাংক: {pm.bank_name}
                                {pm.branch_name && ` — ${pm.branch_name}`}
                              </p>
                            )}
                            {pm.routing_number && (
                              <p className="text-xs text-muted-foreground">
                                রাউটিং নম্বর: {pm.routing_number}
                              </p>
                            )}
                            {pm.instructions && (
                              <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                                {pm.instructions}
                              </p>
                            )}

                            <Button
                              className="w-full h-10 mt-2"
                              onClick={handleManualCheckout}
                              disabled={processing || !cartItems?.length}
                            >
                              {processing ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> প্রসেসিং...</>
                              ) : (
                                `পেমেন্ট করেছি — কনফার্ম করুন (৳${total})`
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </RadioGroup>
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
