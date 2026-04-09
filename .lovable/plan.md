

# PayStation Payment Gateway Integration

## Summary
PayStation API integrate করবো — admin panel থেকে শুধু Merchant ID ও Password দিলেই পুরো payment system auto-activate হবে। Customer checkout-এ PayStation hosted checkout page-এ redirect হবে, payment complete হলে callback দিয়ে order confirm হবে।

## PayStation API Flow
```text
1. Customer clicks "Pay" → Edge Function creates payment via PayStation API
2. PayStation returns payment_url → Customer redirected to PayStation checkout
3. Customer pays (bKash/Nagad/Card etc.) → PayStation sends callback to our edge function
4. Callback edge function verifies payment → Updates payment status in DB
5. Vendor earnings trigger fires automatically
```

## Implementation

### 1. Admin Settings — PayStation Config (site_settings table)
Add 3 new fields to `AdminSettings.tsx`:
- `paystation_merchant_id` — Merchant ID from PayStation
- `paystation_password` — Password from PayStation  
- `paystation_enabled` — Enable/disable toggle

Admin just fills in Merchant ID + Password → PayStation is active. No code changes needed after that.

### 2. Edge Function: `paystation-initiate` 
Creates a payment session with PayStation API:
- Reads `paystation_merchant_id` and `paystation_password` from `site_settings` table (using service role key)
- Calls `POST https://api.paystation.com.bd/initiate-payment` with:
  - `merchantId`, `password`, `invoice_number` (payment ID), `payment_amount`, `currency: BDT`
  - `cust_name`, `cust_phone`, `cust_email` from user profile
  - `callback_url` pointing to our callback edge function
  - `opt_a` with payment metadata (product_id, user_id, vendor_id)
- Returns `payment_url` to frontend

### 3. Edge Function: `paystation-callback`
Receives payment result from PayStation:
- URL params: `status`, `invoice_number`, `trx_id`
- If `status === "Successful"`:
  - Update `payments` row: `status = 'completed'`, `transaction_id = trx_id`
  - This triggers existing `handle_vendor_payment()` for vendor commission
- If failed/canceled: update payment status accordingly
- Redirect user to `/dashboard?payment=success` or `?payment=failed`

### 4. Edge Function: `paystation-verify` (optional but recommended)
Calls `POST https://api.paystation.com.bd/transaction-status` to double-check payment status server-side — prevents callback spoofing.

### 5. Update CheckoutPage.tsx
- Fetch `paystation_enabled` from `site_settings`
- If enabled: "Pay" button calls `paystation-initiate` edge function → redirects to `payment_url`
- If disabled: falls back to current manual payment flow
- Create payment record with `status: 'pending'` before redirect

### 6. Update SubscriptionCheckout.tsx
- Same PayStation flow for subscription purchases
- Pass `subscription plan` info in `checkout_items`

### 7. Secret: `SUPABASE_SERVICE_ROLE_KEY`
Edge functions need service role to read `site_settings` and update `payments`. Will need this secret added.

## Database Changes
No schema changes needed — we use existing `site_settings` for config and existing `payments` table. Just insert PayStation settings via admin UI.

## Files

**Create:**
- `supabase/functions/paystation-initiate/index.ts`
- `supabase/functions/paystation-callback/index.ts`

**Edit:**
- `src/pages/admin/AdminSettings.tsx` — add PayStation config fields
- `src/pages/CheckoutPage.tsx` — PayStation redirect flow
- `src/pages/SubscriptionCheckout.tsx` — PayStation redirect flow

## Security
- Merchant ID & Password stored in `site_settings` (admin-only access)
- Edge functions use service role to read credentials
- Callback validates payment via `transaction-status` API before confirming
- No secrets exposed to frontend

