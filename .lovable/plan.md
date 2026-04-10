

# BD IX Server List — রিডিজাইন, লাইভ অ্যাক্সেসিবিলিটি চেক, Facebook লিংক রিমুভ

## কী করব

### ১. ডিজাইন পরিবর্তন — রেফারেন্স সাইটের মতো গ্রিড লেআউট
বর্তমান ডিজাইনে প্রতিটি সার্ভারের সব লিংক একসাথে দেখায়। নতুন ডিজাইনে:
- **3-কলাম গ্রিড** (মোবাইলে 1, ট্যাবলেটে 2, ডেস্কটপে 3)
- প্রতিটি সার্ভার একটি কার্ড — বাম দিকে আইকন, মাঝে সার্ভারের নাম (bold) + প্রথম লিংক (subtitle হিসেবে), ডানে chevron arrow
- কার্ডে ক্লিক করলে expand হয়ে সব লিংক দেখাবে (accordion style)
- প্রতিটি ক্যাটাগরির জন্য আলাদা আইকন ও color accent

### ২. লাইভ অ্যাক্সেসিবিলিটি চেক
- প্রতিটি লিংকের পাশে ছোট ডট (green/red/gray)
- পেজ লোডের পর ব্যাকগ্রাউন্ডে `fetch(url, { mode: 'no-cors', signal: AbortController })` দিয়ে চেক করব
- সফল হলে green ডট, ব্যর্থ হলে red ডট, চেক চলছে = gray spinning
- **সীমাবদ্ধতা**: CORS-এর কারণে অনেক সার্ভার `no-cors` mode-এ শুধু "opaque" response দেবে — এটা "reachable" হিসেবে গণ্য হবে। সত্যিকার unreachable হলে fetch reject হবে = red
- একসাথে সব চেক না করে batch-এ (5টি করে) চালাবো যাতে ব্রাউজার hang না করে
- Custom hook: `useAccessibilityCheck(links)` — returns `Map<string, 'checking' | 'online' | 'offline'>`

### ৩. Facebook লিংক রিমুভ (Database Migration)
- Migration-এ SQL দিয়ে `bdix_servers` টেবিলের সব row-এর `links` array থেকে facebook.com যুক্ত entry গুলো বাদ দেওয়া হবে:
```sql
UPDATE bdix_servers
SET links = array_remove_facebook(links)
-- using array manipulation to filter out facebook URLs
```

### ৪. ক্যাটাগরি আইকন
| Category | আইকন |
|---|---|
| Media & FTP | `HardDrive` (স্টোরেজ বোঝাতে) |
| Live TV | `Tv` |
| Speed Test | `Gauge` |

## ফাইল পরিবর্তন

| ফাইল | কাজ |
|---|---|
| `src/pages/BdixServers.tsx` | সম্পূর্ণ রিডিজাইন — গ্রিড কার্ড + accessibility চেক |
| `src/hooks/useAccessibilityCheck.ts` | নতুন — লিংক reachable কিনা ব্রাউজার থেকে চেক |
| Migration SQL | Facebook লিংক সব সার্ভার থেকে রিমুভ |

## টেকনিক্যাল বিবরণ

**Accessibility check hook**:
```
useAccessibilityCheck(links: string[]) → Map<string, status>
```
- `useEffect`-এ batch fetch চালাবে (5 concurrent)
- `AbortController` দিয়ে 5 সেকেন্ড timeout
- `mode: 'no-cors'` ব্যবহার করবে কারণ FTP/media সার্ভারে CORS header নেই
- Component unmount হলে সব abort

**Facebook link removal migration**:
```sql
UPDATE bdix_servers SET links = (
  SELECT array_agg(link)
  FROM unnest(links) AS link
  WHERE link NOT LIKE '%facebook.com%'
);
```

