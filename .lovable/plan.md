

# ড্যাশবোর্ডে "সেভ করা BD IX লিংক" ট্যাব যোগ

## সমস্যা
ইউজার BD IX পেজ থেকে accessible লিংক সেভ করেছে `user_saved_bdix_links` টেবিলে, কিন্তু ড্যাশবোর্ডে এটা দেখার কোনো জায়গা নেই।

## কী করব

### `src/pages/Dashboard.tsx` — নতুন "BD IX" ট্যাব যোগ

1. `useQuery` দিয়ে `user_saved_bdix_links` থেকে ইউজারের সেভ করা লিংক fetch
2. TabsList-এ নতুন ট্যাব: **"BD IX"** with `Server` icon
3. TabsContent-এ:
   - সেভ করা লিংকগুলোর লিস্ট (clickable, external link)
   - কবে সেভ হয়েছে (`updated_at`) তারিখ দেখানো
   - লিংক না থাকলে empty state — "কোনো সেভ করা লিংক নেই" + BD IX পেজে যাওয়ার বাটন
   - "মুছে ফেলুন" বাটন — সেভ করা লিংক ডিলিট করার অপশন

## ফাইল পরিবর্তন

| ফাইল | কাজ |
|---|---|
| `src/pages/Dashboard.tsx` | নতুন BD IX ট্যাব + query + UI |

কোনো DB পরিবর্তন লাগবে না — টেবিল ও RLS আগেই তৈরি আছে।

