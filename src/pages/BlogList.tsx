import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Newspaper, ArrowRight, BookOpen } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogList() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const featuredPost = posts?.[0];
  const otherPosts = posts?.slice(1);

  return (
    <Layout>
      {/* Hero */}
      <section className="border-b border-border bg-muted/30 py-10 md:py-14">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <Newspaper className="h-3.5 w-3.5" />
            ব্লগ ও আর্টিকেল
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">আমাদের ব্লগ</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            সফটওয়্যার, টেকনোলজি, টিপস ও ট্রিকস নিয়ে নতুন আর্টিকেল পড়ুন।
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {isLoading ? (
          <div className="space-y-8">
            <Skeleton className="h-72 w-full rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          </div>
        ) : posts && posts.length > 0 ? (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <Link to={`/blog/${featuredPost.slug}`} className="block mb-10 group">
                <Card className="overflow-hidden border-border hover:border-primary/30 transition-all">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="aspect-video md:aspect-auto md:min-h-[280px] bg-muted relative overflow-hidden">
                      {featuredPost.thumbnail_url ? (
                        <img
                          src={featuredPost.thumbnail_url}
                          alt={featuredPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-muted-foreground/20" />
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px]">
                        সর্বশেষ পোস্ট
                      </Badge>
                    </div>
                    <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                        <Calendar className="h-3 w-3" />
                        {featuredPost.published_at
                          ? new Date(featuredPost.published_at).toLocaleDateString("bn-BD", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : ""}
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {featuredPost.title}
                      </h2>
                      {featuredPost.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {featuredPost.excerpt}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                        পড়ুন <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            )}

            {/* Other Posts Grid */}
            {otherPosts && otherPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {otherPosts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                    <Card className="overflow-hidden border-border hover:border-primary/30 transition-all h-full flex flex-col">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {post.thumbnail_url ? (
                          <img
                            src={post.thumbnail_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-10 w-10 text-muted-foreground/20" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-2">
                          <Calendar className="h-3 w-3" />
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString("bn-BD", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : ""}
                        </div>
                        <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                            {post.excerpt}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary mt-auto">
                          বিস্তারিত <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-1">কোনো ব্লগ পোস্ট নেই</h2>
            <p className="text-sm text-muted-foreground">শীঘ্রই নতুন আর্টিকেল প্রকাশ করা হবে।</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
