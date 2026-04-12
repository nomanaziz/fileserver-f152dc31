

# ডাউনলোড লিংক ফিডব্যাক সিস্টেম — সার্ভার হেলথ ট্র্যাকিং

## কী করা হবে

ডাউনলোড লিংকের পাশে "কাজ করেছে ✅" / "কাজ করেনি ❌" বাটন থাকবে। User ফিডব্যাক দিলে IP সহ log হবে। যে সার্ভারে বেশি মানুষ সফল, সেটা উপরে আসবে। Admin dashboard-এ সার্ভার health দেখতে পারবে।

## DB Migration — নতুন table

```text
download_feedback
├── id (uuid PK)
├── download_id (uuid → product_downloads.id)
├── product_id (uuid → products.id)
├── user_id (uuid, nullable — logged in হলে)
├── ip_address (text)
├── is_working (boolean) — true = কাজ করেছে, false = করেনি
├── created_at (timestamptz)
```

RLS: Anyone can INSERT (anonymous feedback allowed), authenticated users can DELETE own feedback (reset), admin ALL access.

Unique constraint: `(download_id, ip_address)` — একই IP থেকে একই লিংকে একবারই ফিডব্যাক।

## পরিবর্তন

### 1. ProductDetail.tsx — ফিডব্যাক UI
- প্রতিটা download link-এর পাশে 👍/👎 বাটন
- ক্লিক করলে `download_feedback` table-এ insert (IP ক্লায়েন্ট-সাইড থেকে fetch)
- User চাইলে reset (নিজের feedback delete)
- Success rate % দেখাবে (যেমন "৮৫% সফল")
- Download links success rate অনুযায়ী sorted — বেশি success উপরে

### 2. Edge Function — `download-feedback`
- IP address সার্ভার-সাইডে capture করবে (req headers থেকে)
- Upsert logic: একই IP + download_id থাকলে update, না থাকলে insert
- Rate limiting: একই IP থেকে ১ মিনিটে max ১০ টা feedback

### 3. Admin Dashboard — নতুন section `AdminProducts.tsx` বা আলাদা page
- প্রতিটা সার্ভারের health stats: total votes, success %, fail %
- ৭০%+ fail হলে red warning দেখাবে
- সার্ভার-ভিত্তিক aggregate view

### 4. Auto-sorting logic
- Download links query-তে success_rate calculated field যোগ
- `download_feedback` থেকে aggregate করে sort: বেশি success rate = উপরে
- কোনো feedback না থাকলে middle position

## ফাইলসমূহ

| ফাইল | কী হবে |
|---|---|
| **Migration** | `download_feedback` table + RLS + unique constraint |
| `supabase/functions/download-feedback/index.ts` | নতুন — IP capture + upsert feedback |
| `src/pages/ProductDetail.tsx` | ফিডব্যাক বাটন, success rate, auto-sort |
| `src/pages/admin/AdminProducts.tsx` | সার্ভার health stats section |

## টেকনিক্যাল নোট

- IP address edge function-এ `req.headers.get("x-forwarded-for")` দিয়ে নেওয়া হবে — client-side API call করে IP নেওয়া হবে না (privacy + reliability)
- Success rate calculation: `COUNT(is_working=true) / COUNT(*) * 100`
- Auto-sort: downloads query-তে left join করে success_rate descending sort

