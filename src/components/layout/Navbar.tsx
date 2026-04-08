import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Search, Menu, User, LogOut, Heart, Download, Shield, Command,
  ShoppingCart, Home, Crown, ChevronDown, ExternalLink, Radio,
} from "lucide-react";
import defaultLogo from "@/assets/fileserver-white-logo.png";
import { Button } from "@/components/ui/button";
import { useCartCount } from "@/hooks/useCart";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Navbar() {
  const { user, isAdmin, isModerator, signOut } = useAuth();
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = useCartCount();

  const { data: categories } = useQuery({
    queryKey: ["nav-categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug, icon, parent_id, sort_order")
        .order("sort_order");
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: siteSettings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*");
      const map: Record<string, string> = {};
      data?.forEach((s: any) => { map[s.key] = s.value || ""; });
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: headerMenuItems } = useQuery({
    queryKey: ["header-menu-items"],
    queryFn: async () => {
      const { data } = await supabase
        .from("menu_items")
        .select("id, label, url, icon, sort_order, parent_id")
        .eq("location", "header")
        .eq("is_active", true)
        .is("parent_id", null)
        .order("sort_order");
      // Filter out items that duplicate category links, Home, Pricing, Live TV (already rendered)
      const skipUrls = new Set(["/", "/pricing", "/live-tv"]);
      return (data || []).filter(item => {
        if (skipUrls.has(item.url)) return false;
        if (item.url.startsWith("/category/")) return false;
        return true;
      });
    },
    staleTime: 5 * 60 * 1000,
  });

  const topCategories = categories?.filter(c => !c.parent_id) || [];
  const getChildren = (parentId: string) => categories?.filter(c => c.parent_id === parentId) || [];

  const logoUrl = siteSettings?.site_logo || defaultLogo;

  const activeSlug = location.pathname === "/"
    ? ""
    : location.pathname.startsWith("/category/")
      ? location.pathname.split("/category/")[1]
      : location.pathname === "/pricing"
        ? "pricing"
        : location.pathname === "/live-tv"
          ? "live-tv"
          : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setDrawerOpen(false);
    }
  };

  const navTo = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-background">
      <nav className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 h-14">
          <Link to="/" className="flex items-center shrink-0">
            <img src={logoUrl} alt="FileServer" className="h-8 object-contain" />
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden lg:flex">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search software, apps, games..."
                className="pl-9 pr-16 h-9 text-sm bg-muted border-transparent focus:border-primary/30 focus:bg-background rounded-lg transition-all"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 text-[10px] font-medium text-muted-foreground">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </div>
          </form>

          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="h-8 w-8 relative hidden sm:flex" onClick={() => navigate(user ? "/favorites" : "/login")}>
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs px-2 hidden sm:flex" onClick={() => navigate("/cart")}>
              <ShoppingCart className="h-4 w-4" />
              <span className="text-muted-foreground">{cartCount}</span>
            </Button>

            <div className="hidden lg:flex items-center gap-1.5">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-muted">
                      <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-primary" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs font-medium truncate">{user.email}</p>
                    </div>
                    <DropdownMenuItem onClick={() => navigate("/dashboard")} className="gap-2 cursor-pointer text-sm">
                      <User className="h-3.5 w-3.5" /> Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/favorites")} className="gap-2 cursor-pointer text-sm">
                      <Heart className="h-3.5 w-3.5" /> Favorites
                    </DropdownMenuItem>
                    {(isAdmin || isModerator) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate("/admin")} className="gap-2 cursor-pointer text-sm text-primary">
                          <Shield className="h-3.5 w-3.5" /> Admin Panel
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="gap-2 cursor-pointer text-sm text-destructive focus:text-destructive">
                      <LogOut className="h-3.5 w-3.5" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="text-xs text-muted-foreground hover:text-foreground h-8">
                    Sign In
                  </Button>
                  <Button size="sm" onClick={() => navigate("/register")} className="text-xs h-8">
                    Sign Up
                  </Button>
                </div>
              )}
            </div>

            <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setDrawerOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="border-b border-border bg-background hidden lg:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-2">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium whitespace-nowrap rounded-full transition-all duration-200 ${
                activeSlug === "" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            {topCategories.map((cat) => {
              const children = getChildren(cat.id);
              const isActive = activeSlug === cat.slug;

              if (children.length > 0) {
                return (
                  <Popover key={cat.id}>
                    <PopoverTrigger asChild>
                      <button
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium whitespace-nowrap rounded-full transition-all duration-200 ${
                          isActive || children.some(c => activeSlug === c.slug)
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        }`}
                      >
                        <span>{cat.name}</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-1" align="start">
                      <Link
                        to={`/category/${cat.slug}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors font-medium"
                      >
                        All {cat.name}
                      </Link>
                      {children.map(child => (
                        <Link
                          key={child.id}
                          to={`/category/${child.slug}`}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </PopoverContent>
                  </Popover>
                );
              }

              return (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium whitespace-nowrap rounded-full transition-all duration-200 ${
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  <span>{cat.name}</span>
                </Link>
              );
            })}

            <Link
              to="/pricing"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium whitespace-nowrap rounded-full transition-all duration-200 ${
                activeSlug === "pricing" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <Crown className="h-4 w-4" />
              <span>Pricing</span>
            </Link>

            <Link
              to="/live-tv"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium whitespace-nowrap rounded-full transition-all duration-200 ${
                activeSlug === "live-tv" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <Radio className="h-4 w-4" />
              <span>Live TV</span>
            </Link>

            {headerMenuItems?.map(item => (
              <Link
                key={item.id}
                to={item.url}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium whitespace-nowrap rounded-full transition-all duration-200 text-muted-foreground hover:bg-primary/10 hover:text-primary"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="text-left flex items-center gap-2">
              <img src={logoUrl} alt="FileServer" className="h-7 object-contain" />
            </SheetTitle>
          </SheetHeader>

          <div className="p-4 border-b border-border">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="pl-9 bg-muted h-9 text-sm"
                />
              </div>
            </form>
          </div>

          <div className="p-2 border-b border-border max-h-[40vh] overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground px-3 py-2">Categories</p>
            <button
              onClick={() => navTo("/")}
              className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeSlug === "" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Home className="h-4 w-4" />
              Home
            </button>

            {topCategories.map(cat => {
              const children = getChildren(cat.id);
              const isActive = activeSlug === cat.slug;
              const isExpanded = expandedCat === cat.id;

              return (
                <div key={cat.id}>
                  <button
                    onClick={() => {
                      if (children.length > 0) {
                        setExpandedCat(isExpanded ? null : cat.id);
                      } else {
                        navTo(`/category/${cat.slug}`);
                      }
                    }}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className="flex-1 text-left">{cat.name}</span>
                    {children.length > 0 && (
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    )}
                  </button>
                  {isExpanded && children.length > 0 && (
                    <div className="ml-4 border-l border-border pl-2">
                      <button
                        onClick={() => navTo(`/category/${cat.slug}`)}
                        className="flex items-center gap-3 w-full px-3 py-2 text-xs font-medium rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        All {cat.name}
                      </button>
                      {children.map(child => (
                        <button
                          key={child.id}
                          onClick={() => navTo(`/category/${child.slug}`)}
                          className={`flex items-center gap-3 w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                            activeSlug === child.slug ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {child.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => navTo("/pricing")}
              className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeSlug === "pricing" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Crown className="h-4 w-4" />
              Pricing
            </button>
          </div>

          {headerMenuItems && headerMenuItems.length > 0 && (
            <div className="p-2 border-b border-border">
              {headerMenuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => navTo(item.url)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
          )}

          <div className="p-4">
            {user ? (
              <div className="space-y-1">
                <button onClick={() => navTo("/dashboard")} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <User className="h-4 w-4" /> Dashboard
                </button>
                <button onClick={() => navTo("/favorites")} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <Heart className="h-4 w-4" /> Favorites
                </button>
                {(isAdmin || isModerator) && (
                  <button onClick={() => navTo("/admin")} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg text-primary hover:bg-primary/10 transition-colors">
                    <Shield className="h-4 w-4" /> Admin Panel
                  </button>
                )}
                <button onClick={() => { signOut(); setDrawerOpen(false); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="w-full" onClick={() => navTo("/login")}>Sign In</Button>
                <Button className="w-full" onClick={() => navTo("/register")}>Sign Up</Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}