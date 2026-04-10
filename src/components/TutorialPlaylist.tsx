import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Monitor, ListVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DownloadItem {
  id: string;
  download_url: string;
  file_name: string | null;
  file_size: string | null;
  download_servers: { name: string; label: string | null } | null;
}

interface TutorialPlaylistProps {
  downloads: DownloadItem[];
  title: string;
}

export default function TutorialPlaylist({ downloads, title }: TutorialPlaylistProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoNext, setAutoNext] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentItem = downloads[currentIndex];

  const handlePlayItem = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (currentIndex > 0) handlePlayItem(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < downloads.length - 1) handlePlayItem(currentIndex + 1);
  };

  const handleEnded = () => {
    if (autoNext && currentIndex < downloads.length - 1) {
      handleNext();
    }
  };

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex, isPlaying]);

  if (!downloads || downloads.length === 0) {
    return (
      <div className="aspect-video rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
        কোনো টিউটোরিয়াল ভিডিও নেই
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video player area */}
      <div className="aspect-video rounded-lg overflow-hidden bg-black">
        {isPlaying && currentItem ? (
          <video
            ref={videoRef}
            src={currentItem.download_url}
            controls
            autoPlay
            className="w-full h-full"
            onEnded={handleEnded}
          >
            আপনার ব্রাউজার ভিডিও সাপোর্ট করে না।
          </video>
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/50 cursor-pointer group"
            onClick={() => handlePlayItem(0)}
          >
            <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-3">
              <Play className="h-8 w-8 text-primary-foreground ml-1" />
            </div>
            <p className="text-muted-foreground text-sm">প্লেলিস্ট শুরু করুন</p>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={handlePrev} disabled={currentIndex === 0}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext} disabled={currentIndex >= downloads.length - 1}>
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {downloads.length}
        </span>
        <Button
          variant={autoNext ? "default" : "outline"}
          size="sm"
          onClick={() => setAutoNext(!autoNext)}
          className="text-xs"
        >
          অটো-নেক্সট {autoNext ? "চালু" : "বন্ধ"}
        </Button>
      </div>

      {/* Playlist */}
      <div className="border rounded-lg">
        <div className="flex items-center gap-2 p-3 border-b bg-muted/30">
          <ListVideo className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">প্লেলিস্ট ({downloads.length}টি ভিডিও)</h4>
        </div>
        <ScrollArea className="max-h-[320px]">
          <div className="divide-y">
            {downloads.map((dl, i) => (
              <button
                key={dl.id}
                onClick={() => handlePlayItem(i)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors text-sm",
                  i === currentIndex && isPlaying && "bg-primary/10 border-l-2 border-l-primary"
                )}
              >
                <span className={cn(
                  "flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium",
                  i === currentIndex && isPlaying
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {i === currentIndex && isPlaying ? (
                    <Play className="h-3 w-3" />
                  ) : (
                    i + 1
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">
                    {dl.file_name || dl.download_servers?.label || dl.download_servers?.name || `পর্ব ${i + 1}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dl.download_servers?.label || dl.download_servers?.name || "Server"}
                    {dl.file_size && ` • ${dl.file_size}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
