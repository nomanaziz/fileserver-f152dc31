

# ডামি বিজ্ঞাপন প্লেসমেন্ট + Footer পুনরুদ্ধার

## Summary
দুটি কাজ: (1) সাইটের বিভিন্ন পেজে ৪টি ad placement-এ ডামি বিজ্ঞাপন বক্স দেখানো — সাইজ, মূল্য, মেয়াদ সহ, ক্লিক করলে `/advertise` পেজে যাবে। (2) Footer-এ হারিয়ে যাওয়া hardcoded default links ফিরিয়ে আনা — DB menu items না থাকলেও fallback sections দেখাবে।

## 1. AdPlaceholder Component তৈরি

`src/components/AdPlaceholder.tsx` — reusable component:
- Props: `placement` (header-banner | sidebar | in-content | before-download)
- Placement অনুযায়ী সাইজ, মূল্য দেখাবে (Advertise.tsx থেকে same data)
- ডিজাইন: dashed border, muted background, কোণায় ছোট "বিজ্ঞাপন" label
- মাঝে: সাইজ (728×90), মূল্য (৳৫,০০০/মাস), মেয়াদ (৩০ দিন)
- ক্লিক করলে `/advertise` পেজে redirect হবে with pre-selected placement
- "এখানে বিজ্ঞাপন দিন" subtle CTA

## 2. পেজে Ad Placement বসানো

**Index.tsx:**
- Hero section-এর নিচে: `header-banner` (728×90)
- Sidebar-এ SoftwareRequestForm-এর পরে: `sidebar` (300×250)

**CategoryPage.tsx:**
- Sidebar-এর নিচে: `sidebar` (300×250)

**ProductDetail.tsx:**
- Download section-এর আগে: `before-download` (728×90)
- Content-এর মাঝে: `in-content` (468×60)

## 3. Footer — Default Links পুনরুদ্ধার

Footer.tsx update — DB items না থাকলে fallback hardcoded sections দেখাবে:

**Quick Links:** Home, Categories, Pricing, Live TV, Advertise
**Legal:** Privacy Policy, Terms of Service, DMCA
**Social:** Facebook, YouTube, Telegram (already আছে)

DB থেকে items পাওয়া গেলে সেগুলো দেখাবে, না পাওয়া গেলে fallback sections দেখাবে। দুটোই কাজ করবে।

## Files

**Create:**
- `src/components/AdPlaceholder.tsx` — reusable dummy ad component

**Edit:**
- `src/pages/Index.tsx` — header-banner + sidebar ad placement
- `src/pages/CategoryPage.tsx` — sidebar ad placement
- `src/pages/ProductDetail.tsx` — before-download + in-content ad
- `src/components/layout/Footer.tsx` — fallback hardcoded links when no DB items

