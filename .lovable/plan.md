

# Software Request: Login Required + Admin Notify & Fulfill System

## Summary
Software request form-এ login বাধ্যতামূলক করবো — না থাকলে login page-এ redirect। Admin fulfill করলে requester-দের notify করতে পারবে (paid/free হিসেবে) এবং product link auto-attach হবে।

## Database Changes

### 1. Alter `software_requests` table
- Add `fulfilled_product_id uuid` — linked product when fulfilled
- Add `is_notified boolean default false` — whether user was notified

### 2. New table: `software_request_subscribers`
Multiple users can subscribe/vote for the same software request:
- `id` (uuid, PK)
- `request_id` (uuid) — references software_requests
- `user_id` (uuid)
- `created_at`
- Unique constraint on (request_id, user_id)
- RLS: users can manage own subscriptions, admins can view all

## Frontend Changes

### 3. SoftwareRequestForm.tsx
- If `!user`: show "লগইন করুন" message/button instead of the form
- Hide form inputs entirely for non-logged-in users
- Add a "Subscribe" / "আমিও চাই" button on each recent request so logged-in users can subscribe to get notified
- Show subscriber count next to each request

### 4. AdminRequests.tsx — Enhanced fulfill flow
- When admin clicks "Convert" and fulfills:
  - Link the product to the request via `fulfilled_product_id`
  - New "Notify" button appears for fulfilled requests
  - Notify action: inserts a notification/toast for all subscribers of that request
  - Admin can mark as "paid" or "free" — this info goes in the notification
- Show subscriber count per request

### 5. Notification delivery
Since we don't have push notifications or email set up, use an in-app approach:
- New table `notifications` (id, user_id, title, message, link, is_read, created_at)
- RLS: users can view/update own notifications
- When admin clicks "Notify", insert a notification row for each subscriber with the product link
- Add a bell icon in the Header showing unread notification count
- Dropdown showing recent notifications with links

## Files

**Migration**: Add `fulfilled_product_id` and `is_notified` to `software_requests`, create `software_request_subscribers` table, create `notifications` table

**Create**:
- `src/components/NotificationBell.tsx` — bell icon + dropdown in header

**Edit**:
- `src/components/SoftwareRequestForm.tsx` — login gate, subscribe button
- `src/pages/admin/AdminRequests.tsx` — link product, notify subscribers, show counts
- `src/components/layout/Header.tsx` — add NotificationBell

