

# Add Paid Products, Subscription Plans & Purchase System

## Summary
Test data হিসাবে কিছু paid product ও 3টা subscription plan insert করবো, এবং original project থেকে purchase/subscription system এর সব logic port করবো।

## Database Changes

### 1. Add `status` and `expires_at` columns to `subscriptions` table
Original project uses `status` (active/expired/pending) and `expires_at` instead of `is_active` and `ends_at`. Current table has `is_active` + `ends_at`.
- Add `status text default 'active'` column
- Add `gateway_response jsonb` column to `payments` table (original uses it to track payment type)

### 2. Insert test data (via insert tool)
**3 Subscription Plans:**
- Basic: ৳99/30 days, 3 downloads/day, 30 total
- Premium: ৳199/30 days, 10 downloads/day, 100 total  
- Lifetime: ৳999/36500 days, 50 downloads/day, 999 total

**5 Paid Products** (using existing categories):
- Kaspersky Total Security — ৳350, Software
- FL Studio 24 — ৳500, Software
- JEEMAIN Prep Pro (Android) — ৳150, Android
- GTA V Premium — ৳450, Games
- Adobe Premiere Pro — ৳600, Software

## New Files (from original project)

### 3. `src/hooks/useSubscription.ts`
- `useActiveSubscription()` — fetches active subscription from `subscriptions` table (adapted: uses `ends_at` instead of `expires_at`, `is_active` instead of `status`)
- `useTodayDownloadCount()` — counts today's downloads from `download_history`
- `useCanDownloadWithSubscription()` — checks if user can download based on plan limits

### 4. `src/hooks/usePurchases.ts`
- `useHasPurchased(productId)` — checks if user has completed payment for a product

### 5. `src/pages/CheckoutPage.tsx`
- Cart checkout page with order summary, payment methods display, and payment initiation

### 6. `src/pages/SubscriptionCheckout.tsx`
- Subscription checkout page — shows plan details and payment button

### 7. `src/pages/dashboard/PurchasesTab.tsx`
- User's purchase history table

### 8. `src/pages/dashboard/SubscriptionTab.tsx`
- Active subscription status, usage progress bars, history

## Updated Files

### 9. Update `src/pages/Pricing.tsx`
- Replace with original's `PricingPage.tsx` — shows active subscription banner, popular plan highlight, download limits, subscribe buttons that navigate to `/checkout/subscription?plan=ID`

### 10. Update `src/pages/ProductDetail.tsx`
- Add purchase/subscription logic from original:
  - Check `hasPurchased` and `canDownloadWithSubscription`
  - Show download links only if free OR purchased OR has active subscription with quota
  - Show "Purchase Required" section with Buy Now / Add to Cart / Subscribe buttons for paid products

### 11. Update `src/pages/Dashboard.tsx`
- Add Purchases and Subscription tabs (like original project)

### 12. Update `src/App.tsx`
- Add routes: `/checkout`, `/checkout/subscription`
- Add dashboard sub-routes if needed

## Files Changed
- **Migration**: Add `status` to `subscriptions`, `gateway_response` to `payments`
- **Insert**: 3 subscription plans + 5 paid products
- **Create**: `useSubscription.ts`, `usePurchases.ts`, `CheckoutPage.tsx`, `SubscriptionCheckout.tsx`, `PurchasesTab.tsx`, `SubscriptionTab.tsx`
- **Edit**: `Pricing.tsx`, `ProductDetail.tsx`, `Dashboard.tsx`, `App.tsx`

