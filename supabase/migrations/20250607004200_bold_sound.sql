/*
  # Update profiles table to sync with Stripe subscription status

  This migration updates the profiles table to properly reflect subscription status
  based on the Stripe subscription data.
*/

-- Function to update profile subscription tier based on Stripe subscription
CREATE OR REPLACE FUNCTION update_profile_subscription_tier()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the profile subscription tier based on Stripe subscription status
  UPDATE public.profiles
  SET 
    subscription_tier = CASE 
      WHEN NEW.status = 'active' THEN 'pro'
      ELSE 'free'
    END,
    updated_at = now()
  WHERE id IN (
    SELECT sc.user_id 
    FROM stripe_customers sc 
    WHERE sc.customer_id = NEW.customer_id
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update profile when subscription changes
DROP TRIGGER IF EXISTS on_subscription_change ON stripe_subscriptions;
CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE ON stripe_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_subscription_tier();

-- Update existing profiles based on current subscription status
UPDATE public.profiles
SET subscription_tier = CASE 
  WHEN EXISTS (
    SELECT 1 
    FROM stripe_customers sc
    JOIN stripe_subscriptions ss ON sc.customer_id = ss.customer_id
    WHERE sc.user_id = profiles.id 
    AND ss.status = 'active'
    AND ss.deleted_at IS NULL
  ) THEN 'pro'
  ELSE 'free'
END;