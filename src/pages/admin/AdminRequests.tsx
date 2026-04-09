import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, PackagePlus, XCircle, Bell, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminRequests() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [notifyDialog, setNotifyDialog] = useState<any>(null);
  const [productLink, setProductLink] = useState("");
  const [notifyType, setNotifyType] = useState<"free" | "paid">("free");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("software_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const userIds = [...new Set((data || []).map((r) => r.user_id).filter(Boolean))] as string[];
      let profileMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, display_name").in("id", userIds);
        profiles?.forEach((p) => {
          profileMap[p.id] = p.display_name || "—";
        });
      }

      // Fetch subscriber counts
      const countMap: Record<string, number> = {};
      for (const r of data || []) {
        const { count } = await supabase
          .from("software_request_subscribers")
          .select("*", { count: "exact", head: true })
          .eq("request_id", r.id);
        countMap[r.id] = count || 0;
      }

      return (data || []).map((r) => ({
        ...r,
        user_display_name: r.user_id ? profileMap[r.user_id] || "—" : "Guest",
        subscriber_count: countMap[r.id] || 0,
      }));
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, fulfilled_product_id }: { id: string; status: string; fulfilled_product_id?: string }) => {
      const update: any = { status };
      if (fulfilled_product_id) update.fulfilled_product_id = fulfilled_product_id;
      const { error } = await supabase.from("software_requests").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("আপডেট হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("software_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("ডিলিট হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleConvert = (r: any) => {
    updateStatus.mutate({ id: r.id, status: "fulfilled" });
    navigate(`/admin/products?new=true&title=${encodeURIComponent(r.title)}`);
  };

  const handleNotify = async () => {
    if (!notifyDialog) return;
    const requestId = notifyDialog.id;
    const requestTitle = notifyDialog.title;

    // Get all subscribers + the original requester
    const { data: subscribers } = await supabase
      .from("software_request_subscribers")
      .select("user_id")
      .eq("request_id", requestId);

    const userIds = new Set<string>();
    if (notifyDialog.user_id) userIds.add(notifyDialog.user_id);
    subscribers?.forEach((s: any) => userIds.add(s.user_id));

    if (userIds.size === 0) {
      toast.error("কোনো সাবস্ক্রাইবার নেই");
      return;
    }

    const typeLabel = notifyType === "free" ? "ফ্রি" : "পেইড";
    const notifications = Array.from(userIds).map((uid) => ({
      user_id: uid,
      title: `"${requestTitle}" এখন available!`,
      message: `এই সফটওয়্যারটি ${typeLabel} হিসেবে যোগ করা হয়েছে।`,
      link: productLink || null,
    }));

    const { error } = await supabase.from("notifications").insert(notifications);
    if (error) {
      toast.error(error.message);
      return;
    }

    await supabase.from("software_requests").update({ is_notified: true }).eq("id", requestId);
    toast.success(`${userIds.size} জনকে নোটিফাই করা হয়েছে`);
    setNotifyDialog(null);
    setProductLink("");
    queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
  };

  if (isLoading) return <div className="animate-pulse h-48 bg-card rounded-xl" />;

  const statusBadge = (s: string) => {
    const map: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      fulfilled: "default",
      rejected: "destructive",
    };
    return (
      <Badge variant={map[s] || "secondary"} className="capitalize">
        {s}
      </Badge>
    );
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">সফটওয়্যার রিকোয়েস্ট ({requests?.length || 0})</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>সফটওয়্যার</TableHead>
            <TableHead>বিবরণ</TableHead>
            <TableHead>ইউজার</TableHead>
            <TableHead><Users className="h-3.5 w-3.5 inline" /> ভোট</TableHead>
            <TableHead>স্ট্যাটাস</TableHead>
            <TableHead>তারিখ</TableHead>
            <TableHead>অ্যাকশন</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests?.map((r: any) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.title}</TableCell>
              <TableCell className="max-w-[200px] truncate text-muted-foreground">{r.description || "—"}</TableCell>
              <TableCell>{r.user_display_name}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {r.subscriber_count}
                </Badge>
              </TableCell>
              <TableCell>{statusBadge(r.status)}</TableCell>
              <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {r.status === "pending" && (
                    <>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleConvert(r)}>
                        <PackagePlus className="h-3 w-3" /> Convert
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs gap-1"
                        onClick={() => updateStatus.mutate({ id: r.id, status: "rejected" })}
                      >
                        <XCircle className="h-3 w-3" /> Reject
                      </Button>
                    </>
                  )}
                  {r.status === "fulfilled" && !r.is_notified && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 text-primary"
                      onClick={() => setNotifyDialog(r)}
                    >
                      <Bell className="h-3 w-3" /> Notify
                    </Button>
                  )}
                  {r.is_notified && (
                    <Badge variant="outline" className="text-xs text-green-600">
                      Notified
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive"
                    onClick={() => deleteRequest.mutate(r.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {(!requests || requests.length === 0) && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                কোনো রিকোয়েস্ট নেই
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Notify Dialog */}
      <Dialog open={!!notifyDialog} onOpenChange={(o) => !o && setNotifyDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>সাবস্ক্রাইবারদের নোটিফাই করুন</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              "{notifyDialog?.title}" — {notifyDialog?.subscriber_count || 0} জন সাবস্ক্রাইবার + রিকোয়েস্টকারী
            </p>
            <div>
              <Label className="text-sm">ধরন</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  size="sm"
                  variant={notifyType === "free" ? "default" : "outline"}
                  onClick={() => setNotifyType("free")}
                >
                  ফ্রি
                </Button>
                <Button
                  size="sm"
                  variant={notifyType === "paid" ? "default" : "outline"}
                  onClick={() => setNotifyType("paid")}
                >
                  পেইড
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-sm">প্রোডাক্ট লিংক (ঐচ্ছিক)</Label>
              <Input
                value={productLink}
                onChange={(e) => setProductLink(e.target.value)}
                placeholder="/product/software-slug"
                className="mt-1"
              />
            </div>
            <Button className="w-full gap-1.5" onClick={handleNotify}>
              <Bell className="h-4 w-4" /> নোটিফাই পাঠান
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
