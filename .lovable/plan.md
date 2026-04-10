

# Not Accessible কাউন্ট দেখানো

## কাজ
Line 168-এ `offlineCount` variable যোগ করব এবং line 189-এ "Not Accessible" এর পাশে কাউন্ট দেখাব।

## পরিবর্তন — `src/pages/BdixServers.tsx`

1. Line 169 এর পর যোগ:
   ```typescript
   const offlineCount = Array.from(linkStatuses.values()).filter((s) => s === "offline").length;
   ```

2. Line 189 পরিবর্তন:
   ```
   Not Accessible → Not Accessible ({offlineCount})
   ```

একটাই ফাইল, দুই লাইন পরিবর্তন।

