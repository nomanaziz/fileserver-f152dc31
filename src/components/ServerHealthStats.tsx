import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Server } from "lucide-react";

interface ServerHealth {
  serverName: string;
  serverId: string;
  total: number;
  working: number;
  successRate: number;
}

export default function ServerHealthStats() {
  const { data: healthData, isLoading } = useQuery({
    queryKey: ["admin-server-health"],
    queryFn: async () => {
      // Get all feedback
      const { data: feedback, error: fbErr } = await supabase
        .from("download_feedback")
        .select("download_id, is_working");
      if (fbErr) throw fbErr;

      // Get all downloads with server info
      const { data: downloads, error: dlErr } = await supabase
        .from("product_downloads")
        .select("id, server_id, download_servers(name, label)");
      if (dlErr) throw dlErr;

      // Aggregate by server
      const serverMap = new Map<string, { name: string; total: number; working: number }>();

      for (const dl of downloads || []) {
        const serverName = (dl as any).download_servers?.label || (dl as any).download_servers?.name || "Unknown";
        const serverId = dl.server_id;
        const dlFeedback = (feedback || []).filter((f: any) => f.download_id === dl.id);

        if (dlFeedback.length === 0) continue;

        if (!serverMap.has(serverId)) {
          serverMap.set(serverId, { name: serverName, total: 0, working: 0 });
        }
        const entry = serverMap.get(serverId)!;
        entry.total += dlFeedback.length;
        entry.working += dlFeedback.filter((f: any) => f.is_working).length;
      }

      const result: ServerHealth[] = [];
      serverMap.forEach((val, key) => {
        result.push({
          serverId: key,
          serverName: val.name,
          total: val.total,
          working: val.working,
          successRate: Math.round((val.working / val.total) * 100),
        });
      });

      return result.sort((a, b) => a.successRate - b.successRate);
    },
  });

  if (isLoading || !healthData || healthData.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Server className="h-4 w-4" /> সার্ভার হেলথ রিপোর্ট
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {healthData.map((s) => (
          <div key={s.serverId} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium truncate">{s.serverName}</span>
                {s.successRate < 30 ? (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-0.5" /> ব্যর্থ
                  </Badge>
                ) : s.successRate >= 70 ? (
                  <Badge variant="outline" className="text-xs text-green-600">
                    <CheckCircle className="h-3 w-3 mr-0.5" /> ভালো
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">মোটামুটি</Badge>
                )}
              </div>
              <Progress value={s.successRate} className="h-2" />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {s.successRate}% ({s.working}/{s.total})
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
