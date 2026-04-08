import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminChat() {
  const { user } = useAuth();
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  const { data: conversations } = useQuery({
    queryKey: ["admin-conversations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("chat_conversations").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!selectedConvo) return;
    const fetch = async () => {
      const { data } = await supabase.from("chat_messages").select("*").eq("conversation_id", selectedConvo).order("created_at");
      setMessages(data || []);
    };
    fetch();

    const channel = supabase.channel(`chat-${selectedConvo}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${selectedConvo}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConvo]);

  const sendMessage = async () => {
    if (!message.trim() || !selectedConvo || !user) return;
    const { error } = await supabase.from("chat_messages").insert({ conversation_id: selectedConvo, sender_id: user.id, message: message.trim() });
    if (error) toast.error(error.message);
    setMessage("");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Live Chat</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Conversations</CardTitle></CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {conversations?.map((c) => (
                <button key={c.id} onClick={() => setSelectedConvo(c.id)} className={`w-full text-left p-3 border-b hover:bg-muted/50 ${selectedConvo === c.id ? "bg-muted" : ""}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{c.subject || "No subject"}</span>
                    <Badge variant={c.status === "open" ? "default" : "secondary"}>{c.status}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(c.updated_at).toLocaleString()}</span>
                </button>
              ))}
              {conversations?.length === 0 && <p className="text-center text-muted-foreground py-8">No conversations.</p>}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader><CardTitle>Messages</CardTitle></CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {selectedConvo ? (
              <>
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-3">
                    {messages.map((m) => (
                      <div key={m.id} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${m.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          {m.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
                  <Button onClick={sendMessage}>Send</Button>
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-16">Select a conversation to view messages.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
