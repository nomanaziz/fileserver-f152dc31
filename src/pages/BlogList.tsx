import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogList() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">ব্লগ</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)
            : posts?.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                    {post.thumbnail_url && (
                      <img src={post.thumbnail_url} alt={post.title} className="w-full aspect-video object-cover" loading="lazy" />
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-2 mb-2">{post.title}</h3>
                      {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{post.excerpt}</p>}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {post.published_at ? new Date(post.published_at).toLocaleDateString("bn-BD") : ""}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          {!isLoading && posts?.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-12">কোনো ব্লগ পোস্ট নেই।</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
