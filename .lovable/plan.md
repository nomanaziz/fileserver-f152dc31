

# Device-Based Content Prioritization

## Summary
User-Agent থেকে device detect করে homepage-এ সেই platform-এর content আগে দেখাবে। Android user দেখবে Android apps আগে, Windows user দেখবে Windows software আগে, Mac user দেখবে Mac software আগে।

## How It Works

```text
User visits homepage
  → navigator.userAgent parsed
  → platform detected: "android" | "windows" | "mac" | "ios" | "linux"
  → Categories matched by slug/name keywords
  → "Recommended for You" section shows platform-specific products first
  → Trending & Latest sections sort platform-matching products to top
```

## Changes

### 1. Create `src/hooks/useDevicePlatform.ts`
- Parse `navigator.userAgent` to detect platform
- Returns one of: `android`, `windows`, `mac`, `ios`, `linux`, `unknown`
- Mapping logic:
  - Android → `android`
  - iPhone/iPad → `ios`
  - Macintosh → `mac`
  - Windows → `windows`
  - Linux → `linux`

### 2. Create `src/hooks/useRecommendedProducts.ts`
- Takes detected platform as input
- Maps platform to category slugs (e.g., `android` → `["android", "android-apps", "apk"]`, `windows` → `["software", "windows", "pc-software"]`)
- Fetches products from matching categories, ordered by download_count
- Falls back to featured products if no platform match

### 3. Update `src/pages/Index.tsx`
- Add new "Recommended for Your Device" section **above** Trending Downloads
- Shows device icon (Smartphone/Monitor/Laptop) + detected platform name as badge
- Displays 4-6 products in grid view for that platform
- Existing Trending & Latest sections remain unchanged (keeps page familiar)

### 4. Add platform-aware sorting utility
- Helper function `sortByPlatformRelevance(products, platform, categories)` 
- Products whose category matches the detected platform get boosted to the top in Trending/Latest lists
- Uses category slug keyword matching (e.g., category slug contains "android" → matches android platform)

## Platform-to-Category Mapping

| Platform | Category slug keywords |
|----------|----------------------|
| android  | android, apk, mobile |
| windows  | windows, software, pc |
| mac      | mac, macos, apple |
| ios      | ios, iphone, ipad |
| linux    | linux, ubuntu |

This mapping is flexible — it matches if the category slug **contains** any of these keywords, so existing categories like "android-apps" or "pc-software" will automatically match.

## Files
- **Create**: `src/hooks/useDevicePlatform.ts`
- **Create**: `src/hooks/useRecommendedProducts.ts`  
- **Edit**: `src/pages/Index.tsx` — add "Recommended for You" section + sort existing sections

## No Database Changes Required
Everything works with existing `categories` and `products` tables. Detection is purely client-side via `navigator.userAgent`.

