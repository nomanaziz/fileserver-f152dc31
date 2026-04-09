

# Multi-Vendor Marketplace System

## Summary
যে কোনো registered user তার নিজের product (software, theme, plugin, source code, image, game) upload ও sell করতে পারবে। প্রতিটা sale থেকে 20% platform commission কেটে বাকি 80% vendor-এর balance-এ জমা হবে। Payment method সব platform-এর existing গুলোই use হবে।

## Database Changes

### 1. New table: `vendor_profiles`
Vendor-specific info linked to `auth.users`:
- `id` (uuid, PK, references auth.users)
- `store_name` (text) — vendor-এর দোকানের নাম
- `store_description` (text)
- `logo_url` (text)
- `is_verified` (boolean, default false) — admin verify করবে
- `is_active` (boolean, default true)
- `commission_rate` (numeric, default 20) — platform commission %
- `total_earnings` (numeric, default 0)
- `available_balance` (numeric, default 0)
- `created_at`, `updated_at`

RLS: Users can read/update own. Admins can manage all. Anyone can view active vendors.

### 2. New table: `vendor_payouts`
Track withdrawal requests:
- `id`, `vendor_id` (uuid), `amount` (numeric)
- `payment_method` (text), `account_details` (jsonb)
- `status` (text: pending/approved/paid/rejected)
- `admin_note` (text), `processed_at` (timestamptz)
- `created_at`

RLS: Vendors see own. Admins manage all.

### 3. New table: `vendor_earnings`
Per-sale earnings log:
- `id`, `vendor_id`, `payment_id`, `product_id`
- `sale_amount` (numeric), `commission_amount` (numeric), `vendor_amount` (numeric)
- `created_at`

RLS: Vendors see own. Admins see all.

### 4. Alter `products` table
- Add `vendor_id uuid references auth.users(id)` — who uploaded it
- Add `is_vendor_product boolean default false`
- Add `vendor_status text default 'pending'` — pending/approved/rejected (admin moderation)
- Update RLS: vendors can INSERT/UPDATE/DELETE own products (where `vendor_id = auth.uid()`)

### 5. Update `payments` table
- Add `vendor_id uuid` — to quickly find vendor sales

### 6. Database trigger: `on_payment_completed`
When a payment with `status='completed'` is inserted for a vendor product:
- Calculate 20% commission, 80% vendor share
- Insert into `vendor_earnings`
- Update `vendor_profiles.total_earnings` and `available_balance`

## Frontend Changes

### 7. Vendor Registration Page (`/become-vendor`)
- Simple form: store name, description, logo
- Creates `vendor_profiles` entry
- Shows "pending verification" status

### 8. Vendor Dashboard (`/vendor`)
- **Overview tab**: total earnings, available balance, total products, total sales
- **Products tab**: list vendor's own products, add/edit/delete with full form (reuse AdminProducts form pattern but scoped to vendor)
- **Earnings tab**: sales history with commission breakdown
- **Payouts tab**: request withdrawal, payout history
- **Settings tab**: edit store name, description, logo

### 9. Vendor Product Upload Form
- Same fields as AdminProducts but:
  - No `is_featured`, `is_trending`, `is_verified` toggles (admin-only)
  - Status starts as `pending` (needs admin approval)
  - `vendor_id` auto-set to current user
  - Vendor can add download links using existing download servers

### 10. Vendor Store Page (`/vendor/:id`)
- Public page showing vendor's approved products
- Store name, description, logo
- Product grid

### 11. Update ProductDetail
- Show vendor info (store name, link to vendor page)
- "Sold by: [Vendor Name]" badge

### 12. Admin: Vendor Management (`/admin/vendors`)
- List all vendors, verify/suspend
- View vendor products, approve/reject
- Process payout requests
- Adjust commission rate per vendor

### 13. Update CheckoutPage
- After payment completed, trigger vendor earnings calculation
- Show vendor name in order summary

### 14. App.tsx Routes
- `/become-vendor` — registration
- `/vendor` — vendor dashboard
- `/vendor/:id` — public store page
- `/admin/vendors` — admin vendor management

## Commission Logic
```text
Sale Price: ৳500
Platform Commission (20%): ৳100
Vendor Earnings (80%): ৳400

vendor_earnings record:
  sale_amount: 500
  commission_amount: 100
  vendor_amount: 400

vendor_profiles update:
  total_earnings += 400
  available_balance += 400

On payout (admin approves):
  available_balance -= payout_amount
```

## Files

**Create:**
- Migration SQL (3 new tables + products/payments alterations + trigger)
- `src/pages/BecomeVendor.tsx`
- `src/pages/vendor/VendorDashboard.tsx`
- `src/pages/vendor/VendorProducts.tsx`
- `src/pages/vendor/VendorEarnings.tsx`
- `src/pages/vendor/VendorPayouts.tsx`
- `src/pages/vendor/VendorSettings.tsx`
- `src/pages/VendorStore.tsx` (public store page)
- `src/pages/admin/AdminVendors.tsx`
- `src/hooks/useVendor.ts`

**Edit:**
- `src/App.tsx` — add routes
- `src/pages/ProductDetail.tsx` — show vendor info
- `src/pages/CheckoutPage.tsx` — vendor earnings on purchase
- `src/pages/admin/AdminLayout.tsx` — add Vendors sidebar link
- `src/components/layout/Header.tsx` or `Navbar.tsx` — add "Sell" / "Become Vendor" link

