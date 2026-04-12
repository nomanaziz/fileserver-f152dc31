

# Admin Users — Bulk Operations যোগ করা

## কী যোগ হবে

1. **Checkbox দিয়ে bulk select** — প্রতিটা row-তে checkbox + header-এ "Select All" checkbox
2. **Bulk action toolbar** — selected users থাকলে toolbar দেখাবে:
   - **Bulk Role Change** — সব selected user-এর role একসাথে পরিবর্তন (Admin/Moderator/User)
   - **Bulk Activate** — সব selected user activate
   - **Bulk Deactivate** — সব selected user deactivate
   - **Bulk Delete** — সব selected user ডিলিট (profiles + user_roles থেকে)
3. **Selected count** দেখাবে toolbar-এ (যেমন "৫ জন সিলেক্ট করা হয়েছে")
4. **Confirmation dialog** — Delete-এর আগে confirm করতে হবে

## পরিবর্তন

**শুধু ১টা ফাইল:** `src/pages/admin/AdminUsers.tsx`

- `selectedIds` state (Set) যোগ
- Header checkbox → toggle all filtered users
- Row checkbox → toggle individual
- Bulk toolbar UI (selected > 0 হলে দেখাবে)
- `bulkChangeRole`, `bulkToggleActive`, `bulkDelete` mutations
- Delete-এ AlertDialog confirmation

**DB migration লাগবে না** — profiles table-এ admin-এর ইতিমধ্যে ALL access আছে, user_roles-এও admin ALL access আছে। Delete policy profiles-এ নেই, তবে admin ALL policy আছে user_roles-এ। profiles-এ delete নেই, তাই deactivate-ই primary action হবে। user_roles delete admin পারে।

**Note:** profiles table-এ admin-এর DELETE policy নেই (শুধু SELECT, UPDATE আছে)। তাই "Bulk Delete" আসলে user deactivate করবে + তাদের role remove করবে। সত্যিকারের user delete করতে হলে auth.users থেকে delete লাগে যেটা client-side থেকে করা যায় না — এটা service_role key দিয়ে edge function লাগবে। আপাতত bulk deactivate + role remove-ই করব।

