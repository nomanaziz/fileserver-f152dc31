import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tv, Play } from "lucide-react";

export default function LiveTV() {
  const [activeChannel, setActiveChannel] = useState<string | null>(null);

  const { data: channels, isLoading } = useQuery({
    queryKey: ["live-channels"],
    queryFn: async () => {
      const { data, error } = await supabase.from("live_channels").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const categories = [...new Set(channels?.map((c) => c.category).filter(Boolean))];

  return (
    <Layout>
      <div className="container py-12">
        <div className="flex items-center gap-3 mb-8">
          <Tv className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Live TV</h1>
        </div>

        {activeChannel && (
          <div className="mb-8 aspect-video max-w-4xl mx-auto rounded-lg overflow-hidden bg-black">
            <iframe src={activeChannel} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" />
          </div>
        )}

        {isLoading ? (
          <div className="text-center text-muted-foreground">Loading channels...</div>
        ) : !channels?.length ? (
          <div className="text-center text-muted-foreground">No channels available.</div>
        ) : (
          <div className="space-y-8">
            {categories.length > 0
              ? categories.map((cat) => (
                  <div key={cat}>
                    <h2 className="text-xl font-semibold mb-4">{cat}</h2>
                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {channels.filter((c) => c.category === cat).map((ch) => (
                        <Card key={ch.id} className="cursor-pointer hover:ring-2 hover:ring-primary transition-all" onClick={() => setActiveChannel(ch.stream_url)}>
                          <CardContent className="p-3 text-center">
                            {ch.thumbnail_url ? (
                              <img src={ch.thumbnail_url} alt={ch.name} className="w-full aspect-video object-cover rounded mb-2" />
                            ) : (
                              <div className="w-full aspect-video bg-muted rounded mb-2 flex items-center justify-center">
                                <Play className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <p className="text-sm font-medium truncate">{ch.name}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              : (
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {channels.map((ch) => (
                    <Card key={ch.id} className="cursor-pointer hover:ring-2 hover:ring-primary transition-all" onClick={() => setActiveChannel(ch.stream_url)}>
                      <CardContent className="p-3 text-center">
                        {ch.thumbnail_url ? (
                          <img src={ch.thumbnail_url} alt={ch.name} className="w-full aspect-video object-cover rounded mb-2" />
                        ) : (
                          <div className="w-full aspect-video bg-muted rounded mb-2 flex items-center justify-center">
                            <Play className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <p className="text-sm font-medium truncate">{ch.name}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>
    </Layout>
  );
}
