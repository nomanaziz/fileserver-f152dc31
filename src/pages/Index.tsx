import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, TrendingUp, Clock, Sparkles, ArrowRight, Download, Flame, Monitor, Smartphone, Laptop } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/ProductCard";
import { useFeaturedProducts, useLatestProducts } from "@/hooks/useProducts";
import { useDevicePlatform, getPlatformLabel, matchesPlatform } from "@/hooks/useDevicePlatform";
import { useRecommendedProducts } from "@/hooks/useRecommendedProducts";
import SoftwareRequestForm from "@/components/SoftwareRequestForm";
import CategoryBanners from "@/components/CategoryBanners";
import AdPlaceholder from "@/components/AdPlaceholder";

export default function Index() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { data: featured, isLoading: loadingFeatured } = useFeaturedProducts();
  const { data: latest, isLoading: loadingLatest } = useLatestProducts();
  const platform = useDevicePlatform();
  const { data: recommended, isLoading: loadingRecommended } = useRecommendedProducts(platform);

  const platformLabel = getPlatformLabel(platform);
  const PlatformIcon = platform === "android" || platform === "ios" ? Smartphone : platform === "mac" ? Laptop : Monitor;

  const sortByRelevance = (products: typeof featured) => {
    if (!products || platform === "unknown") return products;
    const matched = products.filter((p) => matchesPlatform(p.categories?.slug, platform));
    const rest = products.filter((p) => !matchesPlatform(p.categories?.slug, platform));
    return [...matched, ...rest];
  };

  const sortedFeatured = sortByRelevance(featured);
  const sortedLatest = sortByRelevance(latest);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <Layout>
      {/* Compact Hero / Search */}
      <section className="py-8 md:py-10 border-b border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium mb-3">
              <Sparkles className="h-3 w-3" />
              Fast & Free Downloads
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2">
              Download <span className="text-gradient">Everything</span> You Need
            </h1>
            <p className="text-muted-foreground text-base">
              Software, apps, games, movies, tutorials & more.
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-lg mx-auto">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for software, apps, games..."
                className="h-11 pl-10 pr-24 text-sm bg-background border-border focus:border-primary/40 rounded-xl transition-all shadow-sm"
              />
              <Button type="submit" size="sm" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-5 rounded-lg text-xs">
                Search
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Category Banners */}
      <CategoryBanners />

      {/* Header Banner Ad */}
      <div className="container mx-auto px-4 pt-6">
        <AdPlaceholder placement="header-banner" />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Recommended for Your Device */}
            {platform !== "unknown" && (
              <section className="mb-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-md bg-accent/20 flex items-center justify-center">
                      <PlatformIcon className="h-3.5 w-3.5 text-accent-foreground" />
                    </div>
                    <h2 className="text-xl font-bold">Recommended for You</h2>
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5">{platformLabel}</Badge>
                  </div>
                </div>
                {loadingRecommended ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="aspect-video rounded-lg shimmer" />
                    ))}
                  </div>
                ) : recommended && recommended.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {recommended.slice(0, 6).map((p) => (
                      <ProductCard key={p.id} product={p} variant="grid" />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 rounded-xl border border-dashed border-border">
                    <p className="text-muted-foreground text-sm">No {platformLabel} content available yet.</p>
                  </div>
                )}
              </section>
            )}

            {/* Trending — List view */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Trending Downloads</h2>
                </div>
              </div>
              {loadingFeatured ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 rounded-lg shimmer" />
                  ))}
                </div>
              ) : sortedFeatured && sortedFeatured.length > 0 ? (
                <div className="space-y-1">
                  {sortedFeatured.slice(0, 6).map((p) => (
                    <ProductCard key={p.id} product={p} variant="list" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 rounded-xl border border-dashed border-border">
                  <p className="text-muted-foreground text-sm">No products yet. Check back soon!</p>
                </div>
              )}
            </section>

            {/* Latest — Grid view */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Latest Uploads</h2>
                </div>
              </div>
              {loadingLatest ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-video rounded-lg shimmer" />
                  ))}
                </div>
              ) : sortedLatest && sortedLatest.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {sortedLatest.map((p) => (
                    <ProductCard key={p.id} product={p} variant="grid" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 rounded-xl border border-dashed border-border">
                  <p className="text-muted-foreground text-sm">No uploads yet.</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            {/* Popular Downloads Widget */}
            <div className="rounded-xl border border-border bg-background p-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-4 w-4 text-destructive" />
                <h3 className="text-sm font-bold">Most Popular</h3>
              </div>
              {loadingFeatured ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 rounded shimmer" />
                  ))}
                </div>
              ) : featured && featured.length > 0 ? (
                <div className="space-y-1">
                  {featured.slice(0, 5).map((p, i) => (
                    <Link
                      key={p.id}
                      to={`/product/${p.slug}`}
                      className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-muted transition-colors group"
                    >
                      <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                      <div className="h-8 w-12 rounded bg-muted overflow-hidden shrink-0">
                        {p.thumbnail_url ? (
                          <img src={p.thumbnail_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : p.screenshots && p.screenshots.length > 0 ? (
                          <img src={p.screenshots[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{p.title}</p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Download className="h-2.5 w-2.5" />
                          {p.download_count}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Software Request Form */}
            <SoftwareRequestForm />

            {/* Sidebar Ad */}
            <div className="mb-6">
              <AdPlaceholder placement="sidebar" />
            </div>

            {/* Quick Categories */}
            <div className="rounded-xl border border-border bg-background p-4">
              <h3 className="text-sm font-bold mb-3">Quick Links</h3>
              <div className="space-y-1">
                {["software", "android", "games", "movies", "tutorials"].map((slug) => (
                  <Link
                    key={slug}
                    to={`/category/${slug}`}
                    className="flex items-center justify-between py-1.5 px-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <span className="capitalize">{slug}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
