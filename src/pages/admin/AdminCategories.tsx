import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useCategories, useMutateCategory, Category } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminCategories() {
  const { data: categories } = useCategories();
  const { upsert, remove } = useMutateCategory();
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    try {
      const { created_at, updated_at, ...data } = editing;
      if (!data.parent_id) delete data.parent_id;
      await upsert.mutateAsync(data);
      toast.success("সেভ হয়েছে!");
      setOpen(false);
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ক্যাটাগরি ম্যানেজমেন্ট</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing({ name: "", slug: "", description: "", icon: "", parent_id: "", sort_order: 0, is_active: true })}>
              <Plus className="h-4 w-4 mr-1" /> নতুন
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing?.id ? "এডিট" : "নতুন"} ক্যাটাগরি</DialogTitle></DialogHeader>
            {editing && (
              <div className="space-y-4">
                <div className="space-y-2"><Label>নাম</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>স্লাগ</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
                <div className="space-y-2"><Label>বিবরণ</Label><Input value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>প্যারেন্ট</Label>
                  <Select value={editing.parent_id || ""} onValueChange={(v) => setEditing({ ...editing, parent_id: v || null })}>
                    <SelectTrigger><SelectValue placeholder="কোনোটি নয়" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">কোনোটি নয়</SelectItem>
                      {categories?.filter(c => c.id !== editing.id).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSave} disabled={upsert.isPending} className="w-full">সেভ করুন</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader><TableRow><TableHead>নাম</TableHead><TableHead>স্লাগ</TableHead><TableHead>প্যারেন্ট</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
          <TableBody>
            {categories?.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.slug}</TableCell>
                <TableCell>{categories.find(p => p.id === c.parent_id)?.name || "-"}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={async () => { if (confirm("মুছে ফেলতে চান?")) { await remove.mutateAsync(c.id); toast.success("মুছে ফেলা হয়েছে!"); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
