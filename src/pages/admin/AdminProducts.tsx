import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, ArrowUpDown, Search, Download, ShieldCheck, X, Image, Star, TrendingUp } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import ImageUploadField from "@/components/ImageUploadField";

type SortKey = "title" | "download_count" | "created_at" | "price";
type SortDir = "asc" | "desc";
const fileTypes = ["Software", "APK", "Game", "Movie", "Source Code"];
const licenseTypes = ["free", "premium", "trial"];
function slugify(text: string) { return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

export default function AdminProducts() {
  const qc = useQueryClient();
  const { user } = useAuth();
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
  const [discountPrice, setDiscountPrice] = useState<number | "">("");
  const [status, setStatus] = useState<string>("draft");
  const [imageUrl, setImageUrl] = useState("");
  const [thumbnailIcon, setThumbnailIcon] = useState("");
  const [tags, setTags] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [newScreenshot, setNewScreenshot] = useState("");
  const [fileType, setFileType] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [developer, setDeveloper] = useState("");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [licenseType, setLicenseType] = useState("free");
  const [downloadLinks, setDownloadLinks] = useState<{ id?: string; server_id: string; download_url: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPaid, setFilterPaid] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const { data: servers } = useQuery({
    queryKey: ["download-servers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("download_servers").select("*").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let list = [...products];
    if (searchTerm) list = list.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterCategory !== "all") list = list.filter(p => p.category_id === filterCategory);
    if (filterStatus !== "all") list = list.filter(p => p.status === filterStatus);
    if (filterPaid === "paid") list = list.filter(p => p.is_paid);
    if (filterPaid === "free") list = list.filter(p => !p.is_paid);
    list.sort((a, b) => {
      let av: any, bv: any;
      if (sortKey === "title") { av = a.title.toLowerCase(); bv = b.title.toLowerCase(); }
      else if (sortKey === "download_count") { av = a.download_count; bv = b.download_count; }
      else if (sortKey === "price") { av = a.price || 0; bv = b.price || 0; }
      else { av = a.created_at; bv = b.created_at; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [products, searchTerm, filterCategory, filterStatus, filterPaid, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => { if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortKey(key); setSortDir("asc"); } };
  const logActivity = async (action: string, targetId: string, details?: any) => { try { await supabase.from("activity_logs").insert({ user_id: user!.id, action, target_type: "product", target_id: targetId, details } as any); } catch {} };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        title, slug: slug || slugify(title), description, version, file_size: fileSize,
        category_id: categoryId || null, os_type: osType || null,
        is_paid: isPaid, price: isPaid ? price : 0, status,
        image_url: imageUrl || null, thumbnail_icon: thumbnailIcon || null,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        is_verified: isVerified, is_active: isActive, is_featured: isFeatured, is_trending: isTrending,
        screenshots, created_by: user?.id,
        file_type: fileType || null, release_date: releaseDate || null,
        developer: developer || null, discount_price: isPaid && discountPrice !== "" ? discountPrice : null,
        affiliate_link: affiliateLink || null, license_type: licenseType,
      };
      let productId = editId;
      if (editId) {
        const { error } = await supabase.from("products").update(payload).eq("id", editId);
        if (error) throw error;
        await logActivity("update", editId, { title });
      } else {
        const { data, error } = await supabase.from("products").insert(payload).select("id").single();
        if (error) throw error;
        productId = data.id;
        await logActivity("create", data.id, { title });
      }
      if (productId) {
        await supabase.from("product_downloads").delete().eq("product_id", productId);
        const linksToInsert = downloadLinks.filter(l => l.server_id && l.download_url).map(l => ({ product_id: productId!, server_id: l.server_id, download_url: l.download_url }));
        if (linksToInsert.length > 0) { const { error } = await supabase.from("product_downloads").insert(linksToInsert); if (error) throw error; }
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); setDialogOpen(false); resetForm(); toast.success(editId ? "Product updated!" : "Product created!"); },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("products").delete().eq("id", id); if (error) throw error; await logActivity("delete", id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); toast.success("Product deleted"); },
  });
  const bulkMutation = useMutation({
    mutationFn: async (action: "delete" | "publish" | "draft") => {
      const ids = Array.from(selected);
      if (action === "delete") { const { error } = await supabase.from("products").delete().in("id", ids); if (error) throw error; }
      else { const { error } = await supabase.from("products").update({ status: action === "publish" ? "published" : "draft" } as any).in("id", ids); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); setSelected(new Set()); toast.success("Bulk action completed"); },
  });

  const resetForm = () => { setTitle(""); setSlug(""); setDescription(""); setVersion(""); setFileSize(""); setCategoryId(""); setOsType(""); setIsPaid(false); setPrice(0); setDiscountPrice(""); setStatus("draft"); setImageUrl(""); setThumbnailIcon(""); setTags(""); setIsVerified(false); setIsActive(true); setIsFeatured(false); setIsTrending(false); setScreenshots([]); setNewScreenshot(""); setDownloadLinks([]); setEditId(null); setFileType(""); setReleaseDate(""); setDeveloper(""); setAffiliateLink(""); setLicenseType("free"); };
  const openEdit = async (product: any) => {
    setTitle(product.title); setSlug(product.slug || ""); setDescription(product.description || ""); setVersion(product.version || ""); setFileSize(product.file_size || ""); setCategoryId(product.category_id || ""); setOsType(product.os_type || ""); setIsPaid(product.is_paid); setPrice(product.price || 0); setDiscountPrice(product.discount_price ?? ""); setStatus(product.status); setImageUrl(product.image_url || ""); setThumbnailIcon(product.thumbnail_icon || ""); setTags((product.tags || []).join(", ")); setIsVerified(product.is_verified || false); setIsActive(product.is_active !== false); setIsFeatured(product.is_featured || false); setIsTrending(product.is_trending || false); setScreenshots(product.screenshots || []); setFileType(product.file_type || ""); setReleaseDate(product.release_date || ""); setDeveloper(product.developer || ""); setAffiliateLink(product.affiliate_link || ""); setLicenseType(product.license_type || "free"); setEditId(product.id);
    const { data } = await supabase.from("product_downloads").select("*").eq("product_id", product.id);
    setDownloadLinks((data || []).map(d => ({ id: d.id, server_id: d.server_id, download_url: d.download_url }))); setDialogOpen(true);
  };
  const addScreenshot = () => { if (newScreenshot.trim()) { setScreenshots([...screenshots, newScreenshot.trim()]); setNewScreenshot(""); } };
  const removeScreenshot = (i: number) => setScreenshots(screenshots.filter((_, idx) => idx !== i));
  const toggleSelect = (id: string) => { const s = new Set(selected); if (s.has(id)) s.delete(id); else s.add(id); setSelected(s); };
  const toggleAll = () => { if (selected.size === filteredProducts.length) setSelected(new Set()); else setSelected(new Set(filteredProducts.map(p => p.id))); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Products ({products?.length || 0})</h2>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Product</Button></DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? "Edit Product" : "New Product"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Title *</Label><Input value={title} onChange={e => { setTitle(e.target.value); if (!editId) setSlug(slugify(e.target.value)); }} /></div>
                <div className="space-y-2"><Label>Slug</Label><Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="auto-generated" /></div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} /></div>
              <div className="grid grid-cols-2 gap-4">
                <ImageUploadField value={imageUrl} onChange={setImageUrl} folder="products" label="প্রোডাক্ট ইমেজ" />
                <ImageUploadField value={thumbnailIcon} onChange={setThumbnailIcon} folder="products/icons" label="থাম্বনেইল আইকন" maxWidth={200} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Category</Label><Select value={categoryId || "none"} onValueChange={v => setCategoryId(v === "none" ? "" : v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">— None —</SelectItem>{categories?.map(c => <SelectItem key={c.id} value={c.id}>{c.parent_id ? "  └ " : ""}{c.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>OS Type</Label><Select value={osType || "none"} onValueChange={v => setOsType(v === "none" ? "" : v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">— None —</SelectItem>{["windows","android","mac","linux","ios","cross_platform"].map(os => <SelectItem key={os} value={os}>{os}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>File Type</Label><Select value={fileType || "none"} onValueChange={v => setFileType(v === "none" ? "" : v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">— None —</SelectItem>{fileTypes.map(ft => <SelectItem key={ft} value={ft}>{ft}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2"><Label>Version</Label><Input value={version} onChange={e => setVersion(e.target.value)} /></div>
                <div className="space-y-2"><Label>File Size</Label><Input value={fileSize} onChange={e => setFileSize(e.target.value)} placeholder="150 MB" /></div>
                <div className="space-y-2"><Label>Developer</Label><Input value={developer} onChange={e => setDeveloper(e.target.value)} /></div>
                <div className="space-y-2"><Label>Release Date</Label><Input type="date" value={releaseDate} onChange={e => setReleaseDate(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Tags (comma separated)</Label><Input value={tags} onChange={e => setTags(e.target.value)} placeholder="photoshop, editing, design" /></div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2"><Label>Paid?</Label><Select value={isPaid ? "yes" : "no"} onValueChange={v => setIsPaid(v === "yes")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="no">Free</SelectItem><SelectItem value="yes">Paid</SelectItem></SelectContent></Select></div>
                {isPaid && <><div className="space-y-2"><Label>Price (৳)</Label><Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} /></div><div className="space-y-2"><Label>Discount Price</Label><Input type="number" value={discountPrice} onChange={e => setDiscountPrice(e.target.value ? Number(e.target.value) : "")} placeholder="Optional" /></div></>}
                <div className="space-y-2"><Label>License</Label><Select value={licenseType} onValueChange={setLicenseType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{licenseTypes.map(lt => <SelectItem key={lt} value={lt}>{lt}</SelectItem>)}</SelectContent></Select></div>
              </div>
              {isPaid && <div className="space-y-2"><Label>Affiliate Link</Label><Input value={affiliateLink} onChange={e => setAffiliateLink(e.target.value)} /></div>}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Status</Label><Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent></Select></div>
                <div className="flex items-center gap-2 pt-6"><Switch checked={isVerified} onCheckedChange={setIsVerified} /><Label className="flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Verified</Label></div>
                <div className="flex items-center gap-2 pt-6"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label>Active</Label></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2"><Switch checked={isFeatured} onCheckedChange={setIsFeatured} /><Label className="flex items-center gap-1"><Star className="h-4 w-4" /> Featured</Label></div>
                <div className="flex items-center gap-2"><Switch checked={isTrending} onCheckedChange={setIsTrending} /><Label className="flex items-center gap-1"><TrendingUp className="h-4 w-4" /> Trending</Label></div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Image className="h-4 w-4" /> গ্যালারি</Label>
                <ImageUploadField value="" onChange={(url) => { if (url) setScreenshots([...screenshots, url]); }} folder="products/gallery" label="" />
                {screenshots.length > 0 && <div className="grid grid-cols-4 gap-2 mt-2">{screenshots.map((s, i) => <div key={i} className="relative group"><img src={s} alt="" className="rounded-md border aspect-video object-cover w-full" /><button onClick={() => removeScreenshot(i)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button></div>)}</div>}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Download className="h-4 w-4" /> Download Links</Label>
                {downloadLinks.map((link, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Select value={link.server_id || ""} onValueChange={v => { const u = [...downloadLinks]; u[i] = { ...u[i], server_id: v }; setDownloadLinks(u); }}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Server" /></SelectTrigger><SelectContent>{servers?.map(s => <SelectItem key={s.id} value={s.id}>{s.label || s.name}</SelectItem>)}</SelectContent></Select>
                    <Input value={link.download_url} onChange={e => { const u = [...downloadLinks]; u[i] = { ...u[i], download_url: e.target.value }; setDownloadLinks(u); }} placeholder="https://..." className="flex-1" />
                    <Button variant="ghost" size="icon" onClick={() => setDownloadLinks(downloadLinks.filter((_, idx) => idx !== i))}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setDownloadLinks([...downloadLinks, { server_id: "", download_url: "" }])}><Plus className="h-3 w-3 mr-1" /> Add Link</Button>
              </div>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !title.trim()} className="w-full">{saveMutation.isPending ? "Saving..." : editId ? "Update Product" : "Create Product"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search products..." className="pl-9" /></div>
        <Select value={filterCategory} onValueChange={setFilterCategory}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{categories?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent></Select>
        <Select value={filterPaid} onValueChange={setFilterPaid}><SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="free">Free</SelectItem><SelectItem value="paid">Paid</SelectItem></SelectContent></Select>
      </div>
      {selected.size > 0 && <div className="flex gap-2 items-center p-2 bg-muted rounded-md"><span className="text-sm font-medium">{selected.size} selected</span><Button size="sm" variant="outline" onClick={() => bulkMutation.mutate("publish")}>Publish</Button><Button size="sm" variant="outline" onClick={() => bulkMutation.mutate("draft")}>Set Draft</Button><Button size="sm" variant="destructive" onClick={() => bulkMutation.mutate("delete")}>Delete</Button></div>}
      {isLoading ? <div className="animate-pulse h-48 bg-card rounded-xl" /> : (
        <Table>
          <TableHeader><TableRow>
            <TableHead className="w-10"><Checkbox checked={selected.size === filteredProducts.length && filteredProducts.length > 0} onCheckedChange={toggleAll} /></TableHead>
            <TableHead className="w-12"></TableHead>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("title")}><span className="flex items-center gap-1">Title <ArrowUpDown className="h-3 w-3" /></span></TableHead>
            <TableHead>Category</TableHead><TableHead>Status</TableHead>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("price")}><span className="flex items-center gap-1">Price <ArrowUpDown className="h-3 w-3" /></span></TableHead>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("download_count")}><span className="flex items-center gap-1">Downloads <ArrowUpDown className="h-3 w-3" /></span></TableHead>
            <TableHead>Flags</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filteredProducts.map(p => (
              <TableRow key={p.id} data-state={selected.has(p.id) ? "selected" : undefined}>
                <TableCell><Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleSelect(p.id)} /></TableCell>
                <TableCell>{(p as any).image_url ? <img src={(p as any).image_url} alt="" className="h-8 w-8 rounded object-cover" /> : <div className="h-8 w-8 rounded bg-muted flex items-center justify-center"><Image className="h-4 w-4 text-muted-foreground" /></div>}</TableCell>
                <TableCell className="font-medium max-w-[200px] truncate">{p.title}</TableCell>
                <TableCell className="text-sm">{(p as any).categories?.name || "—"}</TableCell>
                <TableCell><Badge variant={p.status === "published" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
                <TableCell>{p.is_paid ? `৳${p.price}` : "Free"}</TableCell>
                <TableCell>{p.download_count}</TableCell>
                <TableCell><div className="flex gap-1 flex-wrap">{(p as any).is_verified && <Badge variant="outline" className="text-xs"><ShieldCheck className="h-3 w-3 mr-0.5" />V</Badge>}{p.is_featured && <Badge variant="outline" className="text-xs"><Star className="h-3 w-3 mr-0.5" />F</Badge>}{(p as any).is_trending && <Badge variant="outline" className="text-xs"><TrendingUp className="h-3 w-3 mr-0.5" />T</Badge>}{!(p as any).is_active && <Badge variant="destructive" className="text-xs">Off</Badge>}</div></TableCell>
                <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
