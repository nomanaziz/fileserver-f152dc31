import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminUsers() {
  const qc = useQueryClient();
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

  const getUserRoles = (userId: string) => roles?.filter((r) => r.user_id === userId).map((r) => r.role) || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles?.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.display_name || "—"}</TableCell>
                <TableCell>{p.phone || "—"}</TableCell>
                <TableCell className="space-x-1">{getUserRoles(p.id).map((r) => <Badge key={r} variant="outline">{r}</Badge>)}</TableCell>
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
    </div>
  );
}
