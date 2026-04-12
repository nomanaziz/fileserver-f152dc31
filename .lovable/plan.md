

# Admin Users — Bulk Operations

## কী যোগ হবে

1. **Checkbox দিয়ে bulk select** — প্রতিটা row-তে checkbox + header-এ "Select All" checkbox
2. **Bulk action toolbar** — selected users থাকলে toolbar দেখাবে:
   - **Bulk Role Change** — সব selected user-এর role একসাথে পরিবর্তন
   - **Bulk Activate** — সব selected user activate
   - **Bulk Deactivate** — সব selected user deactivate
   - **Bulk Delete** — role remove + deactivate (profiles-এ DELETE policy নেই, তাই deactivate + role remove)
3. **Selected count indicator** — "৫ জন সিলেক্ট করা হয়েছে" দেখাবে

## পরিবর্তন

শুধু একটা ফাইল: `src/pages/admin/AdminUsers.tsx`

- `selectedIds` state (Set of user IDs)
- Header-এ Checkbox → toggle all filtered users
- প্রতি row-তে Checkbox
- Selected থাকলে toolbar bar দেখাবে (sticky top):
  - Role dropdown (Admin/Moderator/User) + "Apply" button
  - Activate All button
  - Deactivate All button
  - Delete button (deactivate + remove roles)
- Confirmation dialog bulk delete-এর জন্য (AlertDialog)
- Bulk mutations: loop করে প্রতিটা user-এর জন্য update/delete call

## টেকনিক্যাল নোট

- DB change লাগবে না — existing RLS policies যথেষ্ট (admin ALL on profiles update, admin ALL on user_roles)
- Bulk delete = `profiles.update({ is_active: false })` + `user_roles.delete()` — সত্যিকার user delete client-side থেকে সম্ভব না (auth.users access লাগে)
- Checkbox component already আছে (`@/components/ui/checkbox`)

