

# Favorites & Cart 404 Fix + Product Card Heart Icon + Admin Cart/Checkout Analytics

## Summary
তিনটি সমস্যা সমাধান: (1) `/favorites` ও `/cart` route নেই — 404 আসে, এগুলো তৈরি করতে হবে, (2) ProductCard-এ heart/favorite icon যোগ, (3) Admin dashboard-এ cart, favorites, abandoned checkout analytics দেখানো।

## Implementation

### 1. Create `/favorites` page (`src/pages/FavoritesPage.tsx`)
- User-এর সব favorite products grid-এ দেখাবে
- Favorite remove button সহ
- Login required — না থাকলে login-এ redirect

### 2. Create `/cart` page (`src/pages/CartPage.tsx`)
- Cart items list — product image, title, price
- Remove from cart button
- "চেকআউট করুন" button → `/checkout`-এ যাবে
- Empty cart state
- Login required

### 3. Add routes to `App.tsx`
- `/favorites` → FavoritesPage
- `/cart` → CartPage

### 4. ProductCard-এ Heart icon যোগ (`src/components/ProductCard.tsx`)
- Grid variant: image-এর উপরে top-left corner-এ ছোট heart icon
- Click করলে favorite toggle হবে (filled red = favorited, outline = not)
- `useToggleFavorite` hook ব্যবহার করবে
- Not logged in হলে login-এ redirect

### 5. Admin Dashboard-এ Cart & Checkout Analytics
`src/pages/admin/AdminDashboard.tsx`-এ নতুন cards যোগ:
- Total cart items (সব user-এর cart count)
- Total favorites count
- Abandoned checkouts (pending payment records যেখানে status = 'pending')

**Database migration**: Admin-কে cart_items ও favorites দেখতে দিতে RLS policy যোগ করতে হবে:
- `cart_items`: Admin SELECT policy
- `favorites`: Admin SELECT policy

## Files

**Create:**
- `src/pages/FavoritesPage.tsx` — favorites listing page
- `src/pages/CartPage.tsx` — cart page with items + checkout button

**Edit:**
- `src/App.tsx` — add `/favorites` and `/cart` routes
- `src/components/ProductCard.tsx` — add heart/favorite toggle icon
- `src/pages/admin/AdminDashboard.tsx` — add cart/favorites/abandoned checkout stats

**Migration:** Add admin SELECT policies on `cart_items` and `favorites` tables

