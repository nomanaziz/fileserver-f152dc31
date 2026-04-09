import { Link } from "react-router-dom";
import { Monitor, Smartphone, Gamepad2, Film, BookOpen, Palette, Code } from "lucide-react";

const banners = [
  { slug: "software", label: "সফটওয়্যার", icon: Monitor, gradient: "from-blue-600 to-blue-400", textColor: "text-white" },
  { slug: "android", label: "অ্যান্ড্রয়েড", icon: Smartphone, gradient: "from-green-600 to-emerald-400", textColor: "text-white" },
  { slug: "games", label: "গেমস", icon: Gamepad2, gradient: "from-purple-600 to-violet-400", textColor: "text-white" },
  { slug: "movies", label: "মুভিস", icon: Film, gradient: "from-red-600 to-rose-400", textColor: "text-white" },
  { slug: "tutorials", label: "টিউটোরিয়াল", icon: BookOpen, gradient: "from-amber-500 to-yellow-400", textColor: "text-white" },
  { slug: "graphics", label: "গ্রাফিক্স", icon: Palette, gradient: "from-pink-600 to-fuchsia-400", textColor: "text-white" },
  { slug: "source-code", label: "সোর্স কোড", icon: Code, gradient: "from-cyan-600 to-teal-400", textColor: "text-white" },
];

export default function CategoryBanners() {
  return (
    <section className="border-b border-border bg-background/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide md:grid md:grid-cols-7 md:overflow-visible">
          {banners.map((b) => {
            const Icon = b.icon;
            return (
              <Link
                key={b.slug}
                to={`/category/${b.slug}`}
                className={`flex-shrink-0 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br ${b.gradient} px-5 py-4 min-w-[110px] hover:scale-105 hover:shadow-lg transition-all duration-300 group`}
              >
                <Icon className="h-6 w-6 text-white drop-shadow-sm group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white/90 whitespace-nowrap">{b.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
