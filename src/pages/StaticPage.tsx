import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function StaticPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading } = useQuery({
    queryKey: ["page", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("pages").select("*").eq("slug", slug!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) return <Layout><div className="container py-8"><Skeleton className="h-64 w-full" /></div></Layout>;
  if (!page) return <Layout><div className="container py-16 text-center text-muted-foreground">পেজ পাওয়া যায়নি।</div></Layout>;

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap">{page.content}</div>
      </div>
    </Layout>
  );
}
