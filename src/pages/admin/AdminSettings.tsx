import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, CreditCard, Smartphone } from "lucide-react";

const settingFields = [
  { key: "site_name", label: "Site Name", placeholder: "File Server BD" },
  { key: "site_description", label: "Site Description", placeholder: "Free software download platform" },
  { key: "site_logo", label: "Logo URL", placeholder: "https://..." },
  { key: "site_favicon", label: "Favicon URL", placeholder: "https://..." },
  { key: "contact_email", label: "Contact Email", placeholder: "admin@example.com" },
  { key: "footer_text", label: "Footer Text", placeholder: "© 2024 File Server BD" },
  { key: "google_analytics", label: "Google Analytics ID", placeholder: "G-XXXXXXXXXX" },
  { key: "adsense_client", label: "AdSense Client ID", placeholder: "ca-pub-XXXXXXXXXX" },
  { key: "telegram_link", label: "Telegram Link", placeholder: "https://t.me/channel" },
  { key: "facebook_link", label: "Facebook Link", placeholder: "https://facebook.com/page" },
  { key: "youtube_link", label: "YouTube Link", placeholder: "https://youtube.com/channel" },
];

const paystationFields = [
  { key: "paystation_merchant_id", label: "Merchant ID", placeholder: "আপনার PayStation Merchant ID" },
  { key: "paystation_password", label: "Password", placeholder: "আপনার PayStation Password" },
];

const bkashFields = [
  { key: "bkash_app_key", label: "App Key", placeholder: "আপনার bKash App Key" },
  { key: "bkash_app_secret", label: "App Secret", placeholder: "আপনার bKash App Secret" },
  { key: "bkash_username", label: "Username", placeholder: "আপনার bKash Username" },
  { key: "bkash_password", label: "Password", placeholder: "আপনার bKash Password" },
];

const allToggleKeys = ["paystation_enabled", "bkash_enabled", "bkash_sandbox"];

export default function AdminSettings() {
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const { data: settings } = useQuery({ queryKey: ["admin-settings"], queryFn: async () => { const { data, error } = await supabase.from("site_settings").select("*"); if (error) throw error; return data; } });
  useEffect(() => { if (settings) { const map: Record<string, string> = {}; settings.forEach(s => { map[s.key] = s.value || ""; }); setValues(map); } }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const allFields = [...settingFields, ...paystationFields, ...bkashFields, ...allToggleKeys.map(k => ({ key: k }))];
      for (const field of allFields) {
        const existing = settings?.find(s => s.key === field.key);
        if (existing) { await supabase.from("site_settings").update({ value: values[field.key] || null }).eq("id", existing.id); }
        else if (values[field.key]) { await supabase.from("site_settings").insert({ key: field.key, value: values[field.key] }); }
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-settings"] }); toast.success("Settings saved!"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Site Settings</h2>
      <Card><CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {settingFields.map(field => <div key={field.key} className="space-y-2"><Label>{field.label}</Label><Input value={values[field.key] || ""} onChange={e => setValues({ ...values, [field.key]: e.target.value })} placeholder={field.placeholder} /></div>)}
        </CardContent>
      </Card>

      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> PayStation পেমেন্ট গেটওয়ে</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-md bg-muted">
            <div>
              <p className="font-medium text-sm">PayStation সক্রিয় করুন</p>
              <p className="text-xs text-muted-foreground">এটি চালু করলে চেকআউটে PayStation ব্যবহার হবে</p>
            </div>
            <Switch
              checked={values.paystation_enabled === "true"}
              onCheckedChange={(checked) => setValues({ ...values, paystation_enabled: checked ? "true" : "false" })}
            />
          </div>
          {paystationFields.map(field => (
            <div key={field.key} className="space-y-2">
              <Label>{field.label}</Label>
              <Input
                value={values[field.key] || ""}
                onChange={e => setValues({ ...values, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                type={field.key === "paystation_password" ? "password" : "text"}
              />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            PayStation থেকে Merchant ID ও Password পেতে{" "}
            <a href="https://www.paystation.com.bd" target="_blank" rel="noopener" className="text-primary underline">paystation.com.bd</a> তে রেজিস্ট্রেশন করুন।
          </p>
        </CardContent>
      </Card>

      <Card className="border-pink-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5 text-pink-500" /> bKash মার্চেন্ট API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-md bg-muted">
            <div>
              <p className="font-medium text-sm">bKash সক্রিয় করুন</p>
              <p className="text-xs text-muted-foreground">এটি চালু করলে চেকআউটে bKash পেমেন্ট ব্যবহার হবে</p>
            </div>
            <Switch
              checked={values.bkash_enabled === "true"}
              onCheckedChange={(checked) => setValues({ ...values, bkash_enabled: checked ? "true" : "false" })}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-md bg-muted">
            <div>
              <p className="font-medium text-sm">Sandbox Mode</p>
              <p className="text-xs text-muted-foreground">টেস্টিং এর জন্য Sandbox মোড চালু রাখুন</p>
            </div>
            <Switch
              checked={values.bkash_sandbox === "true"}
              onCheckedChange={(checked) => setValues({ ...values, bkash_sandbox: checked ? "true" : "false" })}
            />
          </div>
          {bkashFields.map(field => (
            <div key={field.key} className="space-y-2">
              <Label>{field.label}</Label>
              <Input
                value={values[field.key] || ""}
                onChange={e => setValues({ ...values, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                type={field.key.includes("secret") || field.key.includes("password") ? "password" : "text"}
              />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            bKash Merchant credentials পেতে{" "}
            <a href="https://developer.bka.sh" target="_blank" rel="noopener" className="text-primary underline">developer.bka.sh</a> তে রেজিস্ট্রেশন করুন।
          </p>
        </CardContent>
      </Card>

      <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full"><Save className="h-4 w-4 mr-2" /> Save Settings</Button>
    </div>
  );
}
