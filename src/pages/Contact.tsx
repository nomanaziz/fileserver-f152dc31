import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert(form as any);
    setLoading(false);
    if (error) toast.error("পাঠাতে ব্যর্থ হয়েছে।");
    else {
      toast.success("মেসেজ পাঠানো হয়েছে!");
      setForm({ name: "", email: "", subject: "", message: "" });
    }
  };

  const contactInfo = [
    { icon: Mail, title: "ইমেইল", value: "support@fileserver.com", desc: "যেকোনো সময় মেইল করুন" },
    { icon: Phone, title: "ফোন", value: "+880 1700-000000", desc: "সকাল ১০টা - রাত ১০টা" },
    { icon: MapPin, title: "ঠিকানা", value: "ঢাকা, বাংলাদেশ", desc: "প্রধান কার্যালয়" },
    { icon: Clock, title: "সাপোর্ট সময়", value: "২৪/৭ অনলাইন", desc: "সবসময় সাহায্যের জন্য প্রস্তুত" },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative border-b border-border bg-muted/30 py-10 md:py-14">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <MessageSquare className="h-3.5 w-3.5" />
            আমাদের সাথে কথা বলুন
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">যোগাযোগ করুন</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            কোনো প্রশ্ন, পরামর্শ বা সমস্যা থাকলে নিচের ফর্ম পূরণ করুন। আমরা দ্রুত উত্তর দেওয়ার চেষ্টা করি।
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {/* Contact Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {contactInfo.map((item) => (
            <Card key={item.title} className="text-center border-border hover:border-primary/30 transition-colors">
              <CardContent className="pt-6 pb-5 px-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold mb-0.5">{item.title}</h3>
                <p className="text-sm font-medium text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Form + Map/Info */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Send className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">মেসেজ পাঠান</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">আপনার নাম *</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="নাম লিখুন"
                        required
                        className="bg-muted/50 border-border focus:border-primary/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">ইমেইল *</Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="email@example.com"
                        required
                        className="bg-muted/50 border-border focus:border-primary/40"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">বিষয়</Label>
                    <Input
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="কিসের ব্যাপারে লিখছেন?"
                      className="bg-muted/50 border-border focus:border-primary/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">মেসেজ *</Label>
                    <Textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="আপনার মেসেজ বিস্তারিত লিখুন..."
                      rows={6}
                      required
                      className="bg-muted/50 border-border focus:border-primary/40 resize-none"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto px-8">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        পাঠানো হচ্ছে...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        মেসেজ পাঠান
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border bg-muted/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5 text-primary" />
                  <h3 className="font-bold">সচরাচর জিজ্ঞাসা</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { q: "ডাউনলোড কি ফ্রি?", a: "হ্যাঁ, বেশিরভাগ কন্টেন্ট ফ্রিতে ডাউনলোড করা যায়।" },
                    { q: "সফটওয়্যার রিকোয়েস্ট করা যায়?", a: "হ্যাঁ, হোমপেজ থেকে রিকোয়েস্ট ফর্ম পূরণ করুন।" },
                    { q: "কতদিনে রিপ্লাই পাব?", a: "সাধারণত ২৪ ঘণ্টার মধ্যে উত্তর দেওয়া হয়।" },
                  ].map((faq) => (
                    <div key={faq.q}>
                      <p className="text-sm font-medium mb-1">{faq.q}</p>
                      <p className="text-xs text-muted-foreground">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center">
                  <MessageSquare className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-bold mb-1">লাইভ চ্যাট</h3>
                  <p className="text-xs text-muted-foreground mb-4">দ্রুত সাহায্যের জন্য লাইভ চ্যাট ব্যবহার করুন</p>
                  <Button variant="outline" size="sm" className="text-xs">
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                    চ্যাট শুরু করুন
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
