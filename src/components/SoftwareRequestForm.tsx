import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquarePlus, Send, ThumbsUp, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function SoftwareRequestForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Check pending request count for limit
  const { data: pendingCount } = useQuery({
    queryKey: ["my-pending-request-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("software_requests")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("status", "pending");
      if (error) throw error;
      return count || 0;
    },
  });

  const MAX_PENDING = 5;
  const limitReached = (pendingCount || 0) >= MAX_PENDING;

  const { data: requests } = useQuery({
    queryKey: ["software-requests-recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("software_requests")
        .select("id, title, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  // Fetch subscriber counts for recent requests
  const { data: subscriberCounts } = useQuery({
    queryKey: ["software-request-subscriber-counts", requests?.map((r) => r.id)],
    enabled: !!requests && requests.length > 0,
    queryFn: async () => {
      const counts: Record<string, number> = {};
      for (const r of requests!) {
        const { count } = await supabase
          .from("software_request_subscribers")
          .select("*", { count: "exact", head: true })
          .eq("request_id", r.id);
        counts[r.id] = count || 0;
      }
      return counts;
    },
  });

  // Fetch user's own subscriptions
  const { data: mySubscriptions } = useQuery({
    queryKey: ["my-request-subscriptions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("software_request_subscribers")
        .select("request_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return new Set(data.map((s: any) => s.request_id));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("software_requests").insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("রিকোয়েস্ট জমা হয়েছে! শীঘ্রই রিভিউ করা হবে।");
      setTitle("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["software-requests-recent"] });
    }
  };

  const toggleSubscribe = async (requestId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const isSubscribed = mySubscriptions?.has(requestId);
    if (isSubscribed) {
      await supabase
        .from("software_request_subscribers")
        .delete()
        .eq("request_id", requestId)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("software_request_subscribers")
        .insert({ request_id: requestId, user_id: user.id });
    }
    queryClient.invalidateQueries({ queryKey: ["my-request-subscriptions"] });
    queryClient.invalidateQueries({ queryKey: ["software-request-subscriber-counts"] });
  };

  const statusColor: Record<string, string> = {
    pending: "text-yellow-600",
    fulfilled: "text-green-600",
    rejected: "text-destructive",
  };

  return (
    <div className="rounded-xl border border-border bg-background p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquarePlus className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold">সফটওয়্যার রিকোয়েস্ট</h3>
      </div>

      {!user ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-3">রিকোয়েস্ট করতে লগইন করুন</p>
          <Button size="sm" className="gap-1.5" onClick={() => navigate("/login")}>
            <LogIn className="h-3.5 w-3.5" />
            লগইন করুন
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2 mb-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="সফটওয়্যারের নাম..."
            className="h-8 text-sm"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="বিস্তারিত (ঐচ্ছিক)"
            className="text-sm min-h-[60px] resize-none"
          />
          <Button type="submit" size="sm" className="w-full gap-1.5 text-xs" disabled={submitting || !title.trim()}>
            <Send className="h-3 w-3" />
            {submitting ? "জমা হচ্ছে..." : "রিকোয়েস্ট জমা দিন"}
          </Button>
        </form>
      )}

      {requests && requests.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">সাম্প্রতিক রিকোয়েস্ট</p>
          <div className="space-y-1.5">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-1 px-1 gap-2">
                <span className="text-xs truncate flex-1">{r.title}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {user && (
                    <button
                      onClick={() => toggleSubscribe(r.id)}
                      className={`flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full border transition-colors ${
                        mySubscriptions?.has(r.id)
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <ThumbsUp className="h-2.5 w-2.5" />
                      {subscriberCounts?.[r.id] || 0}
                    </button>
                  )}
                  <span className={`text-[10px] font-medium capitalize ${statusColor[r.status] || "text-muted-foreground"}`}>
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
