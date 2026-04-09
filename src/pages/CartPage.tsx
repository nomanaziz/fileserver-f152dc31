import { Link, Navigate } from "react-router-dom";
import { ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useCart, useCartMutations } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: cartItems, isLoading } = useCart();
  const { removeFromCart } = useCartMutations();

  if (!authLoading && !user) return <Navigate to="/login" replace />;

  const total = cartItems?.reduce((sum, item) => {
    const price = item.products?.is_paid ? Number(item.products.price) : 0;
    return sum + price * item.quantity;
  }, 0) || 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">কার্ট</h1>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : !cartItems?.length ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-1">কার্ট খালি</h2>
              <p className="text-muted-foreground text-sm mb-4">আপনার কার্টে কোনো পণ্য নেই</p>
              <Button asChild><Link to="/">পণ্য দেখুন</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-4">
                    <Link to={`/product/${item.products?.slug}`} className="h-14 w-20 rounded bg-muted overflow-hidden shrink-0">
                      {item.products?.thumbnail_url ? (
                        <img src={item.products.thumbnail_url} alt={item.products.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No img</div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.products?.slug}`} className="font-semibold truncate block hover:text-primary transition-colors">
                        {item.products?.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {item.products?.is_paid ? `৳${item.products.price}` : "ফ্রি"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 shrink-0"
                      onClick={() => removeFromCart.mutate(item.product_id)}
                      disabled={removeFromCart.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-muted-foreground">মোট</span>
                  <span className="text-xl font-bold">৳{total}</span>
                </div>
                <Separator className="mb-3" />
                <Button asChild className="w-full gap-2">
                  <Link to="/checkout">
                    চেকআউট করুন
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
