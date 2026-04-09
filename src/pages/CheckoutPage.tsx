import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "paystation_enabled")
        .maybeSingle();
      return data?.value === "true";
    },
  });

  if (!user) {
    navigate("/login");
    return null;
  }

  const total = cartItems?.reduce((sum: number, item: any) => sum + (item.products?.price || 0), 0) || 0;

  const handlePayStation = async () => {
    if (!cartItems || cartItems.length === 0) return;
    setProcessing(true);
    try {
      // Create a pending payment record for the total
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

      // Call edge function
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
        // Clear cart before redirect
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
          status: "completed",
          payment_method: "manual",
          vendor_id: product?.vendor_id || null,
        });
        if (error) throw error;
      }
      for (const item of cartItems) {
        await supabase.from("cart_items").delete().eq("id", item.id);
      }
      toast.success("পেমেন্ট সফল হয়েছে!");
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

          {paystationEnabled ? (
            <Button className="w-full h-11" onClick={handlePayStation} disabled={processing || !cartItems?.length}>
              {processing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> প্রসেসিং...</>
              ) : (
                `PayStation দিয়ে পে করুন — ৳${total}`
              )}
            </Button>
          ) : (
            <Button className="w-full h-11" onClick={handleManualCheckout} disabled={processing || !cartItems?.length}>
              {processing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> প্রসেসিং...</>
              ) : (
                `পে করুন — ৳${total}`
              )}
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
