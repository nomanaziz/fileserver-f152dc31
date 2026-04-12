

# হোমপেজে "Latest News" ব্লগ সেকশন যোগ

## কী করা হবে

Index.tsx-এ Latest Uploads সেকশনের পরে একটা "সর্বশেষ খবর / Latest News" সেকশন যোগ হবে যেটা `blog_posts` টেবিল থেকে সর্বশেষ ৪টি published post দেখাবে।

## ডিজাইন

- সেকশন হেডার: Newspaper icon + "সর্বশেষ খবর" + "সব দেখুন →" link (`/blog`)
- Grid layout: 1-col mobile, 2-col md, 4-col lg
- প্রতিটা কার্ড: thumbnail image, তারিখ, title (2-line clamp), excerpt (2-line clamp), "পড়ুন →" link
- BlogList page-এর card design অনুসরণ করবে (consistent look)

## ফাইল পরিবর্তন

| ফাইল | কী হবে |
|---|---|
| `src/pages/Index.tsx` | Blog query যোগ + "সর্বশেষ খবর" সেকশন render (Latest Uploads-এর পরে, sidebar-এর ভিতরে main content area-তে) |

## টেকনিক্যাল নোট
- `useQuery` দিয়ে `blog_posts` থেকে `is_published = true`, `order by published_at desc`, `limit 4`
- বর্তমানে কোনো published blog post নেই — empty state দেখাবে "শীঘ্রই নতুন আর্টিকেল আসছে"
- DB change লাগবে না

