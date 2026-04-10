

# BD IX FTP Server List — পেজ ও অ্যাডমিন ম্যানেজমেন্ট

## কী করব

রেফারেন্স সাইট (sites.google.com/view/bdixftpserverlist) থেকে সব সার্ভার লিংক নিয়ে আমাদের সাইটে একটা সুন্দর ট্যাব-ভিত্তিক পাবলিক পেজ তৈরি করব এবং অ্যাডমিন প্যানেল থেকে ম্যানেজ করার ব্যবস্থা রাখব।

## ধাপসমূহ

### ১. ডেটাবেস — `bdix_servers` টেবিল (Migration)

```sql
CREATE TABLE bdix_servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,        -- 'media_ftp', 'live_tv', 'torrent_iptv', 'international', 'bd_isp', 'speed_test'
  name text NOT NULL,             -- "BUSINESS NETWORK (FTPBD) FTP SERVER"
  links text[] NOT NULL DEFAULT '{}', -- array of URLs
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bdix_servers ENABLE ROW LEVEL SECURITY;

-- Public can view active
CREATE POLICY "Anyone can view active bdix servers"
  ON bdix_servers FOR SELECT USING (is_active = true);

-- Admin full access
CREATE POLICY "Admins can manage bdix servers"
  ON bdix_servers FOR ALL USING (has_role(auth.uid(), 'admin'));
```

### ২. Seed Script — সব লিংক ডেটাবেসে ইনসার্ট

স্ক্র্যাপ করা ডেটা পার্স করে প্রতিটি সার্ভার এন্ট্রি `bdix_servers` টেবিলে INSERT করব। 6 ক্যাটাগরি:

| Category | সার্ভার সংখ্যা (আনুমানিক) |
|---|---|
| Media & FTP Servers | ~200+ |
| Live TV Servers | ~50 |
| Torrent & IPTV | ~30 |
| International Movie & Live TV | ~25 |
| BD ISP Media FTP | ~30 |
| BDIX & Internet Speed Test | ~15 |

### ৩. পাবলিক পেজ — `/bdix-servers`

```text
┌──────────────────────────────────────────────────────────┐
│  BD IX FTP Server List                                    │
│                                                          │
│  [Media & FTP] [Live TV] [Torrent] [International]       │
│  [BD ISP] [Speed Test]                                   │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ⭐ 1. BUSINESS NETWORK (FTPBD) FTP SERVER          │  │
│  │   🔗 http://www.bnet-bd.com  [Open ↗]              │  │
│  │   🔗 http://ftpbd.net  [Open ↗]                    │  │
│  │   🔗 http://103.58.73.6  [Open ↗]                  │  │
│  │   ...                                              │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ⭐ 2. CIRCLE NETWORK FTP SERVER                    │  │
│  │   🔗 https://circlenetworkbd.net  [Open ↗]         │  │
│  │   ...                                              │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

- প্রতিটি সার্ভার একটি Card — নাম, লিংক লিস্ট, প্রতিটি লিংকে "Open" বাটন (`target="_blank"`)
- Tabs: Radix Tabs component ব্যবহার করব (existing `@/components/ui/tabs`)
- ক্যাটাগরি অনুযায়ী colorful ট্যাব — আমাদের existing purple/accent theme ব্যবহার করব
- Layout component দিয়ে wrap (Header + Footer সহ)

### ৪. অ্যাডমিন পেজ — `/admin/bdix-servers`

- টেবিল ভিউ: ক্যাটাগরি ফিল্টার, নাম, লিংক সংখ্যা, active toggle
- Add/Edit Dialog: নাম, ক্যাটাগরি সিলেক্ট, links (textarea, প্রতি লাইনে একটি URL), sort order
- Delete বাটন
- AdminLayout sidebar-এ "BD IX List" মেনু যোগ

### ৫. Routing

- `App.tsx` — `/bdix-servers` public route + `/admin/bdix-servers` admin route
- Admin sidebar-এ নতুন link যোগ

## ফাইল পরিবর্তন

| ফাইল | কাজ |
|---|---|
| Migration | `bdix_servers` টেবিল তৈরি |
| Seed script (exec) | সব সার্ভার ডেটা INSERT |
| `src/pages/BdixServers.tsx` | নতুন — পাবলিক ট্যাব পেজ |
| `src/pages/admin/AdminBdixServers.tsx` | নতুন — অ্যাডমিন CRUD |
| `src/pages/admin/AdminLayout.tsx` | BD IX List মেনু যোগ |
| `src/App.tsx` | নতুন routes যোগ |

## ডিজাইন

- আমাদের existing purple/light theme অনুসরণ
- ট্যাবগুলো colorful badge স্টাইলে — প্রতিটি ক্যাটাগরিতে আলাদা accent color
- Card-এ hover effect, link-এ ExternalLink icon
- Mobile responsive — ট্যাব scroll হবে ছোট স্ক্রিনে

