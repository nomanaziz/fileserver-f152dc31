

# BD IX — লিংক সংখ্যা সমস্যা ও RAM অপটিমাইজেশন

## সমস্যা
- ২৫৮টা সার্ভার, কিন্তু প্রতিটায় গড়ে ২+ লিংক → মোট ৫৪৯টা লিংক চেক হচ্ছে
- ৫৪৯টা concurrent/batch fetch = RAM ও CPU চাপ

## কী করব

### ১. Batch size কমানো ও throttling
- বর্তমান `BATCH_SIZE = 5` — এটা ঠিক আছে কিন্তু batch-এর মধ্যে delay যোগ করব (500ms per batch)
- এতে একসাথে সব fetch queue-তে জমা হবে না

### ২. AbortController cleanup উন্নত করা
- প্রতিটা individual fetch-এর জন্য আলাদা `AbortController` আছে কিন্তু parent abort-এ cleanup ঠিকমতো হচ্ছে না
- `clearTimeout` দুইবার কল হচ্ছে (redundant `timeoutId`) — এটা পরিষ্কার করব

### ৩. ক্যাশ already আছে — ঠিকমতো কাজ করছে কিনা verify
- ২৪ ঘণ্টার localStorage cache ইতোমধ্যে আছে — প্রথমবার ছাড়া আর চেক হওয়ার কথা না
- Cache hit হলে ৫৪৯টা fetch একদমই হবে না

### ৪. UI-তে সার্ভার vs লিংক সংখ্যা পরিষ্কার করা
- ট্যাবে সার্ভার সংখ্যা দেখাচ্ছে (২০২, ৫২, ৪) — এটা ঠিক আছে
- নিচের status bar-এ "চেক হচ্ছে... (X/554)" দেখাচ্ছে — এখানে লিখব "৫৪৯টা লিংক চেক হচ্ছে (২৫৮ সার্ভারে)"

## ফাইল পরিবর্তন

| ফাইল | কাজ |
|---|---|
| `src/hooks/useAccessibilityCheck.ts` | Batch delay যোগ, redundant timeout সরানো, memory leak fix |
| `src/pages/BdixServers.tsx` | Status text-এ সার্ভার vs লিংক সংখ্যা পরিষ্কার |

## টেকনিক্যাল বিবরণ

**Batch delay:**
```typescript
// প্রতি batch-এর পর 500ms wait
for (let i = 0; i < links.length; i += BATCH_SIZE) {
  const batch = links.slice(i, i + BATCH_SIZE);
  await Promise.allSettled(batch.map(checkLink));
  if (i + BATCH_SIZE < links.length) {
    await new Promise(r => setTimeout(r, 500));
  }
}
```

**Redundant code cleanup** — `checkLink` ফাংশনে দুইটা timeout আছে (`timeoutId` + `linkTimeout`), একটা রাখব।

