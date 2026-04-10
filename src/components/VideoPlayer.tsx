import { useState, useRef } from "react";
import { Play, Monitor } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DownloadItem {
  id: string;
  download_url: string;
  file_name: string | null;
  file_size: string | null;
  download_servers: { name: string; label: string | null } | null;
}

interface VideoPlayerProps {
  downloads: DownloadItem[];
  thumbnailUrl?: string | null;
  title: string;
  onEnded?: () => void;
}

export default function VideoPlayer({ downloads, thumbnailUrl, title, onEnded }: VideoPlayerProps) {
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeDownload = downloads.find((d) => d.id === selectedServer);
  const videoUrl = activeDownload?.download_url;

  const handlePlay = () => {
    if (downloads.length === 1) {
      setSelectedServer(downloads[0].id);
      setIsPlaying(true);
    } else if (selectedServer) {
      setIsPlaying(true);
    }
  };

  const handleServerChange = (serverId: string) => {
    setSelectedServer(serverId);
    if (isPlaying && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play();
    }
  };

  if (!downloads || downloads.length === 0) {
    return (
      <div className="aspect-video rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
        কোনো ভিডিও সার্ভার নেই
      </div>
    );
  }

  // Show thumbnail with play overlay
  if (!isPlaying) {
    return (
      <div className="space-y-3">
        <div
          className="aspect-video rounded-lg overflow-hidden bg-muted relative cursor-pointer group"
          onClick={handlePlay}
        >
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50" />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
            <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="h-8 w-8 text-primary-foreground ml-1" />
            </div>
          </div>
        </div>

        {/* Server selector before playing */}
        {downloads.length > 1 && (
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedServer || ""} onValueChange={setSelectedServer}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="সার্ভার সিলেক্ট করুন" />
              </SelectTrigger>
              <SelectContent>
                {downloads.map((dl) => (
                  <SelectItem key={dl.id} value={dl.id}>
                    {dl.download_servers?.label || dl.download_servers?.name || "Server"}
                    {dl.file_size && ` (${dl.file_size})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  }

  // Active video player
  return (
    <div className="space-y-3">
      <div className="aspect-video rounded-lg overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          autoPlay
          className="w-full h-full"
          onEnded={onEnded}
        >
          আপনার ব্রাউজার ভিডিও সাপোর্ট করে না।
        </video>
      </div>

      {/* Server switcher while playing */}
      {downloads.length > 1 && (
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedServer || ""} onValueChange={handleServerChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="সার্ভার পরিবর্তন করুন" />
            </SelectTrigger>
            <SelectContent>
              {downloads.map((dl) => (
                <SelectItem key={dl.id} value={dl.id}>
                  {dl.download_servers?.label || dl.download_servers?.name || "Server"}
                  {dl.file_size && ` (${dl.file_size})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
