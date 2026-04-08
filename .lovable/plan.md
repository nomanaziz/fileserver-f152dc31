

# Fix Missing Pages and Auth Redirects

## Problems
1. `/pricing` and `/live-tv` routes don't exist — they 404
2. Logged-in users can still access `/login` and `/register` instead of being redirected to `/dashboard`

## Plan

### 1. Create `src/pages/Pricing.tsx`
- Subscription plans page that fetches from `subscription_plans` table
- Shows plan cards with features, price, duration
- Wrapped in `<Layout>`

### 2. Create `src/pages/LiveTV.tsx`
- Public page that fetches active channels from `live_channels` table
- Displays channel grid with embedded player or thumbnails
- Wrapped in `<Layout>`

### 3. Add routes in `App.tsx`
- Add `<Route path="/pricing" element={<Pricing />} />`
- Add `<Route path="/live-tv" element={<LiveTV />} />`

### 4. Add auth redirect to `Login.tsx` and `Register.tsx`
- Import `useAuth` and check if `user` exists
- If logged in, `<Navigate to="/dashboard" />` immediately
- Prevents authenticated users from seeing login/register forms

### Files Changed
- `src/pages/Pricing.tsx` — new
- `src/pages/LiveTV.tsx` — new
- `src/pages/Login.tsx` — add auth redirect
- `src/pages/Register.tsx` — add auth redirect
- `src/App.tsx` — add 2 routes

