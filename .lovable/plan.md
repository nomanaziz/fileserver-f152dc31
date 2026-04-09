

# বিজ্ঞাপন ফর্ম — লগইন ইউজারের তথ্য অটো-ফিল + ফোন বাধ্যতামূলক

## কী করব
- লগইন করা ইউজারের নাম ও ইমেইল `AuthContext` থেকে অটো নেওয়া হবে, ফর্মে আলাদা input দেখানো হবে না
- ফোন নম্বর **বাধ্যতামূলক** করা হবে
- লগইন না থাকলে `/login` এ রিডাইরেক্ট বা লগইন করতে বলা হবে

## পরিবর্তন — `src/pages/Advertise.tsx`

1. `useAuth()` import করে `user` ও `profile` নেওয়া
2. `form` state থেকে `name` ও `email` সরানো — শুধু `phone` রাখা
3. Contact form section-এ নাম/ইমেইল read-only টেক্সট হিসেবে দেখানো (user এর display_name ও email)
4. Phone input-এ `required` যোগ, validation-এ শুধু phone চেক
5. Submit-এ `user.email`, `profile.display_name`, `form.phone` পাঠানো
6. Phone empty হলে error: "মোবাইল নম্বর আবশ্যক"

