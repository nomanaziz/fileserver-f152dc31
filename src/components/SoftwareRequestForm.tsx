import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquarePlus, Send } from "lucide-react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
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
      toast.success("Request submitted! We'll review it soon.");
      setTitle("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["software-requests-recent"] });
    }
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
        <h3 className="text-sm font-bold">Request Software</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2 mb-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Software name..."
          className="h-8 text-sm"
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Details (optional)"
          className="text-sm min-h-[60px] resize-none"
        />
        <Button type="submit" size="sm" className="w-full gap-1.5 text-xs" disabled={submitting || !title.trim()}>
          <Send className="h-3 w-3" />
          {submitting ? "Submitting..." : "Submit Request"}
        </Button>
      </form>

      {requests && requests.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Recent Requests</p>
          <div className="space-y-1.5">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-1 px-1">
                <span className="text-xs truncate flex-1">{r.title}</span>
                <span className={`text-[10px] font-medium capitalize ${statusColor[r.status] || "text-muted-foreground"}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}