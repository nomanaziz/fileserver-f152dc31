import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";

export default function AdminAnalytics() {
  const { data: dailyDownloads } = useQuery({
    queryKey: ["admin-analytics-daily"],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const { data, error } = await supabase.from("download_history").select("downloaded_at").gte("downloaded_at", thirtyDaysAgo);
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) { const day = format(subDays(new Date(), i), "yyyy-MM-dd"); counts[day] = 0; }
      data?.forEach(d => { const day = format(new Date(d.downloaded_at), "yyyy-MM-dd"); if (counts[day] !== undefined) counts[day]++; });
      return Object.entries(counts).map(([date, count]) => ({ date: format(new Date(date), "MMM d"), downloads: count }));
    },
  });
  const { data: topProducts } = useQuery({ queryKey: ["admin-analytics-top"], queryFn: async () => { const { data, error } = await supabase.from("products").select("title, download_count, view_count").order("download_count", { ascending: false }).limit(10); if (error) throw error; return data; } });
  const { data: topCategories } = useQuery({
    queryKey: ["admin-analytics-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("category_id, download_count, categories(name)");
      if (error) throw error;
      const catMap: Record<string, { name: string; downloads: number }> = {};
      data?.forEach((p: any) => { const name = p.categories?.name || "Uncategorized"; if (!catMap[name]) catMap[name] = { name, downloads: 0 }; catMap[name].downloads += p.download_count; });
      return Object.values(catMap).sort((a, b) => b.downloads - a.downloads).slice(0, 10);
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Analytics</h2>
      <Card>
        <CardHeader><CardTitle>Daily Downloads (Last 30 Days)</CardTitle></CardHeader>
        <CardContent><div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={dailyDownloads || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Bar dataKey="downloads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>Top Products</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Downloads</TableHead><TableHead>Views</TableHead></TableRow></TableHeader><TableBody>{topProducts?.map((p, i) => <TableRow key={i}><TableCell className="font-medium">{p.title}</TableCell><TableCell>{p.download_count}</TableCell><TableCell>{p.view_count}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        <Card><CardHeader><CardTitle>Top Categories</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Downloads</TableHead></TableRow></TableHeader><TableBody>{topCategories?.map((c, i) => <TableRow key={i}><TableCell className="font-medium">{c.name}</TableCell><TableCell>{c.downloads}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
      </div>
    </div>
  );
}
