import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Globe, Upload, List, Trash2 } from "lucide-react";

export default function AdminScraping() {
  const qc = useQueryClient();
  const [singleUrl, setSingleUrl] = useState(""); const [sourceSite, setSourceSite] = useState(""); const [contentType, setContentType] = useState("software"); const [bulkUrls, setBulkUrls] = useState("");

  const { data: queue } = useQuery({ queryKey: ["admin-scrape-queue"], queryFn: async () => { const { data, error } = await supabase.from("scrape_queue" as any).select("*").order("created_at", { ascending: false }).limit(100); if (error) throw error; return data as any[]; } });

  const addSingle = useMutation({
    mutationFn: async () => { const { error } = await (supabase.from("scrape_queue" as any) as any).insert({ url: singleUrl, source_site: sourceSite || null, content_type: contentType }); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-scrape-queue"] }); setSingleUrl(""); setSourceSite(""); toast.success("URL added!"); },
    onError: (e: any) => toast.error(e.message),
  });
  const addBulk = useMutation({
    mutationFn: async () => { const urls = bulkUrls.split("\n").map(u => u.trim()).filter(Boolean); const rows = urls.map(url => ({ url, source_site: sourceSite || null, content_type: contentType })); const { error } = await (supabase.from("scrape_queue" as any) as any).insert(rows); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-scrape-queue"] }); setBulkUrls(""); toast.success("Bulk URLs added!"); },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await (supabase.from("scrape_queue" as any) as any).delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-scrape-queue"] }); toast.success("Removed"); },
  });

  const statusBadge = (s: string) => { const v: Record<string, "default" | "secondary" | "destructive" | "outline"> = { pending: "secondary", processing: "outline", completed: "default", failed: "destructive", duplicate: "secondary" }; return <Badge variant={v[s] || "secondary"} className="capitalize">{s}</Badge>; };
  const contentTypes = ["software", "android", "game", "movie", "music", "ebook", "tutorial", "other"];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Data Scraping</h2>
      <Tabs defaultValue="single">
        <TabsList><TabsTrigger value="single"><Globe className="h-4 w-4 mr-1" /> Single URL</TabsTrigger><TabsTrigger value="bulk"><Upload className="h-4 w-4 mr-1" /> Bulk</TabsTrigger><TabsTrigger value="queue"><List className="h-4 w-4 mr-1" /> Queue ({queue?.length || 0})</TabsTrigger></TabsList>
        <TabsContent value="single" className="space-y-4">
          <div className="space-y-2"><Label>URL</Label><Input value={singleUrl} onChange={e => setSingleUrl(e.target.value)} placeholder="https://example.com/page" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Source</Label><Input value={sourceSite} onChange={e => setSourceSite(e.target.value)} placeholder="filecr, getintopc" /></div>
            <div className="space-y-2"><Label>Type</Label><Select value={contentType} onValueChange={setContentType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{contentTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <Button onClick={() => addSingle.mutate()} disabled={addSingle.isPending || !singleUrl.trim()}>Add to Queue</Button>
        </TabsContent>
        <TabsContent value="bulk" className="space-y-4">
          <div className="space-y-2"><Label>URLs (one per line)</Label><Textarea value={bulkUrls} onChange={e => setBulkUrls(e.target.value)} rows={8} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Source</Label><Input value={sourceSite} onChange={e => setSourceSite(e.target.value)} /></div>
            <div className="space-y-2"><Label>Type</Label><Select value={contentType} onValueChange={setContentType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{contentTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <Button onClick={() => addBulk.mutate()} disabled={addBulk.isPending || !bulkUrls.trim()}>Add All</Button>
        </TabsContent>
        <TabsContent value="queue">
          <Table><TableHeader><TableRow><TableHead>URL</TableHead><TableHead>Source</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>{queue?.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell className="max-w-[300px] truncate text-xs">{item.url}</TableCell>
                <TableCell className="text-sm">{item.source_site || "—"}</TableCell>
                <TableCell className="capitalize text-sm">{item.content_type}</TableCell>
                <TableCell>{statusBadge(item.status)}</TableCell>
                <TableCell className="text-sm">{new Date(item.created_at).toLocaleDateString()}</TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
              </TableRow>
            ))}{(!queue || queue.length === 0) && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Queue empty</TableCell></TableRow>}</TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
