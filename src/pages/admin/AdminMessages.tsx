import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminMessages() {
  const { data: messages } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">যোগাযোগ মেসেজ</h1>
      <div className="border rounded-lg">
        <Table>
          <TableHeader><TableRow><TableHead>নাম</TableHead><TableHead>ইমেইল</TableHead><TableHead>বিষয়</TableHead><TableHead>তারিখ</TableHead><TableHead>স্ট্যাটাস</TableHead></TableRow></TableHeader>
          <TableBody>
            {messages?.map((m: any) => (
              <TableRow key={m.id}>
                <TableCell>{m.name}</TableCell>
                <TableCell>{m.email}</TableCell>
                <TableCell>{m.subject || "-"}</TableCell>
                <TableCell className="text-sm">{new Date(m.created_at).toLocaleDateString("bn-BD")}</TableCell>
                <TableCell><Badge variant={m.is_read ? "secondary" : "default"}>{m.is_read ? "পঠিত" : "অপঠিত"}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
