import { useState, useEffect } from "react";
import { useVendorProfile, useUpdateVendorProfile } from "@/hooks/useVendor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import ImageUploadField from "@/components/ImageUploadField";

export default function VendorSettings() {
  const { data: profile } = useVendorProfile();
  const updateProfile = useUpdateVendorProfile();
  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    if (profile) {
      setStoreName(profile.store_name || "");
      setStoreDesc(profile.store_description || "");
      setLogoUrl(profile.logo_url || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!storeName.trim()) { toast.error("স্টোরের নাম দিন"); return; }
    try {
      await updateProfile.mutateAsync({ store_name: storeName, store_description: storeDesc, logo_url: logoUrl || undefined });
      toast.success("সেটিংস আপডেট হয়েছে!");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-lg font-semibold">স্টোর সেটিংস</h2>
      <Card>
        <CardHeader><CardTitle className="text-base">স্টোর তথ্য</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>স্টোরের নাম</Label><Input value={storeName} onChange={e => setStoreName(e.target.value)} /></div>
          <div className="space-y-2"><Label>বিবরণ</Label><Textarea value={storeDesc} onChange={e => setStoreDesc(e.target.value)} rows={3} /></div>
          <ImageUploadField value={logoUrl} onChange={setLogoUrl} bucket="vendor-logos" folder="logos" label="লোগো" maxWidth={200} />
          <Button onClick={handleSave} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "সেভ হচ্ছে..." : "সেভ করুন"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
