
# Footer পুনর্গঠন — ৩ কলাম, ডুপ্লিকেট সরানো, আইনি inline

## পরিকল্পনা

৪টি মেনু কলাম → ৩টিতে কমানো। "আইনি" কে আলাদা কলাম না রেখে copyright bar-এ inline links হিসেবে রাখা হবে (Privacy Policy · Terms · DMCA)। ডুপ্লিকেট লিংক সরানো হবে।

### Grid: `md:grid-cols-4` (Brand col-span-2 + ২টি মেনু কলাম)

**কলাম ১-২ (Brand):** যেমন আছে  
**কলাম ৩ — গুরুত্বপূর্ণ লিংক:** হোম, ক্যাটাগরি, প্রাইসিং, লাইভ টিভি, বিজ্ঞাপন দিন, যোগাযোগ  
**কলাম ৪ — তথ্য:** আমাদের সম্পর্কে, ব্লগ, FAQ, রিফান্ড পলিসি, ভেন্ডর হোন  

**Copyright bar-এ (নিচে):** প্রাইভেসি পলিসি · শর্তাবলী · DMCA — inline links, separator দিয়ে

### ফাইল
- **Edit:** `src/components/layout/Footer.tsx` — grid `md:grid-cols-4`, ৩য় "আইনি" কলাম সরিয়ে copyright row-তে inline legal links যোগ
