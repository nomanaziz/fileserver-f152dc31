
-- Add status column to subscriptions
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Add gateway_response to payments
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS gateway_response jsonb;

-- Add INSERT policy for payments (users need to create payments)
CREATE POLICY "Users can create own payments"
ON public.payments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add INSERT policy for subscriptions
CREATE POLICY "Users can create own subscriptions"
ON public.subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);
