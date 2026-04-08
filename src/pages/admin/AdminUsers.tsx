import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminUsers() {
  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*, user_roles(role)");
      if (error) throw error;
      return data;
    },
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">ইউজার ম্যানেজমেন্ট</h1>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>নাম</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead>রোল</TableHead>
              <TableHead>যোগদান</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((u: any) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.display_name || "N/A"}</TableCell>
                <TableCell><Badge variant={u.is_active ? "default" : "secondary"}>{u.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</Badge></TableCell>
                <TableCell>{u.user_roles?.map((r: any) => r.role).join(", ") || "user"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString("bn-BD")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
