

# Admin BD IX — Accessibility Check ও Bulk Disable

## সমস্যা
Admin পেজে সার্ভারগুলোর লিংক accessible কি না সেটা চেক করার কোনো উপায় নেই। Expired/dead সার্ভার manually খুঁজে disable করতে হয়।

## কী করব

### ১. Accessibility Check বাটন
- "Check Links" বাটন যোগ — ক্লিক করলে `useAccessibilityCheck` হুক দিয়ে সব লিংক চেক করবে
- প্রতিটা সার্ভারের পাশে status দেখাবে (green dot = accessible, red dot = inaccessible, spinner = checking)
- Progress indicator: কতটা চেক হয়েছে

### ২. Accessibility Filter
- Filter dropdown: All / Accessible / Inaccessible
- Inaccessible filter দিলে শুধু যেসব সার্ভারের সব লিংক offline সেগুলো দেখাবে

### ৩. Bulk Disable বাটন
- "Inaccessible সব Disable করুন" বাটন — filtered inaccessible সার্ভারগুলো একসাথে `is_active = false` করবে
- Confirmation dialog দেখাবে কতটা disable হবে

## ফাইল পরিবর্তন

| ফাইল | কাজ |
|---|---|
| `src/pages/admin/AdminBdixServers.tsx` | useAccessibilityCheck হুক যোগ, accessibility filter, per-server status badge, bulk disable বাটন ও mutation |

কোনো DB পরিবর্তন লাগবে না — `is_active` কলাম ও admin RLS আগেই আছে।

