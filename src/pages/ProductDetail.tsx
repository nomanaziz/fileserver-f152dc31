import { useParams, Link } from "react-router-dom";
import { useProductBySlug } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { useToggleFavorite } from "@/hooks/useFavorites";
import { useCartMutations } from "@/hooks/useCart";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Heart, ShoppingCart, ArrowLeft, Monitor, HardDrive, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProductBySlug(slug);
  const { user } = useAuth();
  const toggleFav = useToggleFavorite();
  const { addToCart } = useCartMutations();

  const { data: downloads } = useQuery({
    queryKey: ["product-downloads", product?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_downloads")
        .select("*, download_servers(name, label)")
        .eq("product_id", product!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!product?.id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">প্রোডাক্ট পাওয়া যায়নি।</p>
          <Button asChild className="mt-4"><Link to="/">হোমে যান</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> ফিরে যান
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          <div className="space-y-6">
            {/* Thumbnail */}
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              {product.thumbnail_url ? (
                <img src={product.thumbnail_url} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Download className="h-16 w-16" />
                </div>
              )}
            </div>

            {/* Screenshots */}
            {product.screenshots && product.screenshots.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">স্ক্রিনশট</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {product.screenshots.map((s, i) => (
                    <img key={i} src={s} alt={`Screenshot ${i + 1}`} className="rounded-md" loading="lazy" />
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-3">বিবরণ</h3>
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                {product.description || "কোনো বিবরণ নেই।"}
              </div>
            </div>
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{product.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {product.categories && (
                    <Badge variant="outline">{product.categories.name}</Badge>
                  )}
                  <Badge variant="secondary">{product.content_type}</Badge>
                  {product.is_paid && <Badge>৳{product.price}</Badge>}
                  {!product.is_paid && <Badge variant="secondary">ফ্রি</Badge>}
                </div>

                <div className="space-y-2 text-sm">
                  {product.version && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Monitor className="h-4 w-4" /> ভার্সন: {product.version}
                    </div>
                  )}
                  {product.os_type && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <HardDrive className="h-4 w-4" /> OS: {product.os_type}
                    </div>
                  )}
                  {product.file_size && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <HardDrive className="h-4 w-4" /> সাইজ: {product.file_size}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" /> {new Date(product.created_at).toLocaleDateString("bn-BD")}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Download className="h-4 w-4" /> {product.download_count} ডাউনলোড
                  </div>
                </div>

                <div className="flex gap-2">
                  {user && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          toggleFav.mutate(product.id);
                          toast.success("ফেভারিট আপডেট হয়েছে!");
                        }}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      {product.is_paid && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            addToCart.mutate(product.id);
                            toast.success("কার্টে যোগ হয়েছে!");
                          }}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" /> কার্টে যোগ করুন
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Download links */}
            {downloads && downloads.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">ডাউনলোড লিংক</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {downloads.map((dl: any) => (
                    <a
                      key={dl.id}
                      href={dl.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-md border hover:bg-muted transition-colors text-sm"
                    >
                      <Download className="h-4 w-4 text-primary" />
                      <span>{dl.download_servers?.label || dl.download_servers?.name || "Server"}</span>
                      {dl.file_size && <span className="text-muted-foreground ml-auto">{dl.file_size}</span>}
                    </a>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
