

## File Server — Full Supabase Rebuild

### Phase 1: Database Setup (Supabase Migrations)

Create all tables in the new Supabase project, matching the old schema but cleaner:

**Core Tables:**
- `profiles` — user profiles (id refs auth.users, display_name, avatar_url, phone, is_active)
- `user_roles` — role-based access (user_id, role enum: admin/moderator/user)
- `categories` — fully dynamic (name, slug, description, icon, parent_id for nesting, sort_order)
- `products` — main content (title, slug, description, category_id FK, content_type, os_type, version, file_size, price, screenshots[], is_featured, is_paid, status, download_count, etc.)
- `download_servers` — server list (name, label, base_url, is_active, priority)
- `product_downloads` — download links per product per server

**User-facing Tables:**
- `cart_items`, `favorites`, `reviews`, `payments`, `download_history`
- `software_requests` — user software request form
- `subscriptions` / `subscription_plans` — pricing tiers

**Content Tables:**
- `blog_posts` — blog system
- `pages` — static CMS pages
- `menu_items` — dynamic navigation
- `contact_messages` — contact form submissions

**Admin Tables:**
- `ads` — ad management
- `coupons` — discount codes
- `live_channels` — live TV streams
- `site_settings` — key/value site config
- `activity_logs` — admin action tracking
- `chat_conversations` / `chat_messages` — live chat

**RLS Policies:** Public read for products/categories/blog/pages. Authenticated write for user-specific data. Admin-only for management tables using `has_role()` security definer function.

**Triggers:** Auto-create profile on signup. Auto-update `updated_at` timestamps.

---

### Phase 2: Auth System
- Supabase Auth with email/password signup & login
- `AuthContext` provider wrapping the app
- Login, Register, Forgot Password, Reset Password pages
- Protected routes for dashboard & admin
- Admin guard using `user_roles` table

---

### Phase 3: Core UI — Layout & Navigation
- **Layout component** with dynamic header (menu_items from DB), footer
- **Responsive sidebar** on category pages with DB-driven category list
- **Search bar** in header — searches products by title/description
- Remove all hardcoded category arrays — everything from Supabase

---

### Phase 4: Public Pages
- **Homepage** — hero/search, trending products, latest uploads, popular sidebar (all from DB)
- **Category page** — products filtered by category_id, with sidebar category list
- **Product detail** — full info, screenshots gallery, download links (from product_downloads + servers), reviews
- **Search page** — query products with category filter dropdown
- **Blog list & post** — from blog_posts table
- **Static pages** — rendered from pages table by slug
- **About, Contact, Pricing** pages
- **Live TV** — stream channels from live_channels table
- **Cart, Checkout, Payment status** pages

---

### Phase 5: User Dashboard
- Profile tab (edit display_name, avatar, phone)
- Favorites tab
- Downloads history tab
- Purchases tab
- Subscription tab
- Software requests tab

---

### Phase 6: Full Admin Panel
- **Admin layout** with sidebar navigation
- **Dashboard** — stats (total products, users, downloads, revenue)
- **Products CRUD** — create/edit/delete with category dropdown, file details, screenshots
- **Categories CRUD** — add/edit/delete, nested parent support
- **Users management** — view profiles, toggle active, assign roles
- **Orders/Payments** — view payment records
- **Download Servers** — manage servers
- **Reviews moderation** — approve/reject
- **Blog CRUD** — create/edit/publish posts
- **Pages CMS** — manage static pages
- **Menu Items** — manage navigation links
- **Ads management** — create/toggle ads
- **Coupons** — manage discount codes
- **Subscriptions** — manage plans
- **Software Requests** — view user requests
- **Live TV** — manage channels
- **Contact Messages** — view inbox
- **Chat** — admin chat interface
- **Activity Log** — view admin actions
- **Site Settings** — key/value configuration
- **Analytics** — basic stats page

---

### Phase 7: Hooks & Services
- Reusable hooks: `useProducts`, `useCategories`, `useCart`, `useFavorites`, `useReviews`, `useSubscription`, `usePurchases`
- All use `@tanstack/react-query` for caching and optimistic updates
- Supabase client from `@/integrations/supabase/client`

---

### Design Approach
- Keep the existing dark-capable design system from the old project
- Clean, modern UI with the card-based product layout
- Responsive — mobile-friendly with collapsible sidebar
- Category filtering via sidebar list + dropdown on mobile
- No tag clouds or label clouds anywhere

This is a large rebuild that will be done incrementally, starting with database → auth → core pages → admin panel.

