import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { Download, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto flex min-h-[80vh] px-4">
        {/* Left — branding */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-3xl" />
          <div className="relative text-center space-y-6 max-w-sm">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Download className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome to<br /><span className="text-gradient">FileServer</span></h2>
            <p className="text-muted-foreground">Access thousands of downloads — software, apps, games, and more.</p>
          </div>
        </div>

        {/* Right — form */}
        <div className="flex-1 flex items-center justify-center py-12">
          <Card className="w-full max-w-md shadow-sm">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-primary flex items-center justify-center lg:hidden">
                <Download className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
              <CardDescription>Sign in to your FileServer account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="h-11" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">Forgot?</Link>
                  </div>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="h-11" />
                </div>
                <Button type="submit" className="w-full h-11 gap-2" disabled={loading}>
                  {loading ? "Signing in..." : <>Sign In <ArrowRight className="h-4 w-4" /></>}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline font-medium">Create one</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}