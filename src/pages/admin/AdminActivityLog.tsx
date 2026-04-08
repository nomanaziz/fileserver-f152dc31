import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminActivityLog() {
  const { data: logs } = useQuery({
    queryKey: ["admin-activity-logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Activity Log</h1>
      <div className="border rounded-lg">
        <Table>
          <TableHeader><TableRow><TableHead>Action</TableHead><TableHead>Details</TableHead><TableHead>User ID</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
          <TableBody>
            {logs?.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.action}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{JSON.stringify(log.details)}</TableCell>
                <TableCell className="font-mono text-sm">{log.user_id?.slice(0, 8) || "-"}</TableCell>
                <TableCell className="text-sm">{new Date(log.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {logs?.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No activity logs.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
