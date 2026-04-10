

# Navbar: Live TV → BD IX Server List

## কী করব
Navbar-এর secondary menu bar থেকে "Live TV" লিংক সরিয়ে "BD IX Server List" (`/bdix-servers`) লিংক বসাবো। Live TV ইতোমধ্যে BD IX পেজের একটা ট্যাব হিসেবে আছে।

## পরিবর্তন — `src/components/layout/Navbar.tsx`

1. **Import**: `Radio` icon সরিয়ে `Server` icon যোগ (BD IX এর জন্য)
2. **activeSlug logic**: `"/live-tv"` চেক সরিয়ে `"/bdix-servers"` চেক যোগ
3. **Desktop nav bar** (line ~279-289): Live TV Link ব্লক replace করে BD IX Server List link:
   ```
   /bdix-servers → "BD IX Servers" with Server icon
   ```
4. **Mobile drawer** (line ~350-360): Live TV button replace করে BD IX Servers button
5. **headerMenuItems filter**: `skipUrls` থেকে `/live-tv` সরিয়ে `/bdix-servers` যোগ

একটাই ফাইল পরিবর্তন: `src/components/layout/Navbar.tsx`

