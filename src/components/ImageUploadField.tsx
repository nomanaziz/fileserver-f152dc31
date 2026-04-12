import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { compressImage } from "@/lib/imageCompression";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, X, Link as LinkIcon } from "lucide-react";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  label?: string;
  maxWidth?: number;
  quality?: number;
  className?: string;
}

export default function ImageUploadField({
  value,
  onChange,
  bucket = "product-images",
  folder = "general",
  label = "ইমেজ",
  maxWidth = 800,
  quality = 0.7,
  className = "",
}: ImageUploadFieldProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("শুধুমাত্র ইমেজ ফাইল আপলোড করুন");
      return;
    }

    setUploading(true);
    try {
      const compressed = await compressImage(file, maxWidth, quality);
      const ext = compressed.type === "image/webp" ? "webp" : "jpg";
      const path = `${user.id}/${folder}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage.from(bucket).upload(path, compressed, {
        contentType: compressed.type,
        upsert: true,
      });
      if (error) throw error;

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(urlData.publicUrl);
      toast.success("ইমেজ আপলোড হয়েছে!");
    } catch (err: any) {
      toast.error("আপলোড ব্যর্থ: " + err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput("");
      setShowUrlInput(false);
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  const displayUrl = value || "/default-image.svg";

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}
      <div className="flex items-start gap-3">
        {/* Preview */}
        <div className="relative group shrink-0">
          <img
            src={displayUrl}
            alt=""
            className="h-20 w-20 rounded-lg border object-cover bg-muted"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/default-image.svg";
            }}
          />
          {value && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="flex gap-1.5">
            <label className="cursor-pointer">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
                <span>
                  <Upload className="h-3.5 w-3.5 mr-1" />
                  {uploading ? "আপলোড হচ্ছে..." : "আপলোড"}
                </span>
              </Button>
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowUrlInput(!showUrlInput)}
            >
              <LinkIcon className="h-3.5 w-3.5 mr-1" />
              URL
            </Button>
          </div>

          {showUrlInput && (
            <div className="flex gap-1.5">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://..."
                className="h-8 text-xs"
                onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
              />
              <Button type="button" size="sm" variant="outline" className="h-8" onClick={handleUrlSubmit}>
                ওকে
              </Button>
            </div>
          )}

          {value && (
            <p className="text-[10px] text-muted-foreground truncate max-w-full" title={value}>
              {value}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
