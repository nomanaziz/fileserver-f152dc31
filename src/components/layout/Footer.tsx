import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary mb-3">
              <Shield className="h-5 w-5" />
              FileServer
            </Link>
            <p className="text-sm text-muted-foreground">
              আপনার প্রয়োজনীয় সকল সফটওয়্যার, গেমস, এবং ডিজিটাল কন্টেন্ট এক জায়গায়।
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">লিংক</h3>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/categories" className="hover:text-foreground">ক্যাটাগরি</Link>
              <Link to="/blog" className="hover:text-foreground">ব্লগ</Link>
              <Link to="/contact" className="hover:text-foreground">যোগাযোগ</Link>
              <Link to="/page/about" className="hover:text-foreground">আমাদের সম্পর্কে</Link>
            </nav>
          </div>
          <div>
            <h3 className="font-semibold mb-3">সাপোর্ট</h3>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/page/privacy" className="hover:text-foreground">প্রাইভেসি পলিসি</Link>
              <Link to="/page/terms" className="hover:text-foreground">শর্তাবলী</Link>
              <Link to="/page/faq" className="hover:text-foreground">FAQ</Link>
            </nav>
          </div>
        </div>
        <div className="border-t mt-8 pt-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} FileServer. সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </footer>
  );
}
