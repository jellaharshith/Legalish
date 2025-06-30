/*
  # Update Specific User to Pro Status

  This migration updates user e72c3164-8001-4cd1-be50-3e019e96d019 to Pro subscription tier
  and ensures the extension can properly detect their Pro status.
*/

-- Update the specific user to Pro status
UPDATE public.profiles 
SET 
  subscription_tier = 'pro',
  updated_at = now()
WHERE id = 'e72c3164-8001-4cd1-be50-3e019e96d019';

-- Also create a stripe customer record if it doesn't exist (for completeness)
INSERT INTO public.stripe_customers (user_id, customer_id, created_at, updated_at)
VALUES (
  'e72c3164-8001-4cd1-be50-3e019e96d019',
  'cus_test_' || 'e72c3164-8001-4cd1-be50-3e019e96d019',
  now(),
  now()
)
ON CONFLICT (user_id) DO NOTHING;

-- Create an active subscription record
INSERT INTO public.stripe_subscriptions (
  customer_id,
  subscription_id,
  price_id,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  status,
  created_at,
  updated_at
)
VALUES (
  'cus_test_' || 'e72c3164-8001-4cd1-be50-3e019e96d019',
  'sub_test_' || 'e72c3164-8001-4cd1-be50-3e019e96d019',
  'price_1RXAXqJIz8cwPcMUHUZxcJ1o',
  extract(epoch from now()),
  extract(epoch from (now() + interval '1 month')),
  false,
  'active',
  now(),
  now()
)
ON CONFLICT (customer_id) DO UPDATE SET
  status = 'active',
  subscription_id = EXCLUDED.subscription_id,
  price_id = EXCLUDED.price_id,
  current_period_start = EXCLUDED.current_period_start,
  current_period_end = EXCLUDED.current_period_end,
  cancel_at_period_end = false,
  updated_at = now();

-- Verify the update
SELECT 
  id,
  email,
  subscription_tier,
  updated_at
FROM public.profiles 
WHERE id = 'e72c3164-8001-4cd1-be50-3e019e96d019';