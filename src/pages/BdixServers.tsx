import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Server, Tv, Gauge, Search, Globe } from "lucide-react";

const CATEGORIES = [
  { key: "media_ftp", label: "মিডিয়া ও FTP সার্ভার", icon: Server, color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { key: "live_tv", label: "লাইভ TV সার্ভার", icon: Tv, color: "bg-red-500/10 text-red-600 border-red-500/20" },
  { key: "speed_test", label: "স্পিড টেস্ট", icon: Gauge, color: "bg-green-500/10 text-green-600 border-green-500/20" },
] as const;

type BdixServer = {
  id: string;
  category: string;
  name: string;
  links: string[];
  sort_order: number;
  is_active: boolean;
};

export default function BdixServers() {
  const [search, setSearch] = useState("");

  const { data: servers = [], isLoading } = useQuery({
    queryKey: ["bdix-servers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bdix_servers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as BdixServer[];
    },
  });

  const filteredServers = search
    ? servers.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.links.some((l) => l.toLowerCase().includes(search.toLowerCase()))
      )
    : servers;

  const getServersForCategory = (cat: string) =>
    filteredServers.filter((s) => s.category === cat);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">BD IX Server List</h1>
          </div>
          <p className="text-muted-foreground">
            বাংলাদেশের BDIX কানেক্টেড মিডিয়া FTP, লাইভ TV ও স্পিড টেস্ট সার্ভারের সম্পূর্ণ তালিকা
          </p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="সার্ভার খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">লোড হচ্ছে...</div>
        ) : (
          <Tabs defaultValue="media_ftp">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-transparent p-0 mb-6">
              {CATEGORIES.map((cat) => {
                const count = getServersForCategory(cat.key).length;
                return (
                  <TabsTrigger
                    key={cat.key}
                    value={cat.key}
                    className={`flex items-center gap-2 border rounded-lg px-4 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary ${cat.color}`}
                  >
                    <cat.icon className="h-4 w-4" />
                    <span className="font-medium">{cat.label}</span>
                    <Badge variant="secondary" className="ml-1 text-xs">{count}</Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {CATEGORIES.map((cat) => (
              <TabsContent key={cat.key} value={cat.key} className="space-y-3">
                {getServersForCategory(cat.key).length === 0 ? (
                  <p className="text-center py-10 text-muted-foreground">কোনো সার্ভার পাওয়া যায়নি</p>
                ) : (
                  getServersForCategory(cat.key).map((server, idx) => (
                    <Card key={server.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="text-muted-foreground font-normal text-sm">{idx + 1}.</span>
                          {server.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 pt-0">
                        <div className="flex flex-wrap gap-2">
                          {server.links.map((link, i) => (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              asChild
                              className="h-7 text-xs gap-1 font-mono"
                            >
                              <a href={link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                                {link.replace(/^https?:\/\//, "").replace(/\/$/, "").substring(0, 40)}
                                {link.replace(/^https?:\/\//, "").replace(/\/$/, "").length > 40 ? "…" : ""}
                              </a>
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </Layout>
  );
}
