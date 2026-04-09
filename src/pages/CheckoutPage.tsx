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
  const { user } = useAuth();
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

  if (!user) {
    navigate("/login");
    return null;
  }

  const total = cartItems?.reduce((sum: number, item: any) => sum + (item.products?.price || 0), 0) || 0;

  const handleCheckout = async () => {
    if (!cartItems || cartItems.length === 0) return;
    setProcessing(true);
    try {
      // Create payment records for each cart item
      for (const item of cartItems) {
        const { error } = await supabase.from("payments").insert({
          user_id: user.id,
          product_id: item.product_id,
          amount: item.products?.price || 0,
          status: "completed",
          payment_method: "manual",
        });
        if (error) throw error;
      }

      // Clear cart
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

          <Button className="w-full h-11" onClick={handleCheckout} disabled={processing || !cartItems?.length}>
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                প্রসেসিং...
              </>
            ) : (
              `পে করুন — ৳${total}`
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
