

# বিজ্ঞাপন পেজ রিডিজাইন — Plan Builder স্টাইল + পেমেন্ট সিস্টেম

## কী করব

বর্তমান Advertise পেজকে রেফারেন্স ইমেজের মতো **2-column plan builder** লেআউটে রূপান্তর করব। বাম দিকে বিজ্ঞাপন placements select/deselect, ডান দিকে sticky "Purchase Summary" সাইডবার যেখানে মোট দাম ও পেমেন্ট অপশন দেখাবে।

## লেআউট ডিজাইন

```text
┌─────────────────────────────┐  ┌──────────────────────┐
│  বিজ্ঞাপন প্ল্যান            │  │  Purchase Summary     │
│                             │  │                      │
│  ☐ হেডার ব্যানার  ৳৫,০০০    │  │  হেডার ব্যানার       │
│  ☐ সাইডবার       ৳৩,০০০    │  │  সাইডবার             │
│  ☐ ইন-কন্টেন্ট    ৳২,০০০    │  │                      │
│  ☐ ডাউনলোডের আগে ৳৪,০০০    │  │  Plan Total: ৳৮,০০০  │
│  ☐ ফুটার          ৳১,৫০০    │  │                      │
│                             │  │  মাস সিলেক্ট: [1▼]    │
│  ─── মাস সিলেক্ট ───        │  │                      │
│  [1 মাস] [3 মাস] [6 মাস]   │  │  Total: ৳৮,০০০       │
│  [12 মাস - ২০% ছাড়]        │  │                      │
│                             │  │  [বিকাশ] [নগদ]       │
│  ─── তথ্য ───              │  │  [ব্যাংক ট্রান্সফার]  │
│  নাম, ইমেইল, ফোন           │  │                      │
│                             │  │  [অর্ডার করুন ৳৮,০০০] │
└─────────────────────────────┘  └──────────────────────┘
```

## পরিবর্তন বিস্তারিত

### `src/pages/Advertise.tsx` — সম্পূর্ণ রিডিজাইন

1. **2-column layout**: `grid md:grid-cols-[1fr_360px]` — বাম দিকে selections, ডানে sticky summary
2. **Placement selection cards**: প্রতিটি placement একটি toggle card — click করলে select/deselect, slot availability badge সহ
3. **Duration selector**: 1/3/6/12 মাস বাটন — দীর্ঘমেয়াদী প্যাকেজে discount (3 মাস: ৫%, 6 মাস: ১০%, 12 মাস: ২০%)
4. **Purchase Summary sidebar** (sticky): 
   - নির্বাচিত placements তালিকা
   - মাস অনুযায়ী মূল্য breakdown
   - Discount দেখানো (যদি থাকে)
   - মোট payable amount
5. **Payment method selection**: DB থেকে active `payment_methods` fetch — বিকাশ/নগদ/ব্যাংক দেখানো (existing `SubscriptionCheckout` pattern অনুসরণ)
6. **Contact form**: নাম, ইমেইল, ফোন — summary sidebar-এর নিচে বা বাম কলামের শেষে
7. **Submit**: `ad_inquiries` টেবিলে সব তথ্য সেভ (placements, duration, total price, payment method)

### ফাইল

| ফাইল | কাজ |
|---|---|
| `src/pages/Advertise.tsx` | সম্পূর্ণ রিডিজাইন — plan builder layout |

Stats section ও FAQ নিচে থাকবে যেমন আছে।

