import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useVendorProducts, useVendorProfile } from "@/hooks/useVendor";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Download, X } from "lucide-react";
import ImageUploadField from "@/components/ImageUploadField";

function slugify(text: string) { return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

export default function VendorProducts() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: vendorProfile } = useVendorProfile();
  const { data: products, isLoading } = useVendorProducts();
  const { data: categories } = useCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [osType, setOsType] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [newScreenshot, setNewScreenshot] = useState("");
  const [downloadLinks, setDownloadLinks] = useState<{ server_id: string; download_url: string }[]>([]);

  const { data: servers } = useQuery({
    queryKey: ["download-servers"],
    queryFn: async () => {
      const { data } = await supabase.from("download_servers").select("*").eq("is_active", true);
      return data || [];
    },
  });

  const isVerified = vendorProfile?.is_verified;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        title, slug: slug || slugify(title), description, version, file_size: fileSize,
        category_id: categoryId || null, os_type: osType || null,
        is_paid: isPaid, price: isPaid ? price : 0,
        image_url: imageUrl || null,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        screenshots, vendor_id: user!.id, is_vendor_product: true,
        vendor_status: "pending", status: "draft",
      };
      let productId = editId;
      if (editId) {
        const { error } = await supabase.from("products").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("products").insert(payload).select("id").single();
        if (error) throw error;
        productId = data.id;
      }
      if (productId) {
        await supabase.from("product_downloads").delete().eq("product_id", productId);
        const links = downloadLinks.filter(l => l.server_id && l.download_url).map(l => ({ product_id: productId!, server_id: l.server_id, download_url: l.download_url }));
        if (links.length > 0) await supabase.from("product_downloads").insert(links);
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vendor-products"] }); setDialogOpen(false); resetForm(); toast.success(editId ? "আপডেট হয়েছে!" : "প্রোডাক্ট তৈরি হয়েছে!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vendor-products"] }); toast.success("ডিলিট হয়েছে"); },
  });

  const resetForm = () => {
    setTitle(""); setSlug(""); setDescription(""); setVersion(""); setFileSize("");
    setCategoryId(""); setOsType(""); setIsPaid(false); setPrice(0);
    setImageUrl(""); setTags(""); setScreenshots([]); setNewScreenshot("");
    setDownloadLinks([]); setEditId(null);
  };

  const openEdit = async (product: any) => {
    setTitle(product.title); setSlug(product.slug); setDescription(product.description || "");
    setVersion(product.version || ""); setFileSize(product.file_size || "");
    setCategoryId(product.category_id || ""); setOsType(product.os_type || "");
    setIsPaid(product.is_paid); setPrice(product.price || 0);
    setImageUrl(product.image_url || ""); setTags((product.tags || []).join(", "));
    setScreenshots(product.screenshots || []); setEditId(product.id);
    const { data } = await supabase.from("product_downloads").select("*").eq("product_id", product.id);
    setDownloadLinks((data || []).map(d => ({ server_id: d.server_id, download_url: d.download_url })));
    setDialogOpen(true);
  };

  const statusColor = (s: string) => s === "approved" ? "default" : s === "rejected" ? "destructive" : "secondary";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">আমার প্রোডাক্ট ({products?.length || 0})</h2>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={!isVerified}>
              <Plus className="mr-2 h-4 w-4" /> নতুন প্রোডাক্ট
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? "প্রোডাক্ট এডিট" : "নতুন প্রোডাক্ট"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>টাইটেল *</Label><Input value={title} onChange={e => { setTitle(e.target.value); if (!editId) setSlug(slugify(e.target.value)); }} /></div>
                <div className="space-y-2"><Label>স্লাগ</Label><Input value={slug} onChange={e => setSlug(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>বিবরণ</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} /></div>
              <ImageUploadField value={imageUrl} onChange={setImageUrl} folder="vendor-products" label="প্রোডাক্ট ইমেজ" />
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>ক্যাটেগরি</Label>
                  <Select value={categoryId || "none"} onValueChange={v => setCategoryId(v === "none" ? "" : v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="none">— নেই —</SelectItem>{categories?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>OS</Label>
                  <Select value={osType || "none"} onValueChange={v => setOsType(v === "none" ? "" : v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="none">— নেই —</SelectItem>{["windows","android","mac","linux","ios","cross_platform"].map(os => <SelectItem key={os} value={os}>{os}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>ভার্সন</Label><Input value={version} onChange={e => setVersion(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>ফাইল সাইজ</Label><Input value={fileSize} onChange={e => setFileSize(e.target.value)} placeholder="150 MB" /></div>
                <div className="space-y-2">
                  <Label>পেইড?</Label>
                  <div className="flex items-center gap-2 pt-1"><Switch checked={isPaid} onCheckedChange={setIsPaid} /><span className="text-sm">{isPaid ? "পেইড" : "ফ্রি"}</span></div>
                </div>
              </div>
              {isPaid && <div className="space-y-2"><Label>দাম (৳)</Label><Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} /></div>}
              <div className="space-y-2"><Label>ট্যাগ (কমা দিয়ে)</Label><Input value={tags} onChange={e => setTags(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>স্ক্রিনশট</Label>
                <ImageUploadField value="" onChange={(url) => { if (url) setScreenshots([...screenshots, url]); }} folder="vendor-products/gallery" label="" />
                {screenshots.length > 0 && <div className="grid grid-cols-3 gap-2 mt-2">{screenshots.map((s, i) => <div key={i} className="relative group"><img src={s} alt="" className="rounded-md border aspect-video object-cover w-full" /><button onClick={() => setScreenshots(screenshots.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button></div>)}</div>}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Download className="h-4 w-4" /> ডাউনলোড লিংক</Label>
                {downloadLinks.map((link, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Select value={link.server_id} onValueChange={v => { const u = [...downloadLinks]; u[i].server_id = v; setDownloadLinks(u); }}>
                      <SelectTrigger className="w-40"><SelectValue placeholder="সার্ভার" /></SelectTrigger>
                      <SelectContent>{servers?.map(s => <SelectItem key={s.id} value={s.id}>{s.label || s.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input value={link.download_url} onChange={e => { const u = [...downloadLinks]; u[i].download_url = e.target.value; setDownloadLinks(u); }} placeholder="URL" className="flex-1" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => setDownloadLinks(downloadLinks.filter((_, idx) => idx !== i))}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setDownloadLinks([...downloadLinks, { server_id: "", download_url: "" }])}>
                  <Plus className="h-4 w-4 mr-1" /> লিংক যোগ
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">⚠️ প্রোডাক্ট সাবমিটের পর অ্যাডমিন অনুমোদন দিলে পাবলিশ হবে।</p>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full">
                {saveMutation.isPending ? "সেভ হচ্ছে..." : editId ? "আপডেট করুন" : "সাবমিট করুন"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!isVerified && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-3 text-sm text-amber-600 dark:text-amber-400">
          আপনার স্টোর এখনো ভেরিফাই হয়নি। ভেরিফাই হলে প্রোডাক্ট আপলোড করতে পারবেন।
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>টাইটেল</TableHead>
            <TableHead>ক্যাটেগরি</TableHead>
            <TableHead>দাম</TableHead>
            <TableHead>স্ট্যাটাস</TableHead>
            <TableHead className="text-right">অ্যাকশন</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products?.map((p: any) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.title}</TableCell>
              <TableCell>{p.categories?.name || "—"}</TableCell>
              <TableCell>{p.is_paid ? `৳${p.price}` : "ফ্রি"}</TableCell>
              <TableCell><Badge variant={statusColor(p.vendor_status)}>{p.vendor_status}</Badge></TableCell>
              <TableCell className="text-right space-x-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => { if (confirm("ডিলিট করতে চান?")) deleteMutation.mutate(p.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </TableCell>
            </TableRow>
          ))}
          {(!products || products.length === 0) && (
            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">কোনো প্রোডাক্ট নেই</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
