import { useCategories } from "@/hooks/useCategories";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CategorySidebarProps {
  parentCategoryId?: string;
  selectedSubcategoryIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export default function CategorySidebar({
  parentCategoryId,
  selectedSubcategoryIds,
  onSelectionChange,
}: CategorySidebarProps) {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 rounded-md bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  // Find subcategories of the current parent
  const subcategories = categories?.filter((c) => c.parent_id === parentCategoryId) || [];

  if (subcategories.length === 0) return null;

  const toggle = (id: string) => {
    if (selectedSubcategoryIds.includes(id)) {
      onSelectionChange(selectedSubcategoryIds.filter((s) => s !== id));
    } else {
      onSelectionChange([...selectedSubcategoryIds, id]);
    }
  };

  return (
    <nav className="space-y-1">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 px-1">
        সাবক্যাটাগরি ফিল্টার
      </h3>
      <div className="space-y-2">
        {subcategories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2 px-1">
            <Checkbox
              id={`sub-${cat.id}`}
              checked={selectedSubcategoryIds.includes(cat.id)}
              onCheckedChange={() => toggle(cat.id)}
            />
            <Label
              htmlFor={`sub-${cat.id}`}
              className="text-sm cursor-pointer flex-1"
            >
              {cat.name}
            </Label>
          </div>
        ))}
      </div>
      {selectedSubcategoryIds.length > 0 && (
        <button
          onClick={() => onSelectionChange([])}
          className="text-xs text-primary hover:underline mt-2 px-1"
        >
          সব ক্লিয়ার করুন
        </button>
      )}
    </nav>
  );
}
