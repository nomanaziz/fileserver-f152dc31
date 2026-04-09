

# "আমাদের ওয়েবসাইটে বিজ্ঞাপন দিন" — Advertise Page

## Summary
একটি public page তৈরি হবে `/advertise` route-এ, যেখানে advertiser-রা দেখবে কোন কোন জায়গায় ad দেওয়া যায়, সাইজ কত, প্রাইস কত — এবং সরাসরি contact/purchase করতে পারবে। ডিজাইন হবে clean, native content-এর মতো — "বিজ্ঞাপন" মনে হবে না।

## Ad Placement Options (Hardcoded — কম, পরিষ্কার)

| Placement | Size | মাসিক মূল্য | বর্ণনা |
|-----------|------|-------------|---------|
| Header Banner | 728×90 | ৳৫০০ | সাইটের উপরে, সব পেজে দেখায় |
| Sidebar | 300×250 | ৳৩০০ | ক্যাটাগরি/প্রোডাক্ট পেজে পাশে |
| In-Content | 468×60 | ৳২০০ | ডাউনলোড পেজের মাঝে, content-এর সাথে মিশে যায় |
| Before Download | 728×90 | ৳৪০০ | ডাউনলোড বাটনের ঠিক আগে — highest visibility |

মাত্র ৪টি option — জায়গা নষ্ট হবে না, native look বজায় থাকবে।

## Design Approach — "Native Ad" Feel
- Card-based layout, সাইটের বাকি content-এর মতো same styling
- Preview mockup দেখাবে কোথায় ad বসবে (simple illustration/placeholder)
- No flashy colors — muted, professional tone
- "বিজ্ঞাপন দিন" CTA button → contact form বা WhatsApp/Telegram link

## Changes

### 1. Create `/advertise` page (`src/pages/Advertise.tsx`)
- Hero section: "আমাদের সাইটে বিজ্ঞাপন দিন" heading
- Stats: monthly visitors, page views (hardcoded or from settings)
- Ad placement cards: 4টি option — placement name, size, price, short description, visual preview area
- "অর্ডার করুন" button → opens a simple contact form (name, email, phone, selected placement) or redirects to Telegram/contact
- FAQ section: payment method, duration, custom sizes etc.

### 2. Add route in `App.tsx`
- `/advertise` → Advertise page

### 3. Add to navigation
- Footer menu-তে "বিজ্ঞাপন দিন" link (admin menu items থেকেও করা যাবে, কিন্তু default-এ Navbar-তে একটা subtle link রাখবো)

### 4. Database — Ad inquiry table (migration)
- `ad_inquiries` table: name, email, phone, placement, message, status (pending/contacted/completed), created_at
- Admin dashboard-এ এই inquiries দেখতে পারবে

## Files

**Create:**
- `src/pages/Advertise.tsx` — advertise page with placement cards + contact form

**Edit:**
- `src/App.tsx` — add `/advertise` route
- `src/components/layout/Navbar.tsx` — add "বিজ্ঞাপন দিন" link (subtle, footer-এ or nav-এ)

**Migration:**
- `ad_inquiries` table create with RLS (public insert, admin select)

