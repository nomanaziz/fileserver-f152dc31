import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import ProductCard from "@/components/ProductCard";
import CategorySidebar from "@/components/layout/CategorySidebar";
import Layout from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Index() {
  const { data: featured, isLoading: fl } = useProducts({ featured: true, limit: 6 });
  const { data: latest, isLoading: ll } = useProducts({ limit: 12 });
  const { data: categories } = useCategories();

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            আপনার প্রয়োজনীয় সব <span className="text-primary">সফটওয়্যার</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            সফটওয়্যার, গেমস, অ্যান্ড্রয়েড অ্যাপ, মুভি এবং আরও অনেক কিছু ডাউনলোড করুন।
          </p>
          <form className="max-w-lg mx-auto relative" action="/search" method="get">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              name="q"
              placeholder="কী খুঁজছেন লিখুন..."
              className="pl-11 h-12 text-base rounded-full"
            />
          </form>
        </div>
      </section>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-6">
              <CategorySidebar />
            </div>
          </aside>

          {/* Main content */}
          <div className="space-y-10">
            {/* Categories chips (mobile) */}
            {categories && categories.length > 0 && (
              <div className="flex flex-wrap gap-2 lg:hidden">
                {categories.filter(c => !c.parent_id).map((cat) => (
                  <Link key={cat.id} to={`/category/${cat.slug}`}>
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                      {cat.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Featured */}
            {(fl || (featured && featured.length > 0)) && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">ফিচার্ড</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {fl
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-video rounded-lg" />
                      ))
                    : featured?.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              </section>
            )}

            {/* Latest */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">সর্বশেষ আপলোড</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {ll
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-video rounded-lg" />
                    ))
                  : latest?.map((p) => <ProductCard key={p.id} product={p} />)}
                {!ll && latest?.length === 0 && (
                  <p className="col-span-full text-center text-muted-foreground py-12">
                    এখনও কোনো প্রোডাক্ট নেই।
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
