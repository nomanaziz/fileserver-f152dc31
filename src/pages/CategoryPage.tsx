import { useState } from "react";
import { useParams } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useCategoryBySlug, useCategories } from "@/hooks/useCategories";
import ProductCard from "@/components/ProductCard";
import CategorySidebar from "@/components/layout/CategorySidebar";
import Layout from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import AdPlaceholder from "@/components/AdPlaceholder";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category } = useCategoryBySlug(slug);
  const { data: allCategories } = useCategories();
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([]);

  // Determine if this is a parent category (has children) or a subcategory
  const isParent = allCategories?.some((c) => c.parent_id === category?.id);
  const parentId = isParent ? category?.id : category?.parent_id;

  // Build category_ids for filtering
  const filterCategoryIds =
    selectedSubcategoryIds.length > 0
      ? selectedSubcategoryIds
      : undefined;

  const { data: products, isLoading } = useProducts({
    category_id: !filterCategoryIds ? category?.id : undefined,
    category_ids: filterCategoryIds,
  });

  return (
    <Layout>
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <CategorySidebar
                parentCategoryId={parentId}
                selectedSubcategoryIds={selectedSubcategoryIds}
                onSelectionChange={setSelectedSubcategoryIds}
              />
              <div className="mt-6">
                <AdPlaceholder placement="sidebar" />
              </div>
            </div>
          </aside>
          <div>
            <h1 className="text-2xl font-bold mb-6">{category?.name || "ক্যাটাগরি"}</h1>
            {category?.description && (
              <p className="text-muted-foreground mb-6">{category.description}</p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-video rounded-lg" />
                  ))
                : products?.map((p) => <ProductCard key={p.id} product={p} />)}
              {!isLoading && products?.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-12">
                  এই ক্যাটাগরিতে কোনো প্রোডাক্ট নেই।
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
