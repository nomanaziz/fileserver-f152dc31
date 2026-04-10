

# Recharge Server Gateway + Manual Payment + Secure Downloads

## ৩টা কাজ

### ১. Recharge Server Payment Gateway
- Admin Settings-এ **Recharge Server** সেকশন যোগ — শুধু `recharge_server_brand_key` ফিল্ড + enable toggle
- Edge function `recharge-server-initiate` — brand key দিয়ে rechargeserver.com API কল করে payment URL পাবে
- Edge function `recharge-server-callback` — payment verify করে payments টেবিল আপডেট + subscription activate
- Checkout ও SubscriptionCheckout পেজে Recharge Server বাটন যোগ

### ২. Manual Payment (Transaction ID + Sender Number)
- Checkout-এ manual method সিলেক্ট করলে **sender_number** ও **transaction_id** ইনপুট ফিল্ড দেখাবে
- payments টেবিলে এই দুইটা gateway_response JSON-এ সেভ হবে
- AdminOrders পেজে sender_number ও transaction_id দেখাবে, admin "Approve" করলে status → completed হবে এবং ইউজার ডাউনলোড অ্যাক্সেস পাবে

### ৩. Secure Download Links (User-Locked)
- Edge function `secure-download` তৈরি — user auth চেক করে, payment/subscription verify করে, তারপর signed/proxied URL দেবে
- ProductDetail-এ download link সরাসরি URL না দিয়ে `secure-download?product_id=X&download_id=Y` কল করবে
- এই function JWT থেকে user_id নিয়ে verify করবে — অন্য কেউ লিংক শেয়ার করলেও ডাউনলোড হবে না

## DB পরিবর্তন
কোনো schema change লাগবে না — `payments.gateway_response` (jsonb) তে sender_number/transaction_id রাখব।

## ফাইল পরিবর্তন

| ফাইল | কাজ |
|---|---|
| `src/pages/admin/AdminSettings.tsx` | Recharge Server সেকশন + brand_key ফিল্ড + toggle |
| `supabase/functions/recharge-server-initiate/index.ts` | **নতুন** — Payment initiation |
| `supabase/functions/recharge-server-callback/index.ts` | **নতুন** — Payment callback/verify |
| `src/pages/CheckoutPage.tsx` | Recharge Server বাটন + manual payment-এ sender_number/transaction_id ইনপুট |
| `src/pages/SubscriptionCheckout.tsx` | Recharge Server বাটন + manual payment ইনপুট |
| `src/pages/admin/AdminOrders.tsx` | Transaction details দেখানো + approve flow |
| `supabase/functions/secure-download/index.ts` | **নতুন** — Auth-locked download proxy |
| `src/pages/ProductDetail.tsx` | Download link → secure-download edge function কল |

## Recharge Server API ইন্টিগ্রেশন ফ্লো
```text
User → Checkout → recharge-server-initiate (brand_key) → rechargeserver.com API
                                                              ↓
User ← redirect ← payment_url ←──────────────────────────────┘
                                                              
rechargeserver.com → recharge-server-callback → verify → update payment → redirect user
```

## Secure Download ফ্লো
```text
User clicks download → supabase.functions.invoke("secure-download", { product_id, download_id })
                            ↓
                      Verify JWT → Check payment/subscription → Return file URL or 302 redirect
                            ↓
                      Unauthorized? → 403 "অ্যাক্সেস নেই"
```

> **Note:** Recharge Server API-র exact endpoint/format জানা দরকার — আমি paystation-এর pattern ফলো করে `rechargeserver.com` API কল করব। আপনার API docs-এর base URL ও request format আলাদা হলে জানাবেন।

