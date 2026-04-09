import { Link, useNavigate } from "react-router-dom";
import { Download, Monitor, Smartphone, Gamepad2, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CategoryPlaceholder from "@/components/CategoryPlaceholder";
import type { Product } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites";

const osIcons: Record<string, any> = {
  windows: Monitor,
  android: Smartphone,
  mac: Monitor,
  linux: Monitor,
  ios: Smartphone,
  cross_platform: Gamepad2,
};

const categoryColors: Record<string, string> = {
  software: "217 91% 60%",
  android: "142 71% 45%",
  games: "271 76% 53%",
  movies: "0 84% 60%",
  tutorials: "45 93% 47%",
  graphics: "330 81% 60%",
  "source-code": "187 85% 53%",
};

function getCatColor(slug?: string | null): string {
  return slug ? categoryColors[slug] || "262 83% 58%" : "262 83% 58%";
}

interface ProductCardProps {
  product: Product;
  variant?: "grid" | "list";
}

export default function ProductCard({ product, variant = "grid" }: ProductCardProps) {
  const OsIcon = product.os_type ? osIcons[product.os_type] || Monitor : Monitor;
  const catColor = getCatColor(product.categories?.slug);
  const { user } = useAuth();
  const { data: favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const navigate = useNavigate();
  const isFavorited = favorites?.some((f) => f.product_id === product.id) || false;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    toggleFavorite.mutate(product.id);
  };

  if (variant === "list") {
    return (
      <Link to={`/product/${product.slug}`} className="list-row group">
        <div className="h-14 w-20 rounded-md bg-muted overflow-hidden shrink-0">
          {product.thumbnail_url ? (
            <img src={product.thumbnail_url} alt={product.title} className="w-full h-full object-cover" loading="lazy" />
          ) : product.screenshots && product.screenshots.length > 0 ? (
            <img src={product.screenshots[0]} alt={product.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <CategoryPlaceholder categorySlug={product.categories?.slug} className="w-full h-full" iconSize="sm" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold truncate group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
            {product.description || "No description available"}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {product.categories && (
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5" style={{ backgroundColor: `hsl(${catColor} / 0.1)`, color: `hsl(${catColor})` }}>
              {product.categories.name}
            </Badge>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <OsIcon className="h-3 w-3" />
          </div>
          {product.file_size && (
            <span className="text-[11px] text-muted-foreground">{product.file_size}</span>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Download className="h-3 w-3" />
            <span>{product.download_count}</span>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {product.is_paid ? (
            <Badge className="bg-primary text-primary-foreground border-0 text-xs">৳{product.price}</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">Free</Badge>
          )}
          <Button size="sm" variant="outline" className="h-7 px-2.5 text-[11px] gap-1" onClick={(e) => e.stopPropagation()}>
            <Download className="h-3 w-3" />
            Download
          </Button>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/product/${product.slug}`}>
      <Card className="group overflow-hidden border-border bg-card card-hover">
        <div className="h-0.5" style={{ background: `hsl(${catColor})` }} />

        <div className="aspect-video bg-muted relative overflow-hidden">
          {product.thumbnail_url ? (
            <img
              src={product.thumbnail_url}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : product.screenshots && product.screenshots.length > 0 ? (
            <img
              src={product.screenshots[0]}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <CategoryPlaceholder categorySlug={product.categories?.slug} className="w-full h-full" iconSize="lg" />
          )}

          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 left-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
          </button>

          <div className="absolute top-2 right-2">
            {product.is_paid ? (
              <Badge className="bg-primary text-primary-foreground border-0 shadow-sm text-[11px]">
                ৳{product.price}
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm border-0 text-[11px]">
                Free
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-3">
          <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {product.categories && (
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                  style={{ backgroundColor: `hsl(${catColor} / 0.1)`, color: `hsl(${catColor})` }}
                >
                  {product.categories.name}
                </span>
              )}
              {product.version && <span className="text-[10px]">v{product.version}</span>}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Download className="h-3 w-3" />
                <span>{product.download_count}</span>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            className="w-full mt-2.5 h-8 text-xs gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Download className="h-3.5 w-3.5" />
            ডাউনলোড করুন
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
