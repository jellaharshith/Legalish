/*
  # Add Stripe Customer ID to Profiles

  1. Schema Changes
    - Add `stripe_customer_id` column to profiles table
    - Add `subscription_status` column for more detailed status tracking
    - Add `subscription_period_end` for subscription expiry tracking

  2. Security
    - Maintain existing RLS policies
    - Add index for faster Stripe customer lookups
*/

-- Add Stripe-related columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN stripe_customer_id text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_status text DEFAULT 'inactive';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_period_end'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_period_end timestamptz;
  END IF;
END $$;

-- Create index for faster Stripe customer lookups
CREATE INDEX IF NOT EXISTS profiles_stripe_customer_id_idx ON public.profiles(stripe_customer_id);