

# Movie Player ও Tutorial Playlist যোগ করা

## সমস্যা
Movie/video কন্টেন্ট আছে কিন্তু সরাসরি প্লে করার কোনো ব্যবস্থা নেই — শুধু ডাউনলোড লিংক দেখায়। Tutorial-এর ক্ষেত্রেও playlist-এর মতো sequential দেখার সুবিধা নেই।

## কী করব

### ১. Movie Player (content_type === "movie")
- Thumbnail-এর জায়গায় **Play বাটন overlay** দেখাবে
- Play ক্লিক করলে **Server Select ড্রপডাউন** আসবে (product_downloads থেকে সব সার্ভার)
- সার্ভার সিলেক্ট করলে HTML5 `<video>` প্লেয়ার লোড হবে সেই সার্ভারের `download_url` দিয়ে
- ফুলস্ক্রিন, play/pause, volume, seek — সব native video controls
- সার্ভার সুইচ করার অপশন প্লেয়ারের উপরে থাকবে

### ২. Tutorial Playlist (content_type === "tutorial")
- ডাউনলোড লিংকগুলো **playlist আকারে** সাইডবারে দেখাবে (নম্বরসহ)
- একটা ক্লিক করলে সেই ভিডিও মূল প্লেয়ারে লোড হবে
- Currently playing item হাইলাইট থাকবে
- Next/Previous নেভিগেশন বাটন
- ভিডিও শেষ হলে auto-next (optional)
- প্রতিটা আইটেমের পাশে সার্ভার সিলেক্ট অপশন

## ফাইল পরিবর্তন

| ফাইল | কাজ |
|---|---|
| `src/components/VideoPlayer.tsx` | **নতুন** — Reusable video player component with server selector |
| `src/components/TutorialPlaylist.tsx` | **নতুন** — Playlist sidebar with numbered items, active state, next/prev |
| `src/pages/ProductDetail.tsx` | Movie/tutorial detect করে thumbnail-এর বদলে player ও playlist রেন্ডার করবে |

কোনো DB পরিবর্তন লাগবে না — existing `product_downloads` টেবিল থেকেই সব ডেটা আসবে।

