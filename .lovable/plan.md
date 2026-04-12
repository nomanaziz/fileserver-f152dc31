

# প্রোফাইল পেজে নাম না দেখানোর সমস্যা ফিক্স

## সমস্যা
`Dashboard.tsx`-এ `useState(profile?.display_name || "")` শুধু প্রথম রেন্ডারে initial value নেয়। কিন্তু প্রথম রেন্ডারে `profile` এখনও `null` (async load হচ্ছে), তাই state `""` সেট হয়ে যায়। পরে `profile` লোড হলেও state আপডেট হয় না।

## সমাধান — `src/pages/Dashboard.tsx`

`useEffect` যোগ করে `profile` লোড হলে state আপডেট করব:

```typescript
import { useState, useEffect } from "react";

// existing useState lines stay
const [displayName, setDisplayName] = useState(profile?.display_name || "");
const [phone, setPhone] = useState(profile?.phone || "");

// ADD this useEffect
useEffect(() => {
  if (profile) {
    setDisplayName(profile.display_name || "");
    setPhone(profile.phone || "");
  }
}, [profile]);
```

একটাই ফাইল, ৫ লাইন যোগ।

