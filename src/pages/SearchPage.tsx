import { useSearchParams } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import ProductCard from "@/components/ProductCard";
import Layout from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Search as SearchIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [query, setQuery] = useState(q);
  const [categoryId, setCategoryId] = useState<string>("");
  const { data: products, isLoading } = useProducts({ search: q || undefined, category_id: categoryId || undefined });
  const { data: categories } = useCategories();

  useEffect(() => { setQuery(q); }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query });
  };

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">সার্চ</h1>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="খুঁজুন..." className="pl-9" />
          </form>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="সব ক্যাটাগরি" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">সব ক্যাটাগরি</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-video rounded-lg" />)
            : products?.map((p) => <ProductCard key={p.id} product={p} />)}
          {!isLoading && products?.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-12">
              {q ? `"${q}" এর জন্য কোনো ফলাফল নেই।` : "কিছু সার্চ করুন।"}
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
