

# Hero Background-এ Random Download Icons যোগ করা

## কী করব
Hero section (`"Download Everything You Need"`) এর background-এ হালকা opacity-তে বিভিন্ন download/tech আইকন ছড়িয়ে দেওয়া হবে — কিছু সোজা, কিছু বাঁকা (rotated), random position-এ। এতে hero section দেখতে আরো আকর্ষণীয় হবে।

## ডিজাইন
- ১৫-২০টি Lucide আইকন ব্যবহার: `Download`, `File`, `Folder`, `Monitor`, `Smartphone`, `Gamepad2`, `Film`, `Music`, `Code`, `Image`, `HardDrive`, `Wifi`, `Globe`, `Shield`, `Zap`, `Cloud`, `Database`, `Terminal` ইত্যাদি
- প্রতিটি আইকন absolute positioned, low opacity (`opacity-[0.04]` বা `opacity-[0.06]`), বিভিন্ন সাইজ (16px-32px)
- বিভিন্ন rotation: `-15deg`, `12deg`, `-30deg`, `20deg` ইত্যাদি
- Hero section-এ `relative overflow-hidden` যোগ করা হবে যেন আইকন বাইরে না যায়
- Content এর নিচে থাকবে (`z-0`), text উপরে (`z-10`)

## ফাইল
- **Edit:** `src/pages/Index.tsx` — hero `<section>`-এ background icon layer যোগ

