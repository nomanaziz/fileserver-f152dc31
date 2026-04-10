import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CategoryPage from "./pages/CategoryPage";
import CategoriesPage from "./pages/CategoriesPage";
import ProductDetail from "./pages/ProductDetail";
import SearchPage from "./pages/SearchPage";
import StaticPage from "./pages/StaticPage";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import LiveTV from "./pages/LiveTV";
import CheckoutPage from "./pages/CheckoutPage";
import SubscriptionCheckout from "./pages/SubscriptionCheckout";
import BecomeVendor from "./pages/BecomeVendor";
import VendorStore from "./pages/VendorStore";
import FavoritesPage from "./pages/FavoritesPage";
import CartPage from "./pages/CartPage";
import Advertise from "./pages/Advertise";
import BlogList from "./pages/BlogList";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminServers from "./pages/admin/AdminServers";
import AdminContacts from "./pages/admin/AdminContacts";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPaymentMethods from "./pages/admin/AdminPaymentMethods";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminScraping from "./pages/admin/AdminScraping";
import AdminAds from "./pages/admin/AdminAds";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminActivityLog from "./pages/admin/AdminActivityLog";
import AdminPages from "./pages/admin/AdminPages";
import AdminMenuItems from "./pages/admin/AdminMenuItems";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminChat from "./pages/admin/AdminChat";
import AdminLiveTV from "./pages/admin/AdminLiveTV";
import AdminVendors from "./pages/admin/AdminVendors";
import AdminBdixServers from "./pages/admin/AdminBdixServers";
import BdixServers from "./pages/BdixServers";

import VendorLayout from "./pages/vendor/VendorLayout";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorProducts from "./pages/vendor/VendorProducts";
import VendorEarnings from "./pages/vendor/VendorEarnings";
import VendorPayouts from "./pages/vendor/VendorPayouts";
import VendorSettings from "./pages/vendor/VendorSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/page/:slug" element={<StaticPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/live-tv" element={<LiveTV />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/subscription" element={<SubscriptionCheckout />} />
            <Route path="/become-vendor" element={<BecomeVendor />} />
            <Route path="/store/:id" element={<VendorStore />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/advertise" element={<Advertise />} />
            <Route path="/bdix-servers" element={<BdixServers />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/vendor" element={<VendorLayout />}>
              <Route index element={<VendorDashboard />} />
              <Route path="products" element={<VendorProducts />} />
              <Route path="earnings" element={<VendorEarnings />} />
              <Route path="payouts" element={<VendorPayouts />} />
              <Route path="settings" element={<VendorSettings />} />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="payment-methods" element={<AdminPaymentMethods />} />
              <Route path="requests" element={<AdminRequests />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="subscriptions" element={<AdminSubscriptions />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="servers" element={<AdminServers />} />
              <Route path="scraping" element={<AdminScraping />} />
              <Route path="ads" element={<AdminAds />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="activity" element={<AdminActivityLog />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="pages" element={<AdminPages />} />
              <Route path="menu-items" element={<AdminMenuItems />} />
              <Route path="contacts" element={<AdminContacts />} />
              <Route path="chat" element={<AdminChat />} />
              <Route path="live-tv" element={<AdminLiveTV />} />
              <Route path="vendors" element={<AdminVendors />} />
              <Route path="bdix-servers" element={<AdminBdixServers />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
