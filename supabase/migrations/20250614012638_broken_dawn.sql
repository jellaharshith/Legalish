/*
  # Remove Legal Glossary Table

  This migration removes the legal_glossary table and all associated objects:
  - Drops the table and all its data
  - Removes associated indexes
  - Removes RLS policies
  - Removes triggers

  ## Changes
  1. Drop legal_glossary table
  2. Clean up any remaining references
*/

-- Drop the legal_glossary table and all associated objects
DROP TABLE IF EXISTS public.legal_glossary CASCADE;

-- Note: CASCADE will automatically remove:
-- - All indexes on the table
-- - All triggers on the table  
-- - All policies on the table
-- - Any foreign key constraints referencing the table

-- Verify cleanup by checking if any orphaned policies remain
-- (This is just for safety, CASCADE should handle everything)
DO $$
BEGIN
  -- Remove any orphaned policies that might remain
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'legal_glossary'
  ) THEN
    DROP POLICY IF EXISTS "Authenticated users can read legal glossary" ON public.legal_glossary;
  END IF;
END $$;