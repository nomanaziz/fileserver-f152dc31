import { Link, useParams } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";
import { Folder } from "lucide-react";

export default function CategorySidebar() {
  const { data: categories, isLoading } = useCategories();
  const { slug } = useParams();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 rounded-md bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  const parents = categories?.filter((c) => !c.parent_id) || [];

  return (
    <nav className="space-y-1">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 px-3">
        ক্যাটাগরি
      </h3>
      {parents.map((cat) => {
        const children = categories?.filter((c) => c.parent_id === cat.id) || [];
        return (
          <div key={cat.id}>
            <Link
              to={`/category/${cat.slug}`}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                slug === cat.slug
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <Folder className="h-4 w-4 shrink-0" />
              {cat.name}
            </Link>
            {children.length > 0 && (
              <div className="ml-6 space-y-0.5 mt-0.5">
                {children.map((child) => (
                  <Link
                    key={child.id}
                    to={`/category/${child.slug}`}
                    className={cn(
                      "block px-3 py-1.5 rounded-md text-sm transition-colors",
                      slug === child.slug
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
