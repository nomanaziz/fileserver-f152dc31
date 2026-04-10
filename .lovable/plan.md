

# Blog ও Contact পেজের 404 ফিক্স

## সমস্যা
`/blog` ও `/contact` রাউট `App.tsx`-এ নেই — পেজ ফাইল আছে কিন্তু রাউট রেজিস্টার হয়নি।

## পরিবর্তন — `src/App.tsx`

1. Import যোগ:
   ```typescript
   import BlogList from "./pages/BlogList";
   import BlogPost from "./pages/BlogPost";
   import Contact from "./pages/Contact";
   ```

2. Routes সেকশনে যোগ (অন্য public route-এর সাথে):
   ```tsx
   <Route path="/blog" element={<BlogList />} />
   <Route path="/blog/:slug" element={<BlogPost />} />
   <Route path="/contact" element={<Contact />} />
   ```

একটাই ফাইল, ৬ লাইন পরিবর্তন।

