import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useActiveSubscription() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["active-subscription", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*, subscription_plans(*)")
        .eq("user_id", user!.id)
        .eq("is_active", true)
        .gte("ends_at", new Date().toISOString())
        .order("ends_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    },
    enabled: !!user,
  });
}

export function useTodayDownloadCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["today-download-count", user?.id],
    queryFn: async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count, error } = await supabase
        .from("download_history")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .gte("downloaded_at", todayStart.toISOString());
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });
}

export function useCanDownloadWithSubscription() {
  const { data: subscription } = useActiveSubscription();
  const { data: todayCount } = useTodayDownloadCount();

  if (!subscription) return { hasSubscription: false, canDownload: false, reason: "" };

  const plan = subscription.subscription_plans as any;
  if (!plan) return { hasSubscription: true, canDownload: false, reason: "Plan not found" };

  const dailyLimit = plan.daily_download_limit;
  const exceeded = todayCount !== undefined && todayCount >= dailyLimit;

  return {
    hasSubscription: true,
    canDownload: !exceeded,
    reason: exceeded ? `Daily limit reached (${dailyLimit}/day)` : "",
    plan,
    subscription,
    todayCount: todayCount || 0,
  };
}
