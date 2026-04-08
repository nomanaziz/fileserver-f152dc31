

# Fix All Admin Pages to Match Original FileServer Project

I've thoroughly compared every admin page in your current project with the original [File Server](/projects/5f93cb8d-8c3f-4357-a813-d949c7533a54) project. Here's what needs to be fixed:

## Database Schema Changes Required

The original project uses several columns and tables that don't exist in the current database. We need migrations first:

**1. Products table — add missing columns:**
- `image_url` (text) — main product image
- `thumbnail_icon` (text) — small icon
- `tags` (text[]) — tag array
- `is_verified` (boolean, default false)
- `is_active` (boolean, default true)
- `is_trending` (boolean, default false)
- `file_type` (text) — Software, APK, Game, Movie, Source Code
- `release_date` (text)
- `developer` (text)
- `discount_price` (numeric)
- `affiliate_link` (text)
- `license_type` (text, default 'free')
- `source_url` (text)
- `video_url`, `video_duration` (text) — for video content
- `git_url`, `programming_language` (text) — for source code content

**2. Activity logs table — add missing columns:**
- `target_type` (text)
- `target_id` (text)

**3. Download servers table — add missing column:**
- `server_type` (text, default 'local')

**4. Coupons table — add missing columns:**
- `discount_type` (text, default 'percent') — percent or fixed
- `discount_value` (numeric, default 10) — replaces `discount_percent`

**5. Ads table — add missing columns:**
- `placement` (text) — header, sidebar, in_content, footer, before_download, popup
- `ad_type` (text) — html, image, video
- `content` (text) — HTML/script or image/video URL
- `device_target` (text, default 'all')
- `priority` (integer, default 0)
- `starts_at`, `ends_at` (timestamptz)
- `impressions`, `clicks` (integer, default 0)

**6. Subscription plans table — add missing columns:**
- `daily_download_limit` (integer, default 5)
- `total_download_limit` (integer, default 50)

**7. Create new `payment_methods` table:**
- id, name, slug, logo_url, color, is_active, sort_order
- account_type, account_number, bank_name, branch_name, routing_number, instructions

**8. Create new `scrape_queue` table:**
- id, url, source_site, content_type, status (pending/processing/completed/failed/duplicate), error_message, created_at

**9. Create new `user_subscriptions` table:**
- id, user_id, plan_id, status (active/expired/cancelled), starts_at, ends_at, created_at

## Admin Pages to Rewrite (copy logic from original)

Each page below will be replaced with the exact code from the original project, adapted for the current toast import (`sonner` vs `@/hooks/use-toast`):

**1. AdminProducts.tsx** (biggest change — 561 lines)
- Add: bulk select/delete/publish, search + category/status/paid filters, sortable columns
- Add: full product form with image_url, thumbnail_icon, tags, developer, release_date, file_type, license_type, affiliate_link, discount_price, is_verified, is_active, is_featured, is_trending toggles
- Add: gallery/screenshots management, download links per server
- Add: activity logging on create/update/delete

**2. AdminCategories.tsx** — Use separate state vars instead of single `editing` object; show parent→child tree with indent

**3. AdminServers.tsx** — Add `server_type` field (local/cdn/backup/live_tv)

**4. AdminPaymentMethods.tsx** — Full CRUD with bKash/Nagad/Bank fields, toggle active, color picker, account details

**5. AdminUsers.tsx** — Add search/filter, role change dropdown, download/purchase counts, user detail dialog with history, create user via edge function

**6. AdminSubscriptions.tsx** — Add daily/total download limits, subscriber counts per plan

**7. AdminCoupons.tsx** — Add discount_type (percent/fixed), use Switch for active toggle

**8. AdminScraping.tsx** — 3-tab layout (Single URL / Bulk Import / Queue), calls edge functions for scraping

**9. AdminAds.tsx** — Add placement, ad_type, device_target, scheduling (starts_at/ends_at), impressions/clicks display

**10. AdminAnalytics.tsx** — Daily downloads chart (last 30 days from download_history), top products table, top categories by downloads

**11. AdminDashboard.tsx** — 4 main stat cards + 3 secondary cards (pending reviews, active subs, pending orders), recent uploads table, top downloaded list, recent activity log

**12. AdminOrders.tsx** — Full CRUD with status filter, approve button, view details dialog, create order form

**13. AdminSettings.tsx** — Key-value settings form from `site_settings` table with labeled fields

**14. AdminLayout.tsx** — Minor sidebar link fixes (Activity Log path `/admin/activity`, Menu Items path `/admin/menu-items`, Messages → Contacts path `/admin/contacts`)

## Route Fixes in App.tsx
- `logs` → `activity`
- `menu` → `menu-items`
- `messages` → `contacts`
- Add missing import for AdminContacts (rename AdminMessages)

## Files Changed
- **1 migration** — all schema changes in a single SQL migration
- **14 admin page rewrites** — copy exact logic from original, adapt imports
- **App.tsx** — fix 3 route paths
- **AdminLayout.tsx** — fix 3 sidebar URLs

## Edge Functions Needed (for full functionality)
- `create-user` — admin creates users via Supabase Admin API
- `scrape-product` — single URL scraping
- `scrape-bulk` — batch process scrape queue

These will be created as stub edge functions that can be extended later.

