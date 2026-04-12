

# সফটওয়্যার রিকোয়েস্ট — Limit + User Panel + Admin Bulk Actions

## কী করা হবে

### ১. Per-user রিকোয়েস্ট লিমিট (সর্বোচ্চ ৫টা pending)
- `SoftwareRequestForm.tsx`-এ submit করার আগে চেক — user-এর pending request count >= 5 হলে error দেখাবে
- "আপনার ৫টি pending রিকোয়েস্ট আছে, আগে cancel করুন বা fulfilled হওয়া পর্যন্ত অপেক্ষা করুন" মেসেজ

### ২. User Dashboard-এ "আমার রিকোয়েস্ট" ট্যাব
- `Dashboard.tsx`-এ নতুন tab: "রিকোয়েস্ট" (MessageSquarePlus icon)
- User-এর সব requests দেখাবে — title, status (pending/fulfilled/rejected), তারিখ
- Pending request-এ "Cancel" বাটন — ক্লিক করলে delete হবে
- Fulfilled request-এ product link দেখাবে (fulfilled_product_id join করে products table থেকে title + slug নিবে)
- Free/Paid badge দেখাবে (products.is_paid থেকে)

### ৩. Admin Requests — Bulk Actions
- `AdminRequests.tsx`-এ checkbox দিয়ে bulk select (AdminUsers-এর মতো pattern)
- Bulk actions: Bulk Fulfill, Bulk Reject, Bulk Delete
- Select All checkbox header-এ
- Selected count indicator

## ফাইল পরিবর্তন

| ফাইল | কী হবে |
|---|---|
| `src/components/SoftwareRequestForm.tsx` | Pending count check + limit enforcement |
| `src/pages/Dashboard.tsx` | নতুন "রিকোয়েস্ট" tab — view, cancel, fulfilled product link |
| `src/pages/admin/AdminRequests.tsx` | Checkbox bulk select + bulk actions toolbar |

## টেকনিক্যাল নোট
- DB migration লাগবে না — existing tables ও RLS policies যথেষ্ট
- User নিজের requests ALL access পায় (existing RLS: `auth.uid() = user_id`)
- Pending count query: `supabase.from("software_requests").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "pending")`
- Cancel = `supabase.from("software_requests").delete().eq("id", requestId)` (user's own RLS allows)
- Fulfilled product link: join `products` table via `fulfilled_product_id`

