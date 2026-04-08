import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

const placements = ["header", "sidebar", "in_content", "footer", "before_download", "popup"];
const adTypes = ["html", "image", "video"];
const deviceTargets = ["all", "desktop", "mobile"];

export default function AdminAds() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState(""); const [placement, setPlacement] = useState("sidebar"); const [adType, setAdType] = useState("html");
  const [content, setContent] = useState(""); const [linkUrl, setLinkUrl] = useState(""); const [imageUrl, setImageUrl] = useState("");
  const [deviceTarget, setDeviceTarget] = useState("all"); const [priority, setPriority] = useState(0);
  const [startsAt, setStartsAt] = useState(""); const [endsAt, setEndsAt] = useState("");

  const { data: ads } = useQuery({ queryKey: ["admin-ads"], queryFn: async () => { const { data, error } = await supabase.from("ads").select("*").order("created_at", { ascending: false }); if (error) throw error; return data; } });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { title, placement, ad_type: adType, content: content || null, link_url: linkUrl || null, image_url: imageUrl || null, device_target: deviceTarget, priority, starts_at: startsAt || null, ends_at: endsAt || null } as any;
      if (editId) { const { error } = await supabase.from("ads").update(payload).eq("id", editId); if (error) throw error; }
      else { const { error } = await supabase.from("ads").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-ads"] }); setDialogOpen(false); resetForm(); toast.success("Ad saved!"); },
    onError: (e: any) => toast.error(e.message),
  });
  const toggleMutation = useMutation({ mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => { const { error } = await supabase.from("ads").update({ is_active }).eq("id", id); if (error) throw error; }, onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-ads"] }) });
  const deleteMutation = useMutation({ mutationFn: async (id: string) => { const { error } = await supabase.from("ads").delete().eq("id", id); if (error) throw error; }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-ads"] }); toast.success("Ad deleted"); } });
  const resetForm = () => { setTitle(""); setPlacement("sidebar"); setAdType("html"); setContent(""); setLinkUrl(""); setImageUrl(""); setDeviceTarget("all"); setPriority(0); setStartsAt(""); setEndsAt(""); setEditId(null); };
  const openEdit = (ad: any) => { setTitle(ad.title); setPlacement(ad.placement || "sidebar"); setAdType(ad.ad_type || "html"); setContent(ad.content || ""); setLinkUrl(ad.link_url || ""); setImageUrl(ad.image_url || ""); setDeviceTarget(ad.device_target || "all"); setPriority(ad.priority || 0); setStartsAt(ad.starts_at ? ad.starts_at.split("T")[0] : ""); setEndsAt(ad.ends_at ? ad.ends_at.split("T")[0] : ""); setEditId(ad.id); setDialogOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Ads ({ads?.length || 0})</h2>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Ad</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? "Edit" : "New"} Ad</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Placement</Label><Select value={placement} onValueChange={setPlacement}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{placements.map(p => <SelectItem key={p} value={p} className="capitalize">{p.replace("_"," ")}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Ad Type</Label><Select value={adType} onValueChange={setAdType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{adTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent></Select></div>
              </div>
              {adType === "html" && <div className="space-y-2"><Label>HTML/Script</Label><Textarea value={content} onChange={e => setContent(e.target.value)} rows={6} /></div>}
              {(adType === "image" || adType === "video") && <div className="space-y-2"><Label>Image URL</Label><Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} /></div>}
              <div className="space-y-2"><Label>Link URL</Label><Input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Device</Label><Select value={deviceTarget} onValueChange={setDeviceTarget}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{deviceTargets.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Priority</Label><Input type="number" value={priority} onChange={e => setPriority(Number(e.target.value))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Starts</Label><Input type="date" value={startsAt} onChange={e => setStartsAt(e.target.value)} /></div><div className="space-y-2"><Label>Ends</Label><Input type="date" value={endsAt} onChange={e => setEndsAt(e.target.value)} /></div></div>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !title.trim()} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Placement</TableHead><TableHead>Type</TableHead><TableHead>Device</TableHead><TableHead>Impressions</TableHead><TableHead>Clicks</TableHead><TableHead>Active</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
        <TableBody>{ads?.map(ad => (
          <TableRow key={ad.id}>
            <TableCell className="font-medium">{ad.title}</TableCell>
            <TableCell><Badge variant="outline" className="capitalize text-xs">{((ad as any).placement || "sidebar").replace("_"," ")}</Badge></TableCell>
            <TableCell className="capitalize text-sm">{(ad as any).ad_type || "image"}</TableCell>
            <TableCell className="capitalize text-sm">{(ad as any).device_target || "all"}</TableCell>
            <TableCell>{(ad as any).impressions || 0}</TableCell><TableCell>{(ad as any).clicks || 0}</TableCell>
            <TableCell><Switch checked={ad.is_active} onCheckedChange={v => toggleMutation.mutate({ id: ad.id, is_active: v })} /></TableCell>
            <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(ad)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(ad.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
    </div>
  );
}
