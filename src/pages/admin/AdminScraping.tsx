import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Globe, Upload } from "lucide-react";

export default function AdminScraping() {
  const [url, setUrl] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");

  const handleScrape = () => {
    if (!url) { toast.error("Please enter a URL"); return; }
    toast.info("Scraping feature requires backend edge function setup. URL: " + url);
  };

  const handleBulkImport = () => {
    const urls = bulkUrls.split("\n").filter(Boolean);
    if (urls.length === 0) { toast.error("Please enter URLs"); return; }
    toast.info(`Bulk import of ${urls.length} URLs queued. Requires edge function setup.`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Scraping / Import</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Single URL Scrape</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>URL</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/software" /></div>
            <Button onClick={handleScrape} className="w-full">Scrape</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Bulk Import</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>URLs (one per line)</Label><Textarea value={bulkUrls} onChange={(e) => setBulkUrls(e.target.value)} rows={6} placeholder={"https://example.com/soft1\nhttps://example.com/soft2"} /></div>
            <Button onClick={handleBulkImport} className="w-full">Import All</Button>
          </CardContent>
        </Card>
      </div>
      <p className="text-sm text-muted-foreground mt-4">Note: Scraping requires a Supabase Edge Function to be configured for fetching and parsing external pages.</p>
    </div>
  );
}
