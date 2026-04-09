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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Upload, BarChart3 } from "lucide-react";

const placements = ["header", "sidebar", "in_content", "footer", "before_download", "popup"];
const adTypes = ["image", "html", "video"];
const adSources = ["custom", "google"];
const deviceTargets = ["all", "desktop", "mobile"];

export default function AdminAds() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [placement, setPlacement] = useState("sidebar");
  const [adType, setAdType] = useState("image");
  const [adSource, setAdSource] = useState("custom");
  const [content, setContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [advertiserName, setAdvertiserName] = useState("");
  const [advertiserEmail, setAdvertiserEmail] = useState("");
  const [deviceTarget, setDeviceTarget] = useState("all");
  const [priority, setPriority] = useState(0);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: ads } = useQuery({
    queryKey: ["admin-ads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: slots } = useQuery({
    queryKey: ["admin-ad-slots"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ad_slots" as any).select("*").order("placement");
      if (error) throw error;
      return data as any[];
    },
  });

  // Slot usage calculation
  const slotUsage = slots?.map((slot: any) => {
    const activeCount = ads?.filter(
      (a: any) => a.placement === slot.placement && a.is_active
    ).length || 0;
    return { ...slot, activeCount, available: slot.max_ads - activeCount };
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("ad-images").upload(path, file);
    if (error) {
      toast.error("আপলোড ব্যর্থ: " + error.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("ad-images").getPublicUrl(path);
    setImageUrl(urlData.publicUrl);
    setUploading(false);
    toast.success("ছবি আপলোড হয়েছে!");
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        title,
        placement,
        ad_type: adType,
        ad_source: adSource,
        content: content || null,
        link_url: linkUrl || null,
        image_url: imageUrl || null,
        advertiser_name: advertiserName || null,
        advertiser_email: advertiserEmail || null,
        device_target: deviceTarget,
        priority,
        starts_at: startsAt || null,
        ends_at: endsAt || null,
      };
      if (editId) {
        const { error } = await supabase.from("ads").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("ads").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-ads"] });
      setDialogOpen(false);
      resetForm();
      toast.success("বিজ্ঞাপন সংরক্ষিত!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("ads").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-ads"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-ads"] });
      toast.success("বিজ্ঞাপন মুছে ফেলা হয়েছে");
    },
  });

  const resetForm = () => {
    setTitle(""); setPlacement("sidebar"); setAdType("image"); setAdSource("custom");
    setContent(""); setLinkUrl(""); setImageUrl(""); setAdvertiserName(""); setAdvertiserEmail("");
    setDeviceTarget("all"); setPriority(0); setStartsAt(""); setEndsAt(""); setEditId(null);
  };

  const openEdit = (ad: any) => {
    setTitle(ad.title); setPlacement(ad.placement || "sidebar"); setAdType(ad.ad_type || "image");
    setAdSource(ad.ad_source || "custom"); setContent(ad.content || ""); setLinkUrl(ad.link_url || "");
    setImageUrl(ad.image_url || ""); setAdvertiserName(ad.advertiser_name || ""); setAdvertiserEmail(ad.advertiser_email || "");
    setDeviceTarget(ad.device_target || "all"); setPriority(ad.priority || 0);
    setStartsAt(ad.starts_at ? ad.starts_at.split("T")[0] : ""); setEndsAt(ad.ends_at ? ad.ends_at.split("T")[0] : "");
    setEditId(ad.id); setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Slot Usage Dashboard */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">স্লট ব্যবহার</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {slotUsage?.map((slot: any) => (
            <Card key={slot.id} className="text-center">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground capitalize mb-1">{slot.placement.replace("_", " ")}</p>
                <p className="text-lg font-bold">{slot.activeCount}/{slot.max_ads}</p>
                <Badge variant={slot.available > 0 ? "secondary" : "destructive"} className="text-[10px] mt-1">
                  {slot.available > 0 ? `${slot.available} খালি` : "পূর্ণ"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Ads Table */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">বিজ্ঞাপন ({ads?.length || 0})</h2>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> নতুন বিজ্ঞাপন</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? "সম্পাদনা" : "নতুন"} বিজ্ঞাপন</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>শিরোনাম</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>স্থান</Label>
                  <Select value={placement} onValueChange={setPlacement}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{placements.map((p) => <SelectItem key={p} value={p} className="capitalize">{p.replace("_", " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ধরন</Label>
                  <Select value={adType} onValueChange={setAdType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{adTypes.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>সোর্স</Label>
                  <Select value={adSource} onValueChange={setAdSource}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{adSources.map((s) => <SelectItem key={s} value={s} className="capitalize">{s === "custom" ? "কাস্টম" : "Google Ads"}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ডিভাইস</Label>
                  <Select value={deviceTarget} onValueChange={setDeviceTarget}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{deviceTargets.map((d) => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* Google Ads / HTML */}
              {(adType === "html" || adSource === "google") && (
                <div className="space-y-2">
                  <Label>{adSource === "google" ? "Google Ad Script/HTML" : "HTML/Script"}</Label>
                  <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="<script>...</script> বা HTML কোড পেস্ট করুন" />
                </div>
              )}

              {/* Image upload */}
              {adType === "image" && adSource === "custom" && (
                <div className="space-y-2">
                  <Label>বিজ্ঞাপনের ছবি</Label>
                  <div className="flex gap-2">
                    <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL অথবা আপলোড করুন" className="flex-1" />
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <Button type="button" variant="outline" size="icon" disabled={uploading} asChild>
                        <span><Upload className="h-4 w-4" /></span>
                      </Button>
                    </label>
                  </div>
                  {imageUrl && <img src={imageUrl} alt="Preview" className="h-20 rounded border object-contain" />}
                </div>
              )}

              <div className="space-y-2"><Label>লিংক URL</Label><Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://" /></div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>বিজ্ঞাপনদাতার নাম</Label><Input value={advertiserName} onChange={(e) => setAdvertiserName(e.target.value)} /></div>
                <div className="space-y-2"><Label>বিজ্ঞাপনদাতার ইমেইল</Label><Input value={advertiserEmail} onChange={(e) => setAdvertiserEmail(e.target.value)} /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>প্রায়োরিটি</Label><Input type="number" value={priority} onChange={(e) => setPriority(Number(e.target.value))} /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>শুরু</Label><Input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} /></div>
                <div className="space-y-2"><Label>শেষ</Label><Input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} /></div>
              </div>

              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !title.trim()} className="w-full">সংরক্ষণ করুন</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>শিরোনাম</TableHead>
            <TableHead>স্থান</TableHead>
            <TableHead>সোর্স</TableHead>
            <TableHead>ইমপ্রেশন</TableHead>
            <TableHead>ক্লিক</TableHead>
            <TableHead>সক্রিয়</TableHead>
            <TableHead>অ্যাকশন</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ads?.map((ad: any) => (
            <TableRow key={ad.id}>
              <TableCell className="font-medium">
                {ad.title}
                {ad.advertiser_name && <span className="block text-xs text-muted-foreground">{ad.advertiser_name}</span>}
              </TableCell>
              <TableCell><Badge variant="outline" className="capitalize text-xs">{(ad.placement || "sidebar").replace("_", " ")}</Badge></TableCell>
              <TableCell>
                <Badge variant={ad.ad_source === "google" ? "default" : "secondary"} className="text-xs">
                  {ad.ad_source === "google" ? "Google" : "কাস্টম"}
                </Badge>
              </TableCell>
              <TableCell>{ad.impressions || 0}</TableCell>
              <TableCell>{ad.clicks || 0}</TableCell>
              <TableCell><Switch checked={ad.is_active} onCheckedChange={(v) => toggleMutation.mutate({ id: ad.id, is_active: v })} /></TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(ad)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(ad.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
