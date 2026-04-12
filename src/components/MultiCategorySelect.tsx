import { useState, useMemo, useRef, useEffect } from "react";
import { useCategories, type Category } from "@/hooks/useCategories";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X, Search, ChevronDown } from "lucide-react";

interface Props {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
}

export default function MultiCategorySelect({ selectedIds, onChange, label = "ক্যাটাগরি" }: Props) {
  const { data: categories } = useCategories();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { parents, childrenMap } = useMemo(() => {
    if (!categories) return { parents: [], childrenMap: {} as Record<string, Category[]> };
    const p = categories.filter(c => !c.parent_id);
    const cm: Record<string, Category[]> = {};
    categories.filter(c => c.parent_id).forEach(c => {
      if (!cm[c.parent_id!]) cm[c.parent_id!] = [];
      cm[c.parent_id!].push(c);
    });
    return { parents: p, childrenMap: cm };
  }, [categories]);

  const filtered = useMemo(() => {
    if (!search.trim()) return null; // show hierarchy
    const q = search.toLowerCase();
    return categories?.filter(c => c.name.toLowerCase().includes(q)) || [];
  }, [search, categories]);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectedCategories = categories?.filter(c => selectedIds.includes(c.id)) || [];

  return (
    <div className="space-y-2" ref={ref}>
      {label && <Label>{label}</Label>}

      {/* Selected badges */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedCategories.map(c => (
            <Badge key={c.id} variant="secondary" className="gap-1 pr-1">
              {c.name}
              <button onClick={() => toggle(c.id)} className="hover:bg-muted rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Dropdown trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground"
      >
        <span className="text-muted-foreground">
          {selectedIds.length > 0 ? `${selectedIds.length}টি সিলেক্ট করা হয়েছে` : "ক্যাটাগরি বাছুন..."}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="border rounded-md bg-popover shadow-md z-50 max-h-64 overflow-hidden flex flex-col">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="খুঁজুন..."
                className="pl-7 h-8 text-sm"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto p-1">
            {filtered ? (
              // Flat search results
              filtered.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">পাওয়া যায়নি</p>
              ) : (
                filtered.map(c => (
                  <CategoryItem key={c.id} category={c} checked={selectedIds.includes(c.id)} onToggle={toggle} indent={!!c.parent_id} />
                ))
              )
            ) : (
              // Hierarchical view
              parents.map(p => (
                <div key={p.id}>
                  <CategoryItem category={p} checked={selectedIds.includes(p.id)} onToggle={toggle} indent={false} />
                  {childrenMap[p.id]?.map(ch => (
                    <CategoryItem key={ch.id} category={ch} checked={selectedIds.includes(ch.id)} onToggle={toggle} indent />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryItem({ category, checked, onToggle, indent }: { category: Category; checked: boolean; onToggle: (id: string) => void; indent: boolean }) {
  return (
    <label
      className={`flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer text-sm ${indent ? "pl-6" : ""}`}
    >
      <Checkbox checked={checked} onCheckedChange={() => onToggle(category.id)} />
      {category.icon && <span className="text-base">{category.icon}</span>}
      <span>{category.name}</span>
    </label>
  );
}
