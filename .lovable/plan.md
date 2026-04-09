

# Blog/Contact লিংক Remove + Admin-Controlled Dynamic Menus

## Summary
Blog ও Contact-এর hardcoded লিংক remove করবো। Header ও Footer-এর সব menu items admin panel (Menu Items) থেকে control করা যাবে — কোন link কোথায় দেখাবে সেটা admin ঠিক করবে।

## Current State
- **Navbar.tsx** (active header): Already loads `headerMenuItems` from DB ✅ — কিন্তু Home, Pricing, Live TV hardcoded আছে (এগুলো থাকবে)
- **Footer.tsx**: Blog, Contact, About, Pricing, Privacy, Terms সব hardcoded — এগুলো dynamic করতে হবে
- **Header.tsx**: পুরনো file, Layout ব্যবহার করে না — ignore করা যায়
- **App.tsx**: Blog/Contact routes আছে — routes রাখবো (admin যদি পরে আবার add করে), শুধু hardcoded nav links remove

## Changes

### 1. Footer.tsx — Fully Dynamic Menus
- Hardcoded "More" ও "Legal" sections replace করবো DB-driven menu items দিয়ে
- `menu_items` table থেকে `location = 'footer'` fetch করবো
- Parent items → section headers, children → links
- Admin panel থেকে footer sections ও links manage করা যাবে

### 2. App.tsx — Blog/Contact Routes Remove
- `/blog`, `/blog/:slug`, `/contact` routes remove
- Import statements remove

### 3. Header.tsx Cleanup
- Hardcoded `navLinks` array থেকে Blog ও Contact remove (backup header file)

## Admin Workflow
Admin Panel → Menu Items → Add Item:
- Label: "ব্লগ", URL: "/blog", Location: "header" → Header-এ দেখাবে
- Label: "যোগাযোগ", URL: "/contact", Location: "footer" → Footer-এ দেখাবে
- Admin চাইলে যেকোনো সময় add/remove করতে পারবে

## Files
**Edit:**
- `src/components/layout/Footer.tsx` — dynamic menu sections from DB
- `src/components/layout/Header.tsx` — remove Blog/Contact from navLinks
- `src/App.tsx` — remove Blog/Contact routes & imports

