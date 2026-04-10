

# BD IX Server List — ক্যাশিং, সেভ ফিচার ও সর্টিং

## সমস্যা
- প্রতিবার পেজ লোডে 250+ লিংক চেক হচ্ছে — bandwidth ও CPU খরচ
- সার্ভারগুলো random order-এ আছে, alphabetical না

## কী করব

### ১. localStorage ক্যাশিং (সবার জন্য)
- `useAccessibilityCheck` hook-এ চেকের রেজাল্ট `localStorage`-এ সেভ করব (key: `bdix-link-statuses`)
- ক্যাশ expiry: **24 ঘণ্টা** — 24 ঘণ্টার মধ্যে আবার পেজে আসলে আর চেক করবে না, ক্যাশ থেকে দেখাবে
- একটা "Re-check" বাটন থাকবে যাতে ইউজার চাইলে ম্যানুয়ালি আবার চেক করতে পারে (ক্যাশ ক্লিয়ার করে)

### ২. Logged-in ইউজারদের জন্য "Save Accessible Links"
- পেজে একটা বাটন: **"Save My Accessible Links"** — ক্লিক করলে যেসব লিংক green (online), সেগুলো ইউজারের প্রোফাইলে সেভ হবে
- নতুন টেবিল `user_saved_bdix_links` — `user_id`, `links` (text[]), `updated_at`
- Dashboard/Account পেজে সেভ করা লিংকগুলো দেখা যাবে
- সেভ করা থাকলে পরবর্তীতে সেই লিংকগুলো সরাসরি green দেখাবে, আবার চেক করবে না

### ৩. Alphanumeric সর্টিং
- সার্ভারগুলো `sort_order` দিয়ে সর্ট হচ্ছে — এটা বদলে `name` দিয়ে alphabetical (Bangla/English mixed) সর্ট করব
- Supabase query-তে `.order("name")` ব্যবহার করব

## ফাইল পরিবর্তন

| ফাইল | কাজ |
|---|---|
| `src/hooks/useAccessibilityCheck.ts` | localStorage ক্যাশিং যোগ, 24hr expiry, re-check ফাংশন expose |
| `src/pages/BdixServers.tsx` | Re-check বাটন, Save Accessible Links বাটন, name দিয়ে সর্ট |
| Migration SQL | `user_saved_bdix_links` টেবিল + RLS policies |

## টেকনিক্যাল বিবরণ

**localStorage ক্যাশ ফরম্যাট:**
```json
{
  "timestamp": 1712764800000,
  "statuses": { "http://1.2.3.4": "online", "http://5.6.7.8": "offline" }
}
```

**Hook API পরিবর্তন:**
```typescript
useAccessibilityCheck(links) → { statuses, recheck, isFromCache }
```

**নতুন টেবিল:**
```sql
CREATE TABLE user_saved_bdix_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  links text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
-- RLS: users can manage own row only
```

