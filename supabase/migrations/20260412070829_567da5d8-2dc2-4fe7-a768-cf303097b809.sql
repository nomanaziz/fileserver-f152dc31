
-- Only insert products that don't already exist (by slug)
INSERT INTO products (title, slug, description, category_id, content_type, os_type, version, file_size, status, is_featured, developer, license_type) VALUES
-- Hollywood (oppenheimer already exists, use different slug)
('Oppenheimer 4K', 'oppenheimer-2023-4k', 'ক্রিস্টোফার নোলান পরিচালিত বায়োপিক 4K।', 'b7b7694c-515c-448e-b08c-82396e260378', 'movie', 'other', '2023', '8 GB', 'published', true, 'Universal Pictures', 'free'),
('Dune Part Two', 'dune-part-two-2024', 'এপিক সায়েন্স ফিকশন সিক্যুয়েল।', 'b7b7694c-515c-448e-b08c-82396e260378', 'movie', 'other', '2024', '5 GB', 'published', true, 'Warner Bros', 'free'),
('The Batman', 'the-batman-2022', 'ডার্ক সুপারহিরো থ্রিলার।', 'b7b7694c-515c-448e-b08c-82396e260378', 'movie', 'other', '2022', '4 GB', 'published', false, 'Warner Bros', 'free'),
('John Wick 4', 'john-wick-chapter-4', 'অ্যাকশন থ্রিলার সিরিজ।', 'b7b7694c-515c-448e-b08c-82396e260378', 'movie', 'other', '2023', '3.8 GB', 'published', false, 'Lionsgate', 'free'),

-- Bollywood
('Pathaan', 'pathaan-2023-bollywood', 'শাহরুখ খানের অ্যাকশন থ্রিলার।', 'c6a50d2d-f920-4f31-95dd-169efaaad517', 'movie', 'other', '2023', '3.5 GB', 'published', true, 'YRF', 'free'),
('Jawan', 'jawan-2023-bollywood', 'শাহরুখ খানের অ্যাকশন ড্রামা।', 'c6a50d2d-f920-4f31-95dd-169efaaad517', 'movie', 'other', '2023', '4 GB', 'published', false, 'Red Chillies', 'free'),
('Animal', 'animal-2023-bollywood', 'রণবীর কাপুরের ক্রাইম ড্রামা।', 'c6a50d2d-f920-4f31-95dd-169efaaad517', 'movie', 'other', '2023', '5.5 GB', 'published', false, 'T-Series', 'free'),
('Dunki', 'dunki-2023-bollywood', 'শাহরুখ খানের কমেডি ড্রামা।', 'c6a50d2d-f920-4f31-95dd-169efaaad517', 'movie', 'other', '2023', '3.2 GB', 'published', false, 'Red Chillies', 'free'),

-- Bangla Movies
('পদ্মা নদীর মাঝি', 'padma-nadir-majhi-bangla', 'ক্লাসিক বাংলা সিনেমা।', '3538079c-8732-42a8-be3e-56371383d0fb', 'movie', 'other', '1993', '1.5 GB', 'published', true, 'BD Films', 'free'),
('হাওয়া', 'hawa-2022-bangla', 'বাংলাদেশি সুপারন্যাচারাল ড্রামা।', '3538079c-8732-42a8-be3e-56371383d0fb', 'movie', 'other', '2022', '2.5 GB', 'published', true, 'Bongo BD', 'free'),
('মনপুরা', 'monpura-bangla-movie', 'রোমান্টিক বাংলা সিনেমা।', '3538079c-8732-42a8-be3e-56371383d0fb', 'movie', 'other', '2009', '1.8 GB', 'published', false, 'Impress Telefilm', 'free'),
('দেবী', 'debi-bangla-movie', 'হুমায়ূন আহমেদের সুপারন্যাচারাল।', '3538079c-8732-42a8-be3e-56371383d0fb', 'movie', 'other', '2018', '2 GB', 'published', false, 'Jaaz Multimedia', 'free'),

-- TV Series
('Breaking Bad', 'breaking-bad-complete', 'ক্লাসিক ক্রাইম ড্রামা সিরিজ।', '9407c945-221e-4b15-a277-087f45433a05', 'movie', 'other', 'S1-S5', '45 GB', 'published', true, 'AMC', 'free'),
('Squid Game S2', 'squid-game-season-2', 'কোরিয়ান থ্রিলার সিরিজ।', '9407c945-221e-4b15-a277-087f45433a05', 'movie', 'other', 'S2', '8 GB', 'published', true, 'Netflix', 'free'),
('The Last of Us', 'the-last-of-us-series', 'পোস্ট-অ্যাপোক্যালিপটিক ড্রামা।', '9407c945-221e-4b15-a277-087f45433a05', 'movie', 'other', 'S1', '12 GB', 'published', false, 'HBO', 'free'),
('Wednesday', 'wednesday-series', 'অ্যাডামস ফ্যামিলি মিস্ট্রি।', '9407c945-221e-4b15-a277-087f45433a05', 'movie', 'other', 'S1', '10 GB', 'published', false, 'Netflix', 'free'),

-- Anime
('Attack on Titan', 'attack-on-titan-complete', 'এপিক অ্যাকশন অ্যানিমে সিরিজ।', '9398c47e-2b7a-4dfc-a223-de6572a7e1f2', 'movie', 'other', 'Complete', '60 GB', 'published', true, 'WIT Studio', 'free'),
('Demon Slayer', 'demon-slayer-anime', 'জনপ্রিয় শোনেন অ্যানিমে।', '9398c47e-2b7a-4dfc-a223-de6572a7e1f2', 'movie', 'other', 'S1-S4', '35 GB', 'published', true, 'ufotable', 'free'),
('Jujutsu Kaisen', 'jujutsu-kaisen-anime', 'ডার্ক ফ্যান্টাসি অ্যাকশন অ্যানিমে।', '9398c47e-2b7a-4dfc-a223-de6572a7e1f2', 'movie', 'other', 'S1-S2', '25 GB', 'published', false, 'MAPPA', 'free'),
('One Piece', 'one-piece-anime', 'এডভেঞ্চার পাইরেট অ্যানিমে।', '9398c47e-2b7a-4dfc-a223-de6572a7e1f2', 'movie', 'other', '1100+', '500 GB', 'published', false, 'Toei', 'free'),

-- Documentaries
('Planet Earth III', 'planet-earth-3-doc', 'প্রকৃতি ডকুমেন্টারি সিরিজ।', '742bf2f5-0d0c-422f-8d43-e6768171ea10', 'movie', 'other', '2023', '15 GB', 'published', true, 'BBC', 'free'),
('Cosmos Odyssey', 'cosmos-possible-worlds', 'মহাকাশ ডকুমেন্টারি সিরিজ।', '742bf2f5-0d0c-422f-8d43-e6768171ea10', 'movie', 'other', 'S3', '12 GB', 'published', false, 'Fox', 'free'),
('Our Planet', 'our-planet-netflix-doc', 'Netflix প্রকৃতি ডকুমেন্টারি।', '742bf2f5-0d0c-422f-8d43-e6768171ea10', 'movie', 'other', 'S1-S2', '20 GB', 'published', false, 'Netflix', 'free'),
('The Social Dilemma', 'social-dilemma-doc', 'সোশ্যাল মিডিয়া ডকুমেন্টারি।', '742bf2f5-0d0c-422f-8d43-e6768171ea10', 'movie', 'other', '2020', '2 GB', 'published', false, 'Netflix', 'free'),

-- Tutorials
('Python মাস্টারক্লাস', 'python-masterclass-bangla', 'পাইথন A to Z বাংলায়।', '47ef340f-45c2-4cb7-b5e8-28d5bc404813', 'tutorial', 'other', '2024', '8 GB', 'published', true, 'BDTech Academy', 'free'),
('Java Complete', 'java-complete-course', 'জাভা প্রোগ্রামিং কমপ্লিট কোর্স।', '47ef340f-45c2-4cb7-b5e8-28d5bc404813', 'tutorial', 'other', '2024', '12 GB', 'published', false, 'CodeBangla', 'free'),
('C++ DSA Course', 'cpp-dsa-course', 'C++ ডেটা স্ট্রাকচার ও অ্যালগরিদম।', '47ef340f-45c2-4cb7-b5e8-28d5bc404813', 'tutorial', 'other', '2024', '15 GB', 'published', false, 'CS Academy', 'free'),
('JavaScript ES6+', 'javascript-es6-tutorial', 'মডার্ন জাভাস্ক্রিপ্ট টিউটোরিয়াল।', '47ef340f-45c2-4cb7-b5e8-28d5bc404813', 'tutorial', 'other', '2024', '6 GB', 'published', false, 'WebDev BD', 'free'),

('React Full Course', 'react-full-course-bangla', 'React.js কমপ্লিট কোর্স বাংলায়।', 'e75b295d-c4fb-4c3d-b13d-39f5872eb628', 'tutorial', 'other', '2024', '10 GB', 'published', true, 'WebDev BD', 'free'),
('Next.js 15 Course', 'nextjs-15-tutorial', 'Next.js দিয়ে ফুলস্ট্যাক ওয়েব।', 'e75b295d-c4fb-4c3d-b13d-39f5872eb628', 'tutorial', 'other', '2024', '8 GB', 'published', false, 'DevTech BD', 'free'),
('Laravel Complete', 'laravel-complete-bangla', 'Laravel PHP ফ্রেমওয়ার্ক কমপ্লিট।', 'e75b295d-c4fb-4c3d-b13d-39f5872eb628', 'tutorial', 'other', '2024', '14 GB', 'published', false, 'PHP Academy', 'free'),
('WordPress Theme', 'wordpress-theme-dev', 'WordPress থিম ডেভেলপমেন্ট।', 'e75b295d-c4fb-4c3d-b13d-39f5872eb628', 'tutorial', 'other', '2024', '5 GB', 'published', false, 'WP Bangla', 'free'),

('Photoshop মাস্টার', 'photoshop-master-bangla', 'ফটোশপ বিগিনার টু অ্যাডভান্সড।', '6a4f70e1-7dab-4e42-89ca-2a7aca1246b6', 'tutorial', 'other', '2024', '9 GB', 'published', true, 'Design BD', 'free'),
('Illustrator Course', 'illustrator-complete-bangla', 'ভেক্টর ডিজাইন শিখুন বাংলায়।', '6a4f70e1-7dab-4e42-89ca-2a7aca1246b6', 'tutorial', 'other', '2024', '7 GB', 'published', false, 'DesignPro BD', 'free'),
('Figma UI/UX', 'figma-ui-ux-bangla', 'Figma দিয়ে UI/UX ডিজাইন।', '6a4f70e1-7dab-4e42-89ca-2a7aca1246b6', 'tutorial', 'other', '2024', '4 GB', 'published', false, 'UIUX BD', 'free'),
('Logo Design', 'logo-design-course-bangla', 'লোগো ডিজাইন মাস্টারক্লাস।', '6a4f70e1-7dab-4e42-89ca-2a7aca1246b6', 'tutorial', 'other', '2024', '3 GB', 'published', false, 'BrandBD', 'free'),

('Premiere Pro', 'premiere-pro-bangla', 'ভিডিও এডিটিং শিখুন বাংলায়।', '64d49501-5541-4645-9fce-18521868a5bd', 'tutorial', 'other', '2024', '11 GB', 'published', true, 'VideoEdit BD', 'free'),
('After Effects', 'after-effects-course-bangla', 'মোশন গ্রাফিক্স ও VFX।', '64d49501-5541-4645-9fce-18521868a5bd', 'tutorial', 'other', '2024', '13 GB', 'published', false, 'FX Academy', 'free'),
('DaVinci Resolve', 'davinci-resolve-bangla', 'ফ্রি ভিডিও এডিটিং সফটওয়্যার শিখুন।', '64d49501-5541-4645-9fce-18521868a5bd', 'tutorial', 'other', '2024', '6 GB', 'published', false, 'EditPro BD', 'free'),
('CapCut Pro', 'capcut-pro-tutorial', 'CapCut দিয়ে প্রফেশনাল এডিটিং।', '64d49501-5541-4645-9fce-18521868a5bd', 'tutorial', 'other', '2024', '2 GB', 'published', false, 'TikTok Academy', 'free'),

('MikroTik MTCNA', 'mikrotik-mtcna-bangla', 'MikroTik নেটওয়ার্কিং কোর্স।', 'f6d9380f-5f91-439c-bbe3-7ab66ddc6778', 'tutorial', 'other', '2024', '8 GB', 'published', true, 'NetBD Academy', 'free'),
('CCNA Complete', 'ccna-complete-bangla', 'Cisco CCNA সার্টিফিকেশন কোর্স।', 'f6d9380f-5f91-439c-bbe3-7ab66ddc6778', 'tutorial', 'other', '2024', '15 GB', 'published', false, 'NetPro BD', 'free'),
('Linux Admin', 'linux-admin-bangla', 'লিনাক্স সার্ভার অ্যাডমিন।', 'f6d9380f-5f91-439c-bbe3-7ab66ddc6778', 'tutorial', 'other', '2024', '10 GB', 'published', false, 'SysAdmin BD', 'free'),
('Ethical Hacking', 'ethical-hacking-bangla', 'সাইবার সিকিউরিটি ও হ্যাকিং।', 'f6d9380f-5f91-439c-bbe3-7ab66ddc6778', 'tutorial', 'other', '2024', '12 GB', 'published', false, 'CyberBD', 'free'),

('Fiverr মাস্টার', 'fiverr-master-bangla', 'Fiverr ফ্রিল্যান্সিং A to Z।', '212cdc7e-4afa-4be9-b733-906ddab66751', 'tutorial', 'other', '2024', '5 GB', 'published', true, 'FreelanceBD', 'free'),
('Upwork Success', 'upwork-success-bangla', 'Upwork এ সফল ক্যারিয়ার।', '212cdc7e-4afa-4be9-b733-906ddab66751', 'tutorial', 'other', '2024', '4 GB', 'published', false, 'WorkBD', 'free'),
('Digital Marketing', 'digital-marketing-bangla', 'ডিজিটাল মার্কেটিং কমপ্লিট।', '212cdc7e-4afa-4be9-b733-906ddab66751', 'tutorial', 'other', '2024', '7 GB', 'published', false, 'MarketBD', 'free'),
('SEO মাস্টারক্লাস', 'seo-masterclass-bangla', 'সার্চ ইঞ্জিন অপটিমাইজেশন।', '212cdc7e-4afa-4be9-b733-906ddab66751', 'tutorial', 'other', '2024', '3 GB', 'published', false, 'SEOBD', 'free'),

-- Source Code
('eCommerce Laravel', 'ecommerce-laravel-source', 'কমপ্লিট eCommerce সোর্স কোড Laravel।', '74afdf90-631c-46e1-b068-60114f866ae2', 'other', 'other', '2024', '50 MB', 'published', true, 'DevBD', 'free'),
('Blog CMS React', 'blog-cms-react-source', 'React + Node.js ব্লগ CMS।', '74afdf90-631c-46e1-b068-60114f866ae2', 'other', 'other', '2024', '35 MB', 'published', false, 'WebStack BD', 'free'),
('Chat App Flutter', 'chat-app-flutter-source', 'Flutter রিয়েলটাইম চ্যাট অ্যাপ।', '74afdf90-631c-46e1-b068-60114f866ae2', 'other', 'other', '2024', '25 MB', 'published', false, 'AppDev BD', 'free'),
('POS System PHP', 'pos-system-php-source', 'Point of Sale সিস্টেম PHP।', '74afdf90-631c-46e1-b068-60114f866ae2', 'other', 'other', '2024', '40 MB', 'published', false, 'SoftBD', 'free')
ON CONFLICT (slug) DO NOTHING;

-- Link all unlinked products to product_categories
INSERT INTO product_categories (product_id, category_id)
SELECT id, category_id FROM products 
WHERE category_id IS NOT NULL 
AND id NOT IN (SELECT product_id FROM product_categories)
ON CONFLICT DO NOTHING;
