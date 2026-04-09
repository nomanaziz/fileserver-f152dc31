

# Vercel Deployment Setup

## Summary
Vercel-এ deploy করার জন্য দুটি জিনিস দরকার: (1) `vercel.json` config file — SPA routing handle করবে যাতে 404 না আসে page refresh-এ, (2) project structure already Vite-based তাই build command ঠিক আছে।

## Changes

### 1. Create `vercel.json`
Project root-এ `vercel.json` তৈরি করবো:
- SPA rewrite rule: সব route `/index.html`-এ redirect করবে (React Router handle করবে)
- এতে `/product/xyz`, `/admin/settings` ইত্যাদি deep links page refresh-এও কাজ করবে
- Static assets (JS, CSS, images) normal-ভাবে serve হবে

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 2. No other changes needed
- Vite build output (`dist/`) Vercel auto-detect করে
- `package.json` scripts ঠিক আছে (`build: vite build`)
- Environment variables (VITE_SUPABASE_URL etc.) Vercel dashboard → Settings → Environment Variables-এ add করতে হবে

## Vercel Deploy Steps (for user)
1. GitHub-এ repo push করো
2. Vercel-এ import করো
3. Framework: Vite auto-detect হবে
4. Environment Variables add করো: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
5. Deploy

## Files
**Create:** `vercel.json`

