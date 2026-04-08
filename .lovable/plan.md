

# Admin Panel Overhaul — Match Original FileServer Exactly

## Summary
The current admin panel has 7 pages with Bangla labels and a wrapper-based layout. The original has 23 pages with English labels, Outlet-based routing, a richer dashboard, and many more features. This plan brings them into full parity.

## Key Differences

```text
Original (fileserver.lovable.app)              Current Project
──────────────────────────                     ──────────────
Outlet-based routing (AdminLayout + <Outlet>)  Wrapper pattern (<AdminLayout>{children}</AdminLayout>)
23 admin pages                                 7 admin pages
English labels in sidebar                      Bangla labels
Two sidebar groups: "Admin Panel" + "CMS"      Single group "অ্যাডমিন"
Header: "Admin Panel" title, email, View Site, Sign Out buttons
Rich dashboard: 7 stat cards, recent uploads table, top downloaded, activity log
Full-featured product form (screenshots, download links, tags, bulk actions)
```

## Architecture Change

**1. Convert AdminLayout to Outlet pattern**
- Move `AdminLayout` from `src/components/admin/AdminLayout.tsx` to `src/pages/admin/AdminLayout.tsx`
- Replace `children` prop with `<Outlet />` from react-router-dom
- Update sidebar links to match original exactly (English labels, two groups)
- Header: show user email, "View Site" button, "Sign Out" button

**2. Update App.tsx routing**
- Replace individual admin routes with nested route structure:
```
<Route path="/admin" element={<AdminLayout />}>
  <Route index element={<AdminDashboard />} />
  <Route path="products" element={<AdminProducts />} />
  ...21 more child routes
</Route>
```

## Pages to Create/Rewrite (16 new + 7 rewritten)

**Rewrite existing 7 pages** (remove `<AdminLayout>` wrapper, copy logic from original):
- `AdminDashboard.tsx` — 7 stat cards, recent uploads table, top downloaded, quick actions, activity log
- `AdminProducts.tsx` — Full product form with screenshots, download links, bulk actions, filters, sorting
- `AdminCategories.tsx` — Keep current logic, remove `<AdminLayout>` wrapper
- `AdminUsers.tsx` — Remove wrapper
- `AdminServers.tsx` — Remove wrapper
- `AdminMessages.tsx` — Rename to `AdminContacts.tsx`, copy original contact messages UI
- `AdminSettings.tsx` — Replace with original key-value settings form

**Create 16 new pages** (copy from original project):
- `AdminOrders.tsx` — payments CRUD with status filter, approve, view details
- `AdminPaymentMethods.tsx` — payment methods CRUD (bKash, bank, etc.)
- `AdminRequests.tsx` — software requests with convert-to-product flow
- `AdminReviews.tsx` — review moderation with approve/reject tabs
- `AdminSubscriptions.tsx` — subscription plan CRUD
- `AdminCoupons.tsx` — coupon CRUD with discount type/expiry
- `AdminScraping.tsx` — scraping tool (single URL + bulk import + queue)
- `AdminAds.tsx` — ad management with placements, types, scheduling
- `AdminAnalytics.tsx` — charts (recharts) for daily downloads, top products/categories
- `AdminActivityLog.tsx` — activity log table
- `AdminPages.tsx` — CMS pages CRUD
- `AdminMenuItems.tsx` — menu items CRUD
- `AdminBlog.tsx` — blog post CRUD
- `AdminChat.tsx` — live chat with realtime
- `AdminLiveTV.tsx` — live TV channel CRUD
- (AdminContacts already counted above)

## Database Considerations
- Some original pages reference tables that may not exist in current schema (e.g., `scrape_queue`, `payment_methods`, `user_subscriptions`). The pages will be created as-is; queries will gracefully return empty until those tables are added.
- `AdminAnalytics` uses `recharts` — need to install the package.

## File Changes Summary
- Delete: `src/components/admin/AdminLayout.tsx`
- Create: `src/pages/admin/AdminLayout.tsx` (new Outlet-based layout)
- Rewrite: 7 existing admin pages (remove wrapper, update to match original)
- Create: 15 new admin page files
- Update: `src/App.tsx` (nested routing)
- Install: `recharts` package (for analytics charts)

