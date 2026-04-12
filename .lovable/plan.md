

# সব জায়গায় ইমেজ আপলোড + অটো কম্প্রেশন + ডিফল্ট ইমেজ

## কী করা হবে

1. **`ImageUploadField` — রিইউজেবল কম্পোনেন্ট তৈরি** যেটা সব জায়গায় ব্যবহার হবে
   - আপলোড বাটন (drag & drop সাপোর্ট)
   - ক্লায়েন্ট-সাইড ইমেজ কম্প্রেশন (Canvas API দিয়ে resize + quality reduce — কোনো এক্সটার্নাল লাইব্রেরি ছাড়া)
   - প্রিভিউ দেখাবে
   - ইমেজ না দিলে ডিফল্ট placeholder দেখাবে
   - URL ম্যানুয়ালি পেস্ট করারও অপশন থাকবে

2. **`product-images` স্টোরেজ বাকেট তৈরি** (migration) — প্রোডাক্ট, ব্লগ, লাইভ টিভি, পেমেন্ট মেথড সব ইমেজ এখানে যাবে

3. **ডিফল্ট placeholder ইমেজ** — `public/default-image.svg` তৈরি করব

4. **কম্প্রেশন লজিক:**
   - ইমেজ Canvas-এ লোড → max 800px width-এ resize → JPEG 0.7 quality-তে export
   - ফাইল সাইজ যতই বড় হোক, কম্প্রেস হয়ে ~100-200KB-এর মধ্যে আসবে

## যেসব ফাইলে `ImageUploadField` বসবে

| ফাইল | কোন ফিল্ড |
|---|---|
| `src/pages/admin/AdminProducts.tsx` | image_url, thumbnail_icon, screenshots |
| `src/pages/admin/AdminBlog.tsx` | thumbnail_url |
| `src/pages/admin/AdminLiveTV.tsx` | thumbnail_url |
| `src/pages/admin/AdminPaymentMethods.tsx` | logo_url |
| `src/pages/vendor/VendorProducts.tsx` | image_url, screenshots |
| `src/pages/vendor/VendorSettings.tsx` | logo_url |

**AdminAds-এ ইতিমধ্যে আপলোড আছে** — সেটাও এই নতুন কম্পোনেন্ট দিয়ে রিপ্লেস করব consistency-র জন্য।

## নতুন ফাইল

- `src/components/ImageUploadField.tsx` — রিইউজেবল কম্পোনেন্ট
- `src/lib/imageCompression.ts` — Canvas-based compression utility
- `public/default-image.svg` — ডিফল্ট placeholder
- Migration: `product-images` bucket + RLS policies

## ImageUploadField API

```typescript
<ImageUploadField
  value={imageUrl}           // current URL
  onChange={setImageUrl}     // callback with new URL
  bucket="product-images"   // storage bucket
  folder="products"         // subfolder path
  label="প্রোডাক্ট ইমেজ"
  maxWidth={800}             // optional, default 800px
  quality={0.7}              // optional, default 0.7
/>
```

## টেকনিক্যাল ডিটেইল

**কম্প্রেশন ফ্লো:**
```text
File selected → Create Image element → Draw on Canvas (maxWidth) 
→ canvas.toBlob('image/webp', quality) → Upload to Supabase Storage
```

- WebP ফরম্যাটে কনভার্ট হবে (সবচেয়ে ছোট সাইজ)
- ব্রাউজার WebP সাপোর্ট না করলে JPEG fallback

**Storage bucket migration:**
- `product-images` bucket, public, 5MB limit
- Authenticated users can upload (path: `{user_id}/filename`)
- Public read access

মোট ~10টা ফাইল পরিবর্তন, ৩টা নতুন ফাইল।

