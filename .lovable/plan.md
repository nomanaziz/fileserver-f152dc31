

# BD IX — Accessibility Filter ও www লিংক রিমুভ

## ১. Accessibility Filter যোগ
BD IX পেজে search bar-এর পাশে একটা Select/dropdown filter যোগ করব:
- **All** (সব দেখাও) — default
- **Accessible Only** (শুধু online)
- **Inaccessible Only** (শুধু offline)

Filter কাজ করবে server level-এ — যদি একটা সার্ভারের কোনো লিংকই accessible না হয়, তাহলে "Accessible Only" তে সেই সার্ভার লুকাবে। আর accordion-এর ভেতরে individual লিংকগুলোও filter হবে।

## ২. www লিংক রিমুভ (DB Migration)
ডাটাবেসে ১২১টা www লিংক আছে। এগুলো থেকে www. সরিয়ে দিব। শুধু ১টা actual duplicate আছে (jagobd.com) — সেটাও handle হবে।

**Migration SQL:**
```sql
UPDATE bdix_servers SET links = (
  SELECT array_agg(DISTINCT regexp_replace(link, '(https?://)www\.', '\1'))
  FROM unnest(links) AS link
);
```

## ফাইল পরিবর্তন

| ফাইল | কাজ |
|---|---|
| `src/pages/BdixServers.tsx` | Filter dropdown (All/Accessible/Inaccessible) যোগ, server ও link filtering logic |
| Migration SQL | www. রিমুভ করে লিংক আপডেট |

