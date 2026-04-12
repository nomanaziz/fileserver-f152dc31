import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Search, Shield, UserCheck, UserX, Trash2 } from "lucide-react";

export default function AdminUsers() {
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkRole, setBulkRole] = useState("user");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: profiles } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: roles } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data;
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("profiles").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Updated!"); },
  });

  const changeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-user-roles"] }); toast.success("Role updated!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const getUserRoles = (userId: string) => roles?.filter((r) => r.user_id === userId).map((r) => r.role) || [];

  const filteredProfiles = profiles?.filter((p) => {
    const matchSearch = !searchTerm || (p.display_name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (p.phone || "").includes(searchTerm);
    const userRoles = getUserRoles(p.id);
    const matchRole = roleFilter === "all" || userRoles.includes(roleFilter as any);
    return matchSearch && matchRole;
  });

  const filteredIds = filteredProfiles?.map((p) => p.id) || [];
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0;

  const toggleAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredIds));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  // Bulk mutations
  const bulkChangeRole = async () => {
    const ids = Array.from(selectedIds);
    let success = 0;
    for (const uid of ids) {
      try {
        await supabase.from("user_roles").delete().eq("user_id", uid);
        await supabase.from("user_roles").insert({ user_id: uid, role: bulkRole } as any);
        success++;
      } catch {}
    }
    qc.invalidateQueries({ queryKey: ["admin-user-roles"] });
    toast.success(`${success} জনের role পরিবর্তন হয়েছে`);
    setSelectedIds(new Set());
  };

  const bulkActivate = async () => {
    const ids = Array.from(selectedIds);
    let success = 0;
    for (const uid of ids) {
      const { error } = await supabase.from("profiles").update({ is_active: true }).eq("id", uid);
      if (!error) success++;
    }
    qc.invalidateQueries({ queryKey: ["admin-users"] });
    toast.success(`${success} জন activate হয়েছে`);
    setSelectedIds(new Set());
  };

  const bulkDeactivate = async () => {
    const ids = Array.from(selectedIds);
    let success = 0;
    for (const uid of ids) {
      const { error } = await supabase.from("profiles").update({ is_active: false }).eq("id", uid);
      if (!error) success++;
    }
    qc.invalidateQueries({ queryKey: ["admin-users"] });
    toast.success(`${success} জন deactivate হয়েছে`);
    setSelectedIds(new Set());
  };

  const bulkDelete = async () => {
    const ids = Array.from(selectedIds);
    let success = 0;
    for (const uid of ids) {
      await supabase.from("user_roles").delete().eq("user_id", uid);
      const { error } = await supabase.from("profiles").update({ is_active: false }).eq("id", uid);
      if (!error) success++;
    }
    qc.invalidateQueries({ queryKey: ["admin-users"] });
    qc.invalidateQueries({ queryKey: ["admin-user-roles"] });
    toast.success(`${success} জন মুছে ফেলা হয়েছে (deactivated + roles removed)`);
    setSelectedIds(new Set());
    setShowDeleteDialog(false);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users ({profiles?.length || 0})</h1>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or phone..." className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Action Toolbar */}
      {someSelected && (
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border bg-muted/50 sticky top-0 z-10">
          <span className="text-sm font-medium">{selectedIds.size} জন সিলেক্ট করা হয়েছে</span>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <div className="flex items-center gap-1">
              <Select value={bulkRole} onValueChange={setBulkRole}>
                <SelectTrigger className="w-[120px] h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={bulkChangeRole}>
                <Shield className="h-3.5 w-3.5 mr-1" /> Role Apply
              </Button>
            </div>
            <Button size="sm" variant="outline" onClick={bulkActivate}>
              <UserCheck className="h-3.5 w-3.5 mr-1" /> Activate
            </Button>
            <Button size="sm" variant="outline" onClick={bulkDeactivate}>
              <UserX className="h-3.5 w-3.5 mr-1" /> Deactivate
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
          </div>
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={allFilteredSelected} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfiles?.map((p) => (
              <TableRow key={p.id} className={selectedIds.has(p.id) ? "bg-muted/30" : ""}>
                <TableCell>
                  <Checkbox checked={selectedIds.has(p.id)} onCheckedChange={() => toggleOne(p.id)} />
                </TableCell>
                <TableCell className="font-medium">{p.display_name || "—"}</TableCell>
                <TableCell>{p.phone || "—"}</TableCell>
                <TableCell>
                  <Select value={getUserRoles(p.id)[0] || "user"} onValueChange={(v) => changeRole.mutate({ userId: p.id, role: v })}>
                    <SelectTrigger className="w-[120px] h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell><Badge variant={p.is_active ? "default" : "destructive"}>{p.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell className="text-sm">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => toggleActive.mutate({ id: p.id, is_active: !p.is_active })}>
                    {p.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>নিশ্চিত করুন</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedIds.size} জন ইউজারকে deactivate করা হবে এবং তাদের role মুছে ফেলা হবে। এটা আর undo করা যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={bulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              হ্যাঁ, মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
