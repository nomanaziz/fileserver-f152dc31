import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NotificationBell() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const unreadCount = notifications?.filter((n: any) => !n.is_read).length || 0;

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
  };

  const markAllRead = async () => {
    if (!notifications?.length) return;
    const unread = notifications.filter((n: any) => !n.is_read);
    for (const n of unread) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
    }
    queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="text-sm font-semibold">নোটিফিকেশন</span>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline">
              সব পড়া হয়েছে
            </button>
          )}
        </div>
        {(!notifications || notifications.length === 0) && (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">কোনো নোটিফিকেশন নেই</div>
        )}
        {notifications?.map((n: any) => (
          <DropdownMenuItem
            key={n.id}
            className={`flex flex-col items-start gap-1 px-3 py-2 cursor-pointer ${!n.is_read ? "bg-primary/5" : ""}`}
            onClick={() => markRead(n.id)}
            asChild={!!n.link}
          >
            {n.link ? (
              <Link to={n.link}>
                <span className="text-sm font-medium">{n.title}</span>
                {n.message && <span className="text-xs text-muted-foreground">{n.message}</span>}
              </Link>
            ) : (
              <div>
                <span className="text-sm font-medium">{n.title}</span>
                {n.message && <span className="text-xs text-muted-foreground">{n.message}</span>}
              </div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
