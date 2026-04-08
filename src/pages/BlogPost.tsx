import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { ArrowLeft, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

  if (isLoading) return <Layout><div className="container py-8"><Skeleton className="h-96 w-full" /></div></Layout>;

  if (!post) return <Layout><div className="container py-16 text-center text-muted-foreground">পোস্ট পাওয়া যায়নি।</div></Layout>;

  return (
    <Layout>
      <article className="container py-8 max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> ব্লগে ফিরে যান
        </Link>
        {post.thumbnail_url && (
          <img src={post.thumbnail_url} alt={post.title} className="w-full aspect-video object-cover rounded-lg mb-6" />
        )}
        <h1 className="text-3xl font-bold mb-3">{post.title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Calendar className="h-4 w-4" />
          {post.published_at ? new Date(post.published_at).toLocaleDateString("bn-BD") : ""}
        </div>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap">{post.content}</div>
      </article>
    </Layout>
  );
}
