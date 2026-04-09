

# Manual Payment + Footer Social + Category Sidebar Filter

## Summary
তিনটি কাজ: (1) Checkout page-এ manual payment system উন্নত — select করার পরেই account details দেখাবে, (2) Footer-এ শুধু Telegram, Facebook, YouTube icon রাখা — বাকি সব remove, (3) Category page sidebar-এ শুধু current category-র subcategories দেখানো — checkbox filter সহ।

## Changes

### 1. Checkout — Manual Payment UX উন্নত
`src/pages/CheckoutPage.tsx`:
- Payment methods গুলো প্রথমে শুধু নাম + icon দিয়ে radio-style list দেখাবে (বিকাশ Personal, নগদ Personal, Rocket, Bank ইত্যাদি)
- User যেটা select করবে সেটার details expand হবে — account number, instructions, copy button
- Select না করলে details hidden থাকবে
- "পেমেন্ট করেছি" button শুধু selected method-এর নিচে দেখাবে
- এটা already আছে কিন্তু UX improve করবো — collapsed cards, selected-এ expand

### 2. Footer — শুধু Telegram, Facebook, YouTube
`src/components/layout/Footer.tsx`:
- Fallback social icons থেকে Github, Twitter remove করবো
- শুধু Telegram, Facebook, YouTube icon রাখবো
- `socialIcons` map থেকে `twitter_url`, `whatsapp_url` remove
- Fallback section-এ শুধু তিনটা icon: Facebook, Youtube, Telegram
- Email subscribe section remove করবো (দরকার নেই)

### 3. Category Sidebar — Context-Aware Subcategory Filter
`src/components/layout/CategorySidebar.tsx` rewrite:
- Props দিয়ে current parent category ID নেবে
- শুধু সেই parent-এর subcategories দেখাবে (সব category না)
- Checkbox style — multiple subcategory select করা যাবে
- Selected subcategories parent component-এ callback দিয়ে পাঠাবে

`src/pages/CategoryPage.tsx` update:
- CategorySidebar-কে current category pass করবে
- Selected subcategory IDs state maintain করবে
- Products filter করবে: selected subcategories থাকলে সেগুলোর products, না থাকলে parent category-র সব products
- `useProducts` hook-এ multiple category_id support যোগ করতে হবে

`src/hooks/useProducts.ts` update:
- `category_ids` array filter option যোগ — `.in("category_id", ids)` ব্যবহার করবে

## Files

**Edit:**
- `src/pages/CheckoutPage.tsx` — collapsed/expanded payment method cards
- `src/components/layout/Footer.tsx` — only Telegram, Facebook, YouTube; remove email subscribe
- `src/components/layout/CategorySidebar.tsx` — context-aware subcategory checkboxes
- `src/pages/CategoryPage.tsx` — pass parent category, handle subcategory filter state
- `src/hooks/useProducts.ts` — add `category_ids` array filter

