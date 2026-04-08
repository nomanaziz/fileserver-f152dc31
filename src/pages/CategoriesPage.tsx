import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { Card, CardContent } from "@/components/ui/card";
import { Folder } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const parents = categories?.filter((c) => !c.parent_id) || [];

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">সকল ক্যাটাগরি</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))
            : parents.map((cat) => (
                <Link key={cat.id} to={`/category/${cat.slug}`}>
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                      <Folder className="h-10 w-10 text-primary" />
                      <h3 className="font-semibold">{cat.name}</h3>
                      {cat.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
        </div>
      </div>
    </Layout>
  );
}
