import { Monitor, Smartphone, Gamepad2, Film, BookOpen, Palette, Code, FileDown } from "lucide-react";

const categoryConfig: Record<string, { gradient: string; icon: any; label: string }> = {
  software: {
    gradient: "from-blue-600/80 to-blue-400/60",
    icon: Monitor,
    label: "Software",
  },
  android: {
    gradient: "from-green-600/80 to-emerald-400/60",
    icon: Smartphone,
    label: "Android",
  },
  games: {
    gradient: "from-purple-600/80 to-violet-400/60",
    icon: Gamepad2,
    label: "Games",
  },
  movies: {
    gradient: "from-red-600/80 to-rose-400/60",
    icon: Film,
    label: "Movies",
  },
  tutorials: {
    gradient: "from-amber-600/80 to-yellow-400/60",
    icon: BookOpen,
    label: "Tutorials",
  },
  graphics: {
    gradient: "from-pink-600/80 to-fuchsia-400/60",
    icon: Palette,
    label: "Graphics",
  },
  "source-code": {
    gradient: "from-cyan-600/80 to-teal-400/60",
    icon: Code,
    label: "Source Code",
  },
};

const defaultConfig = {
  gradient: "from-slate-600/80 to-slate-400/60",
  icon: FileDown,
  label: "Download",
};

interface CategoryPlaceholderProps {
  categorySlug?: string | null;
  className?: string;
  iconSize?: "sm" | "md" | "lg";
}

export default function CategoryPlaceholder({
  categorySlug,
  className = "",
  iconSize = "md",
}: CategoryPlaceholderProps) {
  const config = (categorySlug && categoryConfig[categorySlug]) || defaultConfig;
  const Icon = config.icon;
  const sizes = { sm: "h-5 w-5", md: "h-10 w-10", lg: "h-14 w-14" };

  return (
    <div
      className={`flex flex-col items-center justify-center bg-gradient-to-br ${config.gradient} ${className}`}
    >
      <Icon className={`${sizes[iconSize]} text-white/90 drop-shadow-md`} />
      <span className="text-[10px] font-medium text-white/70 mt-1.5 tracking-wide uppercase">
        {config.label}
      </span>
    </div>
  );
}

export { categoryConfig, defaultConfig };
