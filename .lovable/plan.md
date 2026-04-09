

# Vendor Level/Tier System with Dynamic Commission

## Summary
Vendor-দের জন্য Bronze/Silver/Gold tier system তৈরি করবো। বেশি বিক্রি = কম কমিশন। নতুন vendor 20%, মাঝারি 15%, টপ seller 10%। Admin চাইলে tier-এর নাম, threshold, commission rate modify করতে পারবে।

## Database Changes

### 1. New table: `vendor_tiers`
Admin-configurable tier definitions:
- `id` (uuid, PK)
- `name` (text) — "Bronze", "Silver", "Gold"
- `slug` (text) — "bronze", "silver", "gold"
- `commission_rate` (numeric) — 20, 15, 10
- `min_sales_count` (integer) — threshold to reach this tier (0, 20, 50)
- `min_total_earnings` (numeric) — alternative threshold (0, 5000, 20000)
- `color` (text) — badge color (#CD7F32, #C0C0C0, #FFD700)
- `sort_order` (integer)
- `is_active` (boolean, default true)
- `created_at`, `updated_at`

RLS: Admin can manage. Anyone can view active tiers.

### 2. Alter `vendor_profiles`
- Add `tier_id uuid references vendor_tiers(id)` — current tier
- Keep existing `commission_rate` as the effective rate (synced from tier or overridden by admin)

### 3. Insert default tiers
| Tier | Commission | Min Sales | Min Earnings |
|------|-----------|-----------|-------------|
| Bronze | 20% | 0 | ৳0 |
| Silver | 15% | 20 sales | ৳5,000 |
| Gold | 10% | 50 sales | ৳20,000 |

### 4. Update `handle_vendor_payment()` trigger
After updating vendor balance, check if vendor qualifies for a higher tier based on total sales count and earnings. If yes, auto-upgrade tier and update `commission_rate`.

## Frontend Changes

### 5. Admin: Vendor Tiers tab in AdminVendors
- New "টিয়ার" tab showing all tiers in a table
- Edit tier: name, commission rate, min_sales_count, min_total_earnings, color
- Add/delete tiers
- Per-vendor: show current tier badge, option to manually override tier

### 6. Vendor Dashboard
- Show current tier badge (Bronze/Silver/Gold) with color
- Show progress to next tier (e.g., "আরো 12টি বিক্রি করলে Silver হবেন")
- Commission rate from current tier

### 7. Admin Vendors list
- Show tier badge next to each vendor
- Manual tier override dropdown

## Files

**Migration**: New `vendor_tiers` table + `tier_id` on `vendor_profiles` + update trigger + insert default tiers

**Edit**:
- `src/pages/admin/AdminVendors.tsx` — add Tiers tab, show tier badges, tier override
- `src/pages/vendor/VendorDashboard.tsx` — show tier badge + progress to next tier
- `src/hooks/useVendor.ts` — add `useVendorTiers()` hook

