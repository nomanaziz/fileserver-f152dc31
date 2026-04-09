

# বিজ্ঞাপন ব্যবস্থাপনা সম্পূর্ণ উন্নতকরণ

## সমস্যা
1. Google Ads পাবলিক পেজে আছে — এটা admin-only হওয়া উচিত
2. Ad slot-এ কোন limit নেই
3. AdPlaceholder শুধু placeholder দেখায়, real ad দেখায় না
4. Ad image upload নেই
5. Advertiser নিজে ad manage করতে পারে না

## পরিকল্পনা

### ১. DB — `ads` টেবিলে নতুন কলাম + `ad_slots` কনফিগ টেবিল (Migration)

**নতুন টেবিল `ad_slots`** — প্রতিটি placement-এর limit ও pricing সংরক্ষণ:
```
ad_slots: id, placement (unique), max_ads, price_per_month, size_label, description, is_active
```
Default data insert:
- `header` → max 5, ৳5000/মাস
- `sidebar` → max 10, ৳3000/মাস
- `in_content` → max 15, ৳2000/মাস
- `before_download` → max 10, ৳4000/মাস
- `footer` → max 5, ৳1500/মাস

**`ads` টেবিলে নতুন কলাম:**
- `advertiser_email` (text, nullable) — কে দিয়েছে
- `advertiser_name` (text, nullable)
- `ad_source` (text, default 'custom') — 'custom' বা 'google'

**Storage bucket:** `ad-images` — বিজ্ঞাপনের ছবি আপলোডের জন্য

### ২. AdPlaceholder → AdSlot কম্পোনেন্ট রিফ্যাক্টর

`src/components/AdSlot.tsx` — নতুন কম্পোনেন্ট যা:
- DB থেকে active ads fetch করে (placement + is_active + date range চেক)
- যদি active ad পাওয়া যায় → real ad দেখায় (image/html/video)
- যদি slot পূর্ণ না হয় এবং ad না থাকে → বিজ্ঞাপন placeholder দেখায় ("এখানে বিজ্ঞাপন দিন →")
- যদি slot পূর্ণ → "আপাতত স্লট পূর্ণ। পরবর্তীতে আবেদন করুন" মেসেজ দেখায়
- Click tracking: impression count বাড়ায়, link click-এ click count বাড়ায়
- Random rotation: একাধিক ad থাকলে random/priority অনুযায়ী একটা দেখায়

### ৩. Advertise পেজ আপডেট

- **Google Ads অপশন সরিয়ে ফেলা**
- প্রতিটি placement card-এ available slot count দেখানো (যেমন "৩/৫ স্লট খালি")
- Slot পূর্ণ হলে card disabled + "স্লট পূর্ণ" badge
- ফর্মে শুধু custom ad placements থাকবে

### ৪. Admin Ads পেজ উন্নতকরণ

- **Image upload:** file picker যোগ → `ad-images` bucket-এ upload → URL সেভ
- **Google Ads (HTML/Script):** Admin শুধু HTML/script paste করে Google Ad বসাতে পারবে
- **Slot usage dashboard:** প্রতিটি placement-এ কয়টা ad active, কয়টা slot খালি তা দেখানো
- **Ad slot config:** placement-wise max limit ও price set করার অপশন

### ৫. Frontend-এ Ad দেখানো (Index, ProductDetail, CategoryPage)

বর্তমান `AdPlaceholder` ব্যবহার `AdSlot` দিয়ে replace:
- `Index.tsx` — header-banner → `<AdSlot placement="header" />`, sidebar → `<AdSlot placement="sidebar" />`
- `ProductDetail.tsx` — in-content, before-download
- `CategoryPage.tsx` — sidebar

### ফাইল পরিবর্তন

| ফাইল | কাজ |
|---|---|
| Migration SQL | `ad_slots` টেবিল তৈরি, `ads`-এ কলাম যোগ, storage bucket |
| `src/components/AdSlot.tsx` | নতুন — real ad render + placeholder + slot full msg |
| `src/components/AdPlaceholder.tsx` | মুছে ফেলা বা AdSlot-এ redirect |
| `src/pages/Advertise.tsx` | Google Ads সরানো, slot availability দেখানো |
| `src/pages/admin/AdminAds.tsx` | Image upload, slot dashboard, Google ad support |
| `src/hooks/useAds.ts` | নতুন — placement-wise ad fetch hook |
| `src/pages/Index.tsx` | AdPlaceholder → AdSlot |
| `src/pages/ProductDetail.tsx` | AdPlaceholder → AdSlot |
| `src/pages/CategoryPage.tsx` | AdPlaceholder → AdSlot |

### বিজ্ঞাপন rotation logic

```text
Homepage banner (header): max 5 ads → priority + random rotate
Sidebar: max 10 → random pick 1
In-content: max 15 → random pick 1  
Before-download: max 10 → random pick 1
```

প্রতিটি page load-এ random ad select হবে। Impression count বাড়বে। Click-এ click count বাড়বে।

