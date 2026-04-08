import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Eye } from "lucide-react";
import { Product } from "@/hooks/useProducts";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/product/${product.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 h-full">
        <div className="aspect-video bg-muted relative overflow-hidden">
          {product.thumbnail_url ? (
            <img
              src={product.thumbnail_url}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Download className="h-10 w-10" />
            </div>
          )}
          {product.is_featured && (
            <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">ফিচার্ড</Badge>
          )}
          {product.is_paid && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              ৳{product.price}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {product.download_count}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {product.view_count}
            </span>
            {product.categories && (
              <Badge variant="outline" className="text-[10px]">
                {product.categories.name}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
