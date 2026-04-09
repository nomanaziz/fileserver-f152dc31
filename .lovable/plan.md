

# বিজ্ঞাপন ফর্মে Multi-Select Placement + Google Ads Option যোগ

## কী করব
অর্ডার ফর্মে একটি checkbox-based multi-select যোগ করা হবে যেখানে ইউজার একাধিক বিজ্ঞাপন স্থান select করতে পারবে। সাথে "Google Ads" option-ও থাকবে। উপরের card-click single select সরিয়ে ফর্মের ভেতরেই placement selection থাকবে।

## পরিবর্তন

### `src/pages/Advertise.tsx`
1. **State পরিবর্তন**: `selected: string | null` → `selectedPlacements: string[]` (array for multi-select)
2. **ফর্মে Checkbox Group যোগ**: নাম/ইমেইল ফিল্ডের আগে "আপনার কাঙ্ক্ষিত বিজ্ঞাপন নির্বাচন করুন" label সহ checkbox list — ৪টি existing placement + "Google Ads" option
3. **Placement card click**: উপরের placement card গুলোতে click করলেও array-তে toggle হবে (multi-select)
4. **নির্বাচিত summary**: ফর্মে selected placement গুলোর নাম ও মোট মূল্য দেখাবে
5. **Submit**: `placement` ফিল্ডে comma-separated string বা JSON array পাঠাবে (যেমন `"header-banner,sidebar,google-ads"`)
6. **Google Ads entry**: placements array-তে নতুন item — `{ id: "google-ads", name: "Google Ads", size: "কাস্টম", price: 0 (আলোচনা সাপেক্ষে), icon: Globe, description: "Google Ads ক্যাম্পেইন সেটআপ ও ম্যানেজমেন্ট" }`

### ফাইল
- **Edit:** `src/pages/Advertise.tsx`

