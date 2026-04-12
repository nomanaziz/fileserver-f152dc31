

# প্রোডাক্ট আপলোড সিস্টেম রিডিজাইন — Multi-Category + Content-Type-Specific Fields

## সমস্যা
1. প্রোডাক্টে শুধু একটা category দেওয়া যায় (single `category_id` column)
2. Category selector-এ search নেই
3. সব content type-এ একই ফিল্ড দেখায় (movie-তে OS Type, developer দেখায় — অপ্রাসঙ্গিক)

## সমাধান

### ১. Multi-Category সাপোর্ট (DB Migration)

নতুন junction table তৈরি:
```text
product_categories
├── product_id (uuid, FK → products)
├── category_id (uuid, FK → categories)
└── PRIMARY KEY (product_id, category_id)
```
- `products.category_id` column রাখব backward compatibility-র জন্য (primary category হিসেবে)
- নতুন `product_categories` table-এ একটা product-এর multiple categories থাকবে
- RLS: Anyone can SELECT, admin ALL, vendor can manage own product's categories

### ২. Searchable Multi-Category Selector Component

নতুন `MultiCategorySelect` component:
- Checkbox-based multi-select dropdown
- Search/filter input field
- Parent → child hierarchy দেখাবে (indented)
- Selected categories chips/badges হিসেবে দেখাবে

### ৩. Content-Type অনুযায়ী Dynamic Fields

content_type enum-এ যা আছে: `software`, `android`, `game`, `movie`, `music`, `ebook`, `tutorial`, `other`

প্রতিটা type-এ কোন ফিল্ড দেখাবে:

| ফিল্ড | software | android | game | movie | music | ebook | tutorial | other |
|---|---|---|---|---|---|---|---|---|
| OS Type | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Version | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Developer | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Director* | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Artist* | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Author* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Video URL | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Duration | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Language* | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ |
| File Size | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

\* নতুন fields — `developer` column-ই reuse করব (label পরিবর্তন হবে content_type অনুসারে: Developer/Director/Artist/Author)

**Content Type selector** ফর্মের শুরুতে থাকবে — সিলেক্ট করলে নিচের ফিল্ড dynamic-ভাবে পরিবর্তন হবে।

### ৪. ফর্ম রি-অর্গানাইজ

ফর্মকে sections-এ ভাগ করব:
1. **Basic Info** — Title, Slug, Content Type, Description
2. **Media** — Image, Thumbnail, Screenshots, Video URL
3. **Categories** — Multi-category selector (searchable)
4. **Type-Specific Details** — content_type অনুযায়ী dynamic fields
5. **Pricing** — Paid/Free, Price, Discount, License, Affiliate
6. **Download Links** — Server links
7. **Admin Controls** — Status, Verified, Active, Featured, Trending

## পরিবর্তিত ফাইলসমূহ

| ফাইল | কী হবে |
|---|---|
| **Migration** | `product_categories` table + RLS |
| `src/components/MultiCategorySelect.tsx` | নতুন — searchable multi-category picker |
| `src/pages/admin/AdminProducts.tsx` | Content-type dynamic fields, multi-category, form reorganize |
| `src/pages/vendor/VendorProducts.tsx` | Same dynamic fields + multi-category |
| `src/hooks/useProducts.ts` | Multi-category filtering support |
| `src/pages/CategoryPage.tsx` | `product_categories` table থেকে query |
| `src/pages/SearchPage.tsx` | Multi-category filter |
| `src/pages/ProductDetail.tsx` | Multiple categories দেখাবে |

## টেকনিক্যাল নোট

- `developer` column reuse করব Director/Artist/Author হিসেবে — নতুন column লাগবে না
- `video_url` ও `video_duration` column already আছে products table-এ
- `product_categories` table দিয়ে multi-category, কিন্তু `category_id` রাখব primary category হিসেবে
- Category query: `product_categories` join করে filter করব

