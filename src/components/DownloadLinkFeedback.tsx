import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  downloadId: string;
  productId: string;
}

export default function DownloadLinkFeedback({ downloadId, productId }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  // Fetch aggregated feedback stats for this download link
  const { data: stats } = useQuery({
    queryKey: ["download-feedback-stats", downloadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("download_feedback")
        .select("is_working")
        .eq("download_id", downloadId);
      if (error) throw error;
      const total = data.length;
      const working = data.filter((f: any) => f.is_working).length;
      const notWorking = total - working;
      const successRate = total > 0 ? Math.round((working / total) * 100) : null;
      return { total, working, notWorking, successRate };
    },
  });

  const submitFeedback = async (isWorking: boolean) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("download-feedback", {
        body: { download_id: downloadId, product_id: productId, is_working: isWorking },
      });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["download-feedback-stats", downloadId] });
      qc.invalidateQueries({ queryKey: ["download-feedback-all", productId] });
      toast.success(isWorking ? "ধন্যবাদ! ✅" : "রিপোর্ট করা হয়েছে ❌");
    } catch (e: any) {
      toast.error(e.message || "ফিডব্যাক দিতে ব্যর্থ");
    } finally {
      setSubmitting(false);
    }
  };

  const resetFeedback = async () => {
    if (!user) return;
    try {
      await supabase
        .from("download_feedback")
        .delete()
        .eq("download_id", downloadId)
        .eq("user_id", user.id);
      qc.invalidateQueries({ queryKey: ["download-feedback-stats", downloadId] });
      qc.invalidateQueries({ queryKey: ["download-feedback-all", productId] });
      toast.success("ফিডব্যাক রিসেট হয়েছে");
    } catch {
      toast.error("রিসেট ব্যর্থ");
    }
  };

  return (
    <div className="flex items-center gap-1.5 mt-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-500/10"
        onClick={() => submitFeedback(true)}
        disabled={submitting}
        title="কাজ করেছে"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10"
        onClick={() => submitFeedback(false)}
        disabled={submitting}
        title="কাজ করেনি"
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </Button>
      {user && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={resetFeedback}
          title="রিসেট"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      )}
      {stats && stats.total > 0 && (
        <span
          className={`text-xs font-medium ml-1 ${
            stats.successRate! >= 70
              ? "text-green-600"
              : stats.successRate! >= 40
              ? "text-amber-500"
              : "text-red-500"
          }`}
        >
          {stats.successRate}% সফল ({stats.total})
        </span>
      )}
    </div>
  );
}
