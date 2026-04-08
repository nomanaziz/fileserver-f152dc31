import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useProducts, useMutateProduct, Product } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const emptyProduct = {
  title: "", slug: "", description: "", category_id: "", content_type: "software" as const,
  os_type: "windows" as const, version: "", file_size: "", price: 0, is_paid: false,
  is_featured: false, status: "draft" as const, thumbnail_url: "",
};

export default function AdminProducts() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { upsert, remove } = useMutateProduct();
  const { user } = useAuth();
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    const data = { ...editing };
    if (!data.id) data.created_by = user?.id;
    data.price = Number(data.price) || 0;
    try {
      await upsert.mutateAsync(data);
      toast.success("সেভ হয়েছে!");
      setOpen(false);
      setEditing(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("মুছে ফেলতে চান?")) return;
    try {
      await remove.mutateAsync(id);
      toast.success("মুছে ফেলা হয়েছে!");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">প্রোডাক্ট ম্যানেজমেন্ট</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing({ ...emptyProduct })}><Plus className="h-4 w-4 mr-1" /> নতুন</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing?.id ? "এডিট" : "নতুন"} প্রোডাক্ট</DialogTitle></DialogHeader>
            {editing && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>শিরোনাম</Label>
                    <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>স্লাগ</Label>
                    <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>বিবরণ</Label>
                  <Textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ক্যাটাগরি</Label>
                    <Select value={editing.category_id || ""} onValueChange={(v) => setEditing({ ...editing, category_id: v })}>
                      <SelectTrigger><SelectValue placeholder="বাছাই করুন" /></SelectTrigger>
                      <SelectContent>
                        {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>স্ট্যাটাস</Label>
                    <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>ভার্সন</Label>
                    <Input value={editing.version || ""} onChange={(e) => setEditing({ ...editing, version: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>ফাইল সাইজ</Label>
                    <Input value={editing.file_size || ""} onChange={(e) => setEditing({ ...editing, file_size: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>মূল্য</Label>
                    <Input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value, is_paid: Number(e.target.value) > 0 })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>থাম্বনেইল URL</Label>
                  <Input value={editing.thumbnail_url || ""} onChange={(e) => setEditing({ ...editing, thumbnail_url: e.target.value })} />
                </div>
                <Button onClick={handleSave} disabled={upsert.isPending} className="w-full">
                  {upsert.isPending ? "সেভ হচ্ছে..." : "সেভ করুন"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>শিরোনাম</TableHead>
              <TableHead>ক্যাটাগরি</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead>মূল্য</TableHead>
              <TableHead className="text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell>{p.categories?.name || "-"}</TableCell>
                <TableCell><Badge variant={p.status === "published" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
                <TableCell>{p.is_paid ? `৳${p.price}` : "ফ্রি"}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {products?.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">কোনো প্রোডাক্ট নেই।</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
