import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function VendorStore() {
  const { id } = useParams<{ id: string }>();

  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ["vendor-store", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: products } = useQuery({
    queryKey: ["vendor-store-products", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories!products_category_id_fkey(name, slug)")
        .eq("vendor_id", id!)
        .eq("is_vendor_product", true)
        .eq("vendor_status", "approved")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (vendorLoading) return <Layout><div className="container py-8"><Skeleton className="h-32 w-full" /></div></Layout>;
  if (!vendor) return <Layout><div className="container py-16 text-center text-muted-foreground">ভেন্ডর পাওয়া যায়নি</div></Layout>;

  return (
    <Layout>
      <div className="container py-8 space-y-8">
        <div className="flex items-center gap-4">
          {vendor.logo_url ? (
            <img src={vendor.logo_url} alt={vendor.store_name} className="h-16 w-16 rounded-full object-cover border" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center"><Store className="h-8 w-8 text-primary" /></div>
          )}
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {vendor.store_name}
              {vendor.is_verified && <Badge className="gap-1"><ShieldCheck className="h-3 w-3" /> ভেরিফাইড</Badge>}
            </h1>
            {vendor.store_description && <p className="text-muted-foreground text-sm mt-1">{vendor.store_description}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products?.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {products?.length === 0 && <p className="text-center text-muted-foreground py-8">কোনো প্রোডাক্ট নেই</p>}
      </div>
    </Layout>
  );
}
