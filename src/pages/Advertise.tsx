import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Monitor, LayoutGrid, FileText, Download, Check, Users, Eye, TrendingUp } from "lucide-react";

const placements = [
  {
    id: "header-banner",
    name: "হেডার ব্যানার",
    size: "728×90",
    price: 5000,
    icon: Monitor,
    description: "সাইটের উপরে প্রতিটি পেজে দেখায়। সর্বোচ্চ ভিজিবিলিটি।",
  },
  {
    id: "sidebar",
    name: "সাইডবার",
    size: "300×250",
    price: 3000,
    icon: LayoutGrid,
    description: "ক্যাটাগরি ও প্রোডাক্ট পেজের পাশে। টার্গেটেড অডিয়েন্স।",
  },
  {
    id: "in-content",
    name: "ইন-কন্টেন্ট",
    size: "468×60",
    price: 2000,
    icon: FileText,
    description: "কন্টেন্টের মাঝে, স্বাভাবিকভাবে মিশে যায়। নেটিভ ফিল।",
  },
  {
    id: "before-download",
    name: "ডাউনলোডের আগে",
    size: "728×90",
    price: 4000,
    icon: Download,
    description: "ডাউনলোড বাটনের ঠিক আগে। সর্বোচ্চ ক্লিক রেট।",
  },
];

const stats = [
  { label: "মাসিক ভিজিটর", value: "৫০,০০০+", icon: Users },
  { label: "পেজ ভিউ", value: "২,০০,০০০+", icon: Eye },
  { label: "গ্রোথ রেট", value: "১৫%", icon: TrendingUp },
];

export default function Advertise() {
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) {
      toast.error("একটি বিজ্ঞাপনের স্থান নির্বাচন করুন।");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("ad_inquiries" as any).insert({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      placement: selected,
      message: form.message || null,
    } as any);
    setLoading(false);
    if (error) {
      toast.error("পাঠাতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    } else {
      setSubmitted(true);
      toast.success("আপনার অনুরোধ পাঠানো হয়েছে! শীঘ্রই যোগাযোগ করা হবে।");
    }
  };

  return (
    <Layout>
      <div className="container py-8 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">আমাদের ওয়েবসাইটে বিজ্ঞাপন দিন</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            আমাদের সাইটে আপনার প্রোডাক্ট বা সার্ভিস প্রচার করুন। হাজারো ডেইলি ভিজিটরের কাছে পৌঁছান।
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {stats.map((s) => (
            <Card key={s.label} className="text-center">
              <CardContent className="pt-6">
                <s.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Placements */}
        <h2 className="text-xl font-semibold mb-4">বিজ্ঞাপনের স্থান ও মূল্য</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {placements.map((p) => {
            const isSelected = selected === p.id;
            return (
              <Card
                key={p.id}
                className={`cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"}`}
                onClick={() => setSelected(p.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${isSelected ? "bg-primary/10" : "bg-muted"}`}>
                      <p.icon className={`h-6 w-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold">{p.name}</h3>
                        {isSelected && <Check className="h-5 w-5 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{p.description}</p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="bg-muted px-2 py-0.5 rounded text-xs font-mono">{p.size}</span>
                        <span className="font-semibold text-primary">৳{p.price.toLocaleString("bn-BD")}/মাস</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Contact Form */}
        {submitted ? (
          <Card className="max-w-lg mx-auto text-center">
            <CardContent className="pt-8 pb-8">
              <Check className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">ধন্যবাদ!</h3>
              <p className="text-muted-foreground">আপনার অনুরোধ পাওয়া গেছে। আমরা শীঘ্রই যোগাযোগ করবো।</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>অর্ডার করুন</CardTitle>
            </CardHeader>
            <CardContent>
              {selected && (
                <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20 text-sm">
                  নির্বাচিত: <strong>{placements.find(p => p.id === selected)?.name}</strong> — ৳{placements.find(p => p.id === selected)?.price.toLocaleString("bn-BD")}/মাস
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>নাম *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label>ইমেইল *</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={255} />
                </div>
                <div className="space-y-2">
                  <Label>ফোন</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} placeholder="০১৭XXXXXXXX" />
                </div>
                <div className="space-y-2">
                  <Label>মেসেজ</Label>
                  <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} maxLength={500} placeholder="আপনার বিজ্ঞাপন সম্পর্কে বিস্তারিত..." />
                </div>
                <Button type="submit" disabled={loading || !selected} className="w-full">
                  {loading ? "পাঠানো হচ্ছে..." : "অর্ডার পাঠান"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* FAQ */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-center">সচরাচর জিজ্ঞাসা</h2>
          <div className="space-y-4">
            {[
              { q: "পেমেন্ট কিভাবে করবো?", a: "বিকাশ, নগদ বা ব্যাংক ট্রান্সফারে পেমেন্ট করতে পারবেন। অর্ডার কনফার্ম হলে বিস্তারিত জানানো হবে।" },
              { q: "বিজ্ঞাপনের সময়কাল কত?", a: "সর্বনিম্ন ১ মাস। দীর্ঘমেয়াদী প্যাকেজে ডিসকাউন্ট পাবেন।" },
              { q: "কাস্টম সাইজ সম্ভব?", a: "হ্যাঁ, আপনার প্রয়োজন অনুযায়ী কাস্টম সাইজ ও প্লেসমেন্ট আলোচনা সাপেক্ষে সম্ভব।" },
            ].map((faq, i) => (
              <Card key={i}>
                <CardContent className="pt-4 pb-4">
                  <h4 className="font-medium mb-1">{faq.q}</h4>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
