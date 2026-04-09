

# bKash Merchant API + Manual Payment Methods (bKash/Nagad Personal/Agent)

## Summary
দুটি কাজ: (1) bKash Merchant API integration — PayStation-এর মতো admin panel থেকে credentials দিলেই auto-activate, (2) Manual payment methods (বিকাশ Personal, নগদ Personal, বিকাশ Agent) admin panel থেকে add করার সিস্টেম উন্নত করা — checkout page-এ সুন্দরভাবে দেখানো (account number, instructions সহ)।

## bKash Merchant API Flow
```text
1. Admin → Settings → bKash config (App Key, App Secret, Username, Password, sandbox/live toggle)
2. Customer clicks "bKash দিয়ে পে করুন" → Edge Function creates payment via bKash Tokenized API
3. bKash returns payment URL → Customer redirected to bKash checkout
4. Payment complete → bKash callback → Edge function verifies & updates payment status
```

## Implementation

### 1. Admin Settings — bKash Config (site_settings table)
`AdminSettings.tsx`-এ নতুন section যোগ:
- `bkash_app_key` — App Key
- `bkash_app_secret` — App Secret  
- `bkash_username` — Username
- `bkash_password` — Password
- `bkash_sandbox` — Sandbox/Live toggle
- `bkash_enabled` — Enable/disable toggle

### 2. Edge Function: `bkash-initiate`
- Reads bKash credentials from `site_settings` (service role)
- Calls bKash Grant Token API → gets `id_token`
- Calls bKash Create Payment API with amount, invoice, callback URL
- Returns `bkashURL` to frontend for redirect

### 3. Edge Function: `bkash-callback`
- Receives `paymentID` and `status` from bKash
- Calls bKash Execute Payment API to confirm
- Updates `payments` table status
- Triggers existing vendor commission system
- Redirects user to dashboard

### 4. Checkout Page Enhancement
`CheckoutPage.tsx`-এ:
- bKash enabled হলে "bKash দিয়ে পে করুন" button দেখাবে (bKash pink color)
- PayStation enabled হলে PayStation button
- Manual payment methods-এর details (account number, instructions) সুন্দরভাবে দেখাবে — user copy করতে পারবে
- Payment method select করার radio button/card UI

### 5. Admin Payment Methods UI Enhancement
`AdminPaymentMethods.tsx` already exists with full CRUD — এটা ঠিক আছে। Admin এখান থেকেই বিকাশ Personal, নগদ Personal, বিকাশ Agent ইত্যাদি add করতে পারবে existing form দিয়ে (name, account number, account type, instructions)।

Checkout page-এ manual methods-এর জন্য একটা "Manual Payment" section যোগ করবো যেখানে:
- প্রতিটি active payment method card-এ দেখাবে
- Account number copy button সহ
- Payment instructions দেখাবে
- User "পেমেন্ট করেছি" button click করলে pending payment record তৈরি হবে

## Files

**Create:**
- `supabase/functions/bkash-initiate/index.ts` — bKash token + create payment
- `supabase/functions/bkash-callback/index.ts` — execute payment + verify

**Edit:**
- `src/pages/admin/AdminSettings.tsx` — add bKash config fields
- `src/pages/CheckoutPage.tsx` — bKash button + manual payment method details with copy
- `src/pages/SubscriptionCheckout.tsx` — same bKash flow

