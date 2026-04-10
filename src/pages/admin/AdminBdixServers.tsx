import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAccessibilityCheck } from "@/hooks/useAccessibilityCheck";
import { Plus, Pencil, Trash2, Search, Wifi, WifiOff, Loader2, ShieldOff } from "lucide-react";

const CATEGORIES = [
  { key: "media_ftp", label: "Media & FTP" },
  { key: "live_tv", label: "Live TV" },
  { key: "speed_test", label: "Speed Test" },
];

type BdixServer = {
  id: string;
  category: string;
  name: string;
  links: string[];
  sort_order: number;
  is_active: boolean;
};

export default function AdminBdixServers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BdixServer | null>(null);
  const [form, setForm] = useState({ name: "", category: "media_ftp", links: "", sort_order: "0" });
  const [checkingEnabled, setCheckingEnabled] = useState(false);

  const { data: servers = [], isLoading } = useQuery({
    queryKey: ["admin-bdix-servers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bdix_servers")
        .select("*")
        .order("category")
        .order("sort_order");
      if (error) throw error;
      return data as BdixServer[];
    },
  });

  // Collect all links from all servers for accessibility check
  const allLinks = useMemo(() => {
    if (!checkingEnabled) return [];
    return servers.flatMap((s) => s.links);
  }, [servers, checkingEnabled]);

  const { statuses: linkStatuses, recheck, isFromCache } = useAccessibilityCheck(allLinks);

  // Compute per-server accessibility status
  const getServerStatus = useCallback((server: BdixServer): "unknown" | "checking" | "accessible" | "inaccessible" | "partial" => {
    if (!checkingEnabled || server.links.length === 0) return "unknown";
    const serverStatuses = server.links.map((l) => linkStatuses.get(l));
    if (serverStatuses.some((s) => s === "checking" || s === undefined)) return "checking";
    const onlineCount = serverStatuses.filter((s) => s === "online").length;
    if (onlineCount === server.links.length) return "accessible";
    if (onlineCount === 0) return "inaccessible";
    return "partial";
  }, [checkingEnabled, linkStatuses]);

  // Progress
  const checkProgress = useMemo(() => {
    if (!checkingEnabled || allLinks.length === 0) return 100;
    const done = Array.from(linkStatuses.values()).filter((s) => s !== "checking").length;
    return Math.round((done / allLinks.length) * 100);
  }, [checkingEnabled, allLinks.length, linkStatuses]);

  const isChecking = checkingEnabled && checkProgress < 100;

  const upsertMutation = useMutation({
    mutationFn: async (server: { id?: string; name: string; category: string; links: string[]; sort_order: number }) => {
      if (server.id) {
        const { id, ...rest } = server;
        const { error } = await supabase.from("bdix_servers").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { id, ...rest } = server;
        const { error } = await supabase.from("bdix_servers").insert([rest]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bdix-servers"] });
      toast({ title: editing ? "আপডেট হয়েছে" : "যোগ হয়েছে" });
      setDialogOpen(false);
      setEditing(null);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bdix_servers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bdix-servers"] });
      toast({ title: "ডিলিট হয়েছে" });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("bdix_servers").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-bdix-servers"] }),
  });

  // Bulk disable inaccessible servers
  const bulkDisableMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("bdix_servers")
        .update({ is_active: false })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bdix-servers"] });
      toast({ title: "Inaccessible সার্ভার Disable হয়েছে" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const openEdit = (server: BdixServer) => {
    setEditing(server);
    setForm({
      name: server.name,
      category: server.category,
      links: server.links.join("\n"),
      sort_order: String(server.sort_order),
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", category: "media_ftp", links: "", sort_order: "0" });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const links = form.links.split("\n").map((l) => l.trim()).filter(Boolean);
    const payload = {
      name: form.name.trim(),
      category: form.category,
      links,
      sort_order: parseInt(form.sort_order) || 0,
    };
    if (editing) {
      upsertMutation.mutate({ ...payload, id: editing.id });
    } else {
      upsertMutation.mutate(payload);
    }
  };

  const filtered = servers.filter((s) => {
    if (catFilter !== "all" && s.category !== catFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (accessFilter !== "all" && checkingEnabled) {
      const status = getServerStatus(s);
      if (accessFilter === "accessible" && status !== "accessible" && status !== "partial") return false;
      if (accessFilter === "inaccessible" && status !== "inaccessible") return false;
    }
    return true;
  });

  // Inaccessible servers that are still active (for bulk disable)
  const inaccessibleActiveServers = useMemo(() => {
    if (!checkingEnabled || isChecking) return [];
    return servers.filter((s) => s.is_active && getServerStatus(s) === "inaccessible");
  }, [servers, checkingEnabled, isChecking, getServerStatus]);

  const handleStartCheck = () => {
    if (checkingEnabled) {
      recheck();
    } else {
      setCheckingEnabled(true);
    }
  };

  const renderStatusBadge = (server: BdixServer) => {
    const status = getServerStatus(server);
    switch (status) {
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mx-auto" />;
      case "accessible":
        return <span className="inline-flex items-center gap-1 text-xs text-green-600"><span className="h-2 w-2 rounded-full bg-green-500" /> Online</span>;
      case "inaccessible":
        return <span className="inline-flex items-center gap-1 text-xs text-red-600"><span className="h-2 w-2 rounded-full bg-red-500" /> Offline</span>;
      case "partial":
        return <span className="inline-flex items-center gap-1 text-xs text-yellow-600"><span className="h-2 w-2 rounded-full bg-yellow-500" /> Partial</span>;
      default:
        return <span className="text-xs text-muted-foreground">—</span>;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">BD IX Server List</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleStartCheck} disabled={isChecking}>
            {isChecking ? (
              <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> চেক হচ্ছে...</>
            ) : (
              <><Wifi className="h-4 w-4 mr-1" /> {checkingEnabled ? "Re-check Links" : "Check Links"}</>
            )}
          </Button>

          {inaccessibleActiveServers.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <ShieldOff className="h-4 w-4 mr-1" />
                  Disable Inaccessible ({inaccessibleActiveServers.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Inaccessible সার্ভার Disable করবেন?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {inaccessibleActiveServers.length}টা সার্ভারের সব লিংক inaccessible। এগুলো Disable করলে পাবলিক পেজে আর দেখাবে না।
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>বাতিল</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => bulkDisableMutation.mutate(inaccessibleActiveServers.map((s) => s.id))}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {bulkDisableMutation.isPending ? "Disabling..." : "হ্যাঁ, Disable করুন"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Add Server</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Server" : "Add Server"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Links (প্রতি লাইনে একটি URL)</Label>
                  <Textarea
                    value={form.links}
                    onChange={(e) => setForm({ ...form, links: e.target.value })}
                    rows={6}
                    placeholder="http://example.com&#10;http://another.com"
                  />
                </div>
                <div>
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  />
                </div>
                <Button onClick={handleSubmit} disabled={upsertMutation.isPending} className="w-full">
                  {upsertMutation.isPending ? "সেভ হচ্ছে..." : "সেভ করুন"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Progress bar when checking */}
      {isChecking && (
        <div className="mb-4 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>লিংক চেক হচ্ছে...</span>
            <span>{checkProgress}%</span>
          </div>
          <Progress value={checkProgress} className="h-2" />
        </div>
      )}

      {/* Cache indicator */}
      {checkingEnabled && !isChecking && isFromCache && (
        <p className="text-xs text-muted-foreground mb-3">
          ক্যাশ থেকে দেখানো হচ্ছে। আপডেট করতে "Re-check Links" চাপুন।
        </p>
      )}

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {checkingEnabled && (
          <Select value={accessFilter} onValueChange={setAccessFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="accessible">Accessible Only</SelectItem>
              <SelectItem value="inaccessible">Inaccessible Only</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Links</TableHead>
              {checkingEnabled && <TableHead className="text-center">Status</TableHead>}
              <TableHead className="text-center">Order</TableHead>
              <TableHead className="text-center">Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={checkingEnabled ? 7 : 6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={checkingEnabled ? 7 : 6} className="text-center py-8">No servers found</TableCell></TableRow>
            ) : (
              filtered.map((server) => (
                <TableRow key={server.id}>
                  <TableCell className="font-medium max-w-[300px] truncate">{server.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{CATEGORIES.find((c) => c.key === server.category)?.label || server.category}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{server.links.length}</TableCell>
                  {checkingEnabled && <TableCell className="text-center">{renderStatusBadge(server)}</TableCell>}
                  <TableCell className="text-center">{server.sort_order}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={server.is_active}
                      onCheckedChange={(v) => toggleActive.mutate({ id: server.id, is_active: v })}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(server)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("ডিলিট করতে চান?")) deleteMutation.mutate(server.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground mt-3">
        মোট {filtered.length} সার্ভার {catFilter !== "all" ? `(${CATEGORIES.find((c) => c.key === catFilter)?.label})` : ""}
        {checkingEnabled && !isChecking && ` — Accessible: ${servers.filter((s) => getServerStatus(s) === "accessible").length}, Inaccessible: ${servers.filter((s) => getServerStatus(s) === "inaccessible").length}`}
      </p>
    </div>
  );
}
