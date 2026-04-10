import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ExternalLink,
  HardDrive,
  Tv,
  Gauge,
  Search,
  Globe,
  Loader2,
} from "lucide-react";
import { useAccessibilityCheck } from "@/hooks/useAccessibilityCheck";

const CATEGORIES = [
  {
    key: "media_ftp",
    label: "মিডিয়া ও FTP সার্ভার",
    icon: HardDrive,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    key: "live_tv",
    label: "লাইভ TV সার্ভার",
    icon: Tv,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  {
    key: "speed_test",
    label: "স্পিড টেস্ট",
    icon: Gauge,
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
] as const;

type BdixServer = {
  id: string;
  category: string;
  name: string;
  links: string[];
  sort_order: number;
  is_active: boolean;
};

function StatusDot({ status }: { status: "checking" | "online" | "offline" | undefined }) {
  if (status === "checking" || !status) {
    return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground shrink-0" />;
  }
  if (status === "online") {
    return <span className="h-2.5 w-2.5 rounded-full bg-green-500 shrink-0 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />;
  }
  return <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />;
}

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

  // Collect all unique links for accessibility check
  const allLinks = useMemo(
    () => [...new Set(servers.flatMap((s) => s.links))],
    [servers]
  );

  const linkStatuses = useAccessibilityCheck(allLinks);

  const filteredServers = search
    ? servers.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.links.some((l) => l.toLowerCase().includes(search.toLowerCase()))
      )
    : servers;

  const getServersForCategory = (cat: string) =>
    filteredServers.filter((s) => s.category === cat);

  const getCategoryMeta = (key: string) =>
    CATEGORIES.find((c) => c.key === key)!;

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
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Accessible
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Not Accessible
            </span>
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" /> Checking...
            </span>
          </div>
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
                    className={`flex items-center gap-2 border rounded-lg px-4 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary ${cat.bg} ${cat.color} ${cat.border}`}
                  >
                    <cat.icon className="h-4 w-4" />
                    <span className="font-medium">{cat.label}</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {count}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {CATEGORIES.map((cat) => {
              const catServers = getServersForCategory(cat.key);
              const meta = getCategoryMeta(cat.key);
              const Icon = meta.icon;

              return (
                <TabsContent key={cat.key} value={cat.key}>
                  {catServers.length === 0 ? (
                    <p className="text-center py-10 text-muted-foreground">
                      কোনো সার্ভার পাওয়া যায়নি
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {catServers.map((server) => {
                        const primaryLink = server.links[0] || "";
                        const displayUrl = primaryLink
                          .replace(/^https?:\/\//, "")
                          .replace(/\/$/, "");

                        return (
                          <Accordion type="single" collapsible key={server.id}>
                            <AccordionItem
                              value={server.id}
                              className={`border rounded-lg ${meta.border} overflow-hidden`}
                            >
                              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3 text-left min-w-0">
                                  <div
                                    className={`${meta.bg} ${meta.color} p-2 rounded-lg shrink-0`}
                                  >
                                    <Icon className="h-5 w-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-sm leading-tight truncate">
                                      {server.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate mt-0.5 font-mono">
                                      {displayUrl.substring(0, 30)}
                                      {displayUrl.length > 30 ? "…" : ""}
                                    </p>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-3">
                                <div className="space-y-1.5">
                                  {server.links.map((link, i) => {
                                    const status = linkStatuses.get(link);
                                    const shortUrl = link
                                      .replace(/^https?:\/\//, "")
                                      .replace(/\/$/, "");
                                    return (
                                      <a
                                        key={i}
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted/70 transition-colors group text-sm"
                                      >
                                        <StatusDot status={status} />
                                        <span className="font-mono text-xs truncate flex-1">
                                          {shortUrl}
                                        </span>
                                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                      </a>
                                    );
                                  })}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>
    </Layout>
  );
}
