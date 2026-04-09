

# Product Card উন্নতি + Category Default Image + Hero Banners

## Summary
তিনটি কাজ: (1) প্রতিটি product card-এ Download বাটন যোগ, (2) প্রতিটি category-র জন্য SVG default placeholder image তৈরি — product-এ image না থাকলে category-র icon/color দিয়ে সুন্দর placeholder দেখাবে, (3) Hero section-এর নিচে colorful category banners।

## Implementation

### 1. Category Default Placeholder Images
`src/components/CategoryPlaceholder.tsx` — নতুন component তৈরি করবো যা category slug অনুযায়ী colorful gradient background + category icon (Monitor, Smartphone, Gamepad2, Film, BookOpen, Palette, Code) দিয়ে সুন্দর placeholder render করবে। এটা product card-এ image না থাকলে ব্যবহার হবে।

প্রতিটি category-র জন্য unique gradient + icon:
- **Software**: Blue gradient + Monitor icon
- **Android**: Green gradient + Smartphone icon
- **Games**: Purple gradient + Gamepad2 icon
- **Movies**: Red gradient + Film icon
- **Tutorials**: Yellow/amber gradient + BookOpen icon
- **Graphics**: Pink gradient + Palette icon
- **Source Code**: Cyan gradient + Code icon

### 2. ProductCard.tsx — Download বাটন + Default Image
- Image না থাকলে `CategoryPlaceholder` component ব্যবহার করবে (বর্তমানের ছোট icon-এর বদলে সুন্দর gradient placeholder)
- Grid variant: Card-এর নিচে (category badge-এর পাশে) একটি ছোট "Download" বাটন যোগ
- List variant: ডানদিকে Download বাটন যোগ
- বাটন click করলে `/product/{slug}` page-এ যাবে (download link product detail page-এ থাকে)

### 3. Index.tsx — Hero-র নিচে Colorful Category Banners
Hero section-এর ঠিক নিচে, main content-এর আগে একটি horizontally scrollable banner strip যোগ করবো:
- প্রতিটি category-র জন্য একটি colorful card/banner (category color gradient background)
- Category icon + name সহ
- Click করলে `/category/{slug}` page-এ যাবে
- Mobile-এ horizontal scroll, desktop-এ grid/flex layout

## Files

**Create:**
- `src/components/CategoryPlaceholder.tsx` — gradient + icon placeholder component

**Edit:**
- `src/components/ProductCard.tsx` — use CategoryPlaceholder for missing images, add Download button
- `src/pages/Index.tsx` — add colorful category banners after hero section

