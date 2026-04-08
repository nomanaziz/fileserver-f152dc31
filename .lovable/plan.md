

# Design Overhaul — Match Original FileServer Exactly

## Problem
The current project has a completely different design from the original [File Server](/projects/5f93cb8d-8c3f-4357-a813-d949c7533a54) project. Key differences:

```text
Original (fileserver.lovable.app)          Current Project
─────────────────────────────────          ───────────────
Light theme (white bg)                     Dark theme (navy bg)
Purple primary (#7C3AED)                   Blue primary (#3B82F6)
Navbar: logo + search + actions (row 1)    Single header with all in one row
Category tab bar below navbar              No category bar, just 4 nav links
Trending = horizontal list rows            Featured = card grid
Right sidebar (Popular, Request, Links)    Left sidebar (category list only)
Inter + JetBrains Mono fonts              No custom fonts
Login: split layout (branding + form)      Simple centered form
Footer: 5-column with newsletter           3-column simple footer
Logo image (fileserver-white-logo.png)     Shield icon text logo
```

## Plan

### 1. Copy assets from original project
- Copy `fileserver-white-logo.png` logo
- Copy `favicon.ico`

### 2. Replace CSS theme (`src/index.css`)
- Switch to original's light-mode-only color scheme: purple primary (`262 83% 58%`), white background, purple accent
- Add Inter + JetBrains Mono font imports
- Add utility classes: `.text-gradient`, `.card-hover`, `.list-row`, `.shimmer`
- Add category accent color CSS variables

### 3. Update Tailwind config (`tailwind.config.ts`)
- Add `fontFamily` (Inter, JetBrains Mono)
- Add animations: `fade-in`, `scale-in`, `slide-up`, `slide-in-right`
- Keep existing color structure (already uses CSS variables)

### 4. Rebuild Header → Navbar (`src/components/layout/Navbar.tsx`)
Replace the current Header with the original's two-row navbar:
- **Row 1**: Logo image | Search bar (with ⌘K badge) | Heart, Cart, User dropdown | Sign In/Sign Up
- **Row 2**: Category tab bar — Home + DB categories (with subcategory popovers) + Pricing + Live TV + custom menu_items
- **Mobile**: Sheet drawer with search, expandable categories, auth links

### 5. Rebuild Homepage (`src/pages/Index.tsx`)
Match original layout exactly:
- Compact hero with "Fast & Free Downloads" badge, "Download Everything You Need" heading, search bar with Search button
- **Main content (left)**: "Trending Downloads" in list-row format (not cards), "Latest Uploads" in 4-column grid
- **Right sidebar**: "Most Popular" numbered list, Software Request Form widget, "Quick Links" category list

### 6. Rebuild ProductCard (`src/components/ProductCard.tsx`)
Add dual variant support matching original:
- **`list` variant**: Horizontal row with thumbnail, title, description, category badge (colored), OS icon, file size, download count, price badge
- **`grid` variant**: Card with color accent bar, thumbnail, price badge overlay, title, category + version, download count

### 7. Add SoftwareRequestForm component
Port from original — form with software name + description + submit, plus recent requests list

### 8. Rebuild Footer (`src/components/layout/Footer.tsx`)
Match original's 5-column layout:
- Col 1-2: Logo + description + email newsletter
- Col 3: Categories links
- Col 4: More (Blog, About, Contact, Pricing)
- Col 5: Legal (Privacy, Terms, Refund + dynamic menu_items)
- Bottom bar: Copyright + social icons

### 9. Rebuild Login page (`src/pages/Login.tsx`)
Match original split layout:
- Left: gradient background + Download icon + "Welcome to FileServer" branding
- Right: Card with Sign In form

### 10. Update Layout (`src/components/layout/Layout.tsx`)
- Use Navbar instead of Header
- Add AdBanner placements (header/footer)
- Add LiveChat component

### 11. Remove `index.html` dark class
Remove `class="dark"` from `<html>` tag — original is light theme only

### 12. Update project memory
Update design tokens memory to reflect the original purple-primary light theme

## Files Modified
- `src/index.css` — full rewrite
- `tailwind.config.ts` — fonts + animations
- `index.html` — remove dark class
- `src/components/layout/Navbar.tsx` — new (replaces Header.tsx)
- `src/components/layout/Header.tsx` — delete or keep as redirect
- `src/components/layout/Footer.tsx` — full rewrite
- `src/components/layout/Layout.tsx` — update imports
- `src/components/ProductCard.tsx` — full rewrite with list/grid variants
- `src/components/SoftwareRequestForm.tsx` — new component
- `src/pages/Index.tsx` — full rewrite
- `src/pages/Login.tsx` — full rewrite
- `src/assets/fileserver-white-logo.png` — copied from original
- `mem://design/tokens` — updated

