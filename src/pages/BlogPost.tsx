import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { ArrowLeft, Calendar, Clock, BookOpen, Share2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").eq("slug", slug!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: relatedPosts } = useQuery({
    queryKey: ["related-posts", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug, thumbnail_url, published_at")
        .eq("is_published", true)
        .neq("slug", slug!)
        .order("published_at", { ascending: false })
        .limit(3);
      return data || [];
    },
    enabled: !!slug,
  });

  const estimateReadTime = (content?: string | null) => {
    if (!content) return "১ মিনিট";
    const words = content.split(/\s+/).length;
    const mins = Math.max(1, Math.ceil(words / 200));
    return `${mins} মিনিট`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("লিংক কপি হয়েছে!");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full rounded-xl mb-6" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/3 mb-8" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-1">পোস্ট পাওয়া যায়নি</h2>
          <p className="text-sm text-muted-foreground mb-4">এই পোস্টটি মুছে ফেলা হয়েছে বা পাওয়া যাচ্ছে না।</p>
          <Button variant="outline" asChild>
            <Link to="/blog">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              ব্লগে ফিরে যান
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back + Share */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            ব্লগে ফিরে যান
          </Link>
          <Button variant="ghost" size="sm" onClick={handleShare} className="text-xs gap-1.5">
            <Share2 className="h-3.5 w-3.5" />
            শেয়ার
          </Button>
        </div>

        {/* Thumbnail */}
        {post.thumbnail_url && (
          <div className="rounded-xl overflow-hidden mb-6 border border-border">
            <img src={post.thumbnail_url} alt={post.title} className="w-full aspect-video object-cover" />
          </div>
        )}

        {/* Title + Meta */}
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-8 pb-6 border-b border-border">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {post.published_at
              ? new Date(post.published_at).toLocaleDateString("bn-BD", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : ""}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {estimateReadTime(post.content)} পড়ার সময়
          </span>
        </div>

        {/* Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-lg font-bold mb-5">আরও পড়ুন</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((rp) => (
                <Link key={rp.id} to={`/blog/${rp.slug}`} className="group">
                  <div className="rounded-lg border border-border overflow-hidden hover:border-primary/30 transition-all">
                    <div className="aspect-video bg-muted overflow-hidden">
                      {rp.thumbnail_url ? (
                        <img
                          src={rp.thumbnail_url}
                          alt={rp.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-muted-foreground/20" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        {rp.published_at ? new Date(rp.published_at).toLocaleDateString("bn-BD") : ""}
                      </p>
                      <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {rp.title}
                      </h4>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </Layout>
  );
}
