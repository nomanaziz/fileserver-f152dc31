import { Link, Navigate } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: favorites, isLoading } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  if (!authLoading && !user) return <Navigate to="/login" replace />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="h-6 w-6 text-red-500 fill-red-500" />
          <h1 className="text-2xl font-bold">আমার ফেভারিট</h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        ) : !favorites?.length ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Heart className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-1">কোনো ফেভারিট নেই</h2>
              <p className="text-muted-foreground text-sm mb-4">আপনার পছন্দের সফটওয়্যার এখানে দেখা যাবে</p>
              <Button asChild><Link to="/">ব্রাউজ করুন</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((fav) => (
              <Card key={fav.id} className="group overflow-hidden">
                <CardContent className="p-0">
                  <Link to={`/product/${fav.products?.slug}`} className="flex gap-3 p-3">
                    <div className="h-16 w-20 rounded bg-muted overflow-hidden shrink-0">
                      {fav.products?.thumbnail_url ? (
                        <img src={fav.products.thumbnail_url} alt={fav.products.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Heart className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                        {fav.products?.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {fav.products?.is_paid ? `৳${fav.products.price}` : "ফ্রি"}
                      </p>
                    </div>
                  </Link>
                  <div className="px-3 pb-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs gap-1 text-red-500 hover:text-red-600"
                      onClick={() => toggleFavorite.mutate(fav.product_id)}
                      disabled={toggleFavorite.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                      ফেভারিট থেকে সরান
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
