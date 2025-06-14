/*
  # Legal Glossary Schema

  1. New Tables
    - `legal_glossary`
      - `id` (uuid, primary key)
      - `term` (text, unique, not null)
      - `definition` (text, not null)
      - `category` (text, optional for grouping terms)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `legal_glossary` table
    - Add policy for authenticated users to read glossary terms

  3. Sample Data
    - Common legal terms with plain-language definitions
    - Categorized by contract type for better organization
*/

-- Create legal_glossary table
CREATE TABLE IF NOT EXISTS public.legal_glossary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text UNIQUE NOT NULL,
  definition text NOT NULL,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_glossary ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read glossary terms
CREATE POLICY "Authenticated users can read legal glossary"
  ON public.legal_glossary
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for efficient searching
CREATE INDEX IF NOT EXISTS legal_glossary_term_idx ON public.legal_glossary(term);
CREATE INDEX IF NOT EXISTS legal_glossary_category_idx ON public.legal_glossary(category);

-- Create updated_at trigger (only if the function exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
    DROP TRIGGER IF EXISTS legal_glossary_updated_at ON public.legal_glossary;
    CREATE TRIGGER legal_glossary_updated_at
      BEFORE UPDATE ON public.legal_glossary
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- Insert sample legal terms and definitions
INSERT INTO public.legal_glossary (term, definition, category) VALUES
-- General Contract Terms
('Force Majeure', 'A clause that frees parties from liability when extraordinary circumstances beyond their control prevent them from fulfilling their obligations. Think "acts of God" like natural disasters or wars.', 'general'),
('Indemnification', 'A promise by one party to protect the other from financial loss or legal liability. Essentially, "I''ll cover you if something goes wrong because of my actions."', 'general'),
('Liquidated Damages', 'A predetermined amount of money that must be paid if someone breaks the contract. It''s like agreeing on the "penalty fee" upfront instead of fighting about it later.', 'general'),
('Severability', 'A clause stating that if one part of the contract is found to be invalid or unenforceable, the rest of the contract remains valid. Like removing a bad apple without spoiling the whole bunch.', 'general'),
('Waiver', 'Voluntarily giving up a right or claim. If you waive something, you''re saying "I won''t hold you to this" or "I''m giving up my right to complain about this."', 'general'),
('Arbitration', 'A way to resolve disputes outside of court where a neutral third party makes a binding decision. Often faster and cheaper than going to court, but you give up your right to a jury trial.', 'general'),
('Breach of Contract', 'When someone fails to do what they promised in the contract. Like not paying on time, not delivering goods, or not performing services as agreed.', 'general'),
('Consideration', 'Something of value that each party gives to make the contract legally binding. Usually money, but can be services, goods, or even a promise to do (or not do) something.', 'general'),
('Governing Law', 'Which state or country''s laws will be used to interpret the contract if there''s a dispute. Important because laws vary by location.', 'general'),
('Intellectual Property', 'Creations of the mind like inventions, artistic works, designs, symbols, and names. In contracts, this often determines who owns what was created during the agreement.', 'general'),

-- Employment Contract Terms
('At-Will Employment', 'Employment that can be terminated by either the employer or employee at any time, for any reason (except illegal ones), without advance notice. Most US employment is at-will.', 'employment'),
('Non-Compete Clause', 'A restriction preventing an employee from working for competitors or starting a competing business for a certain period after leaving. Can limit your future job opportunities.', 'employment'),
('Non-Disclosure Agreement (NDA)', 'A promise to keep certain information secret. Common in employment to protect company secrets, customer lists, or proprietary information.', 'employment'),
('Severance Pay', 'Money paid to an employee when their job is terminated, usually based on length of service. Not required by law in most cases, but often negotiated in contracts.', 'employment'),
('Stock Options', 'The right to buy company stock at a fixed price, usually below market value. Common in startups as a way to give employees a stake in the company''s success.', 'employment'),
('Vesting Schedule', 'A timeline that determines when you actually own benefits like stock options or retirement contributions. Usually requires staying with the company for a certain period.', 'employment'),
('Garden Leave', 'When an employee is asked not to work during their notice period but continues to receive pay and benefits. Prevents them from immediately joining competitors.', 'employment'),
('Probationary Period', 'An initial period (usually 3-6 months) where employment terms may be different, often with easier termination rules or reduced benefits.', 'employment'),

-- Lease Agreement Terms
('Security Deposit', 'Money paid upfront to protect the landlord against damage or unpaid rent. Should be returned at the end of the lease if there''s no damage beyond normal wear and tear.', 'lease'),
('Normal Wear and Tear', 'The expected deterioration of a property from ordinary use, like faded paint or worn carpets. Tenants typically aren''t charged for this when they move out.', 'lease'),
('Subletting', 'When a tenant rents out the property (or part of it) to someone else while still being responsible for the original lease. Often requires landlord approval.', 'lease'),
('Lease Assignment', 'Transferring your entire lease to someone else, who then becomes responsible for all obligations. Different from subletting because you''re completely out of the picture.', 'lease'),
('Quiet Enjoyment', 'Your right as a tenant to use the property without unreasonable interference from the landlord. They can''t just show up whenever they want.', 'lease'),
('Habitability', 'The landlord''s obligation to keep the property in livable condition with working plumbing, heating, and other essential services. Also called "warranty of habitability."', 'lease'),
('Notice to Quit', 'A formal notice from the landlord telling you to either fix a problem (like paying late rent) or move out. Usually the first step in the eviction process.', 'lease'),
('Rent Stabilization', 'Laws that limit how much and how often landlords can increase rent. Varies by location and may not apply to all properties.', 'lease'),
('Triple Net Lease', 'A lease where the tenant pays not just rent, but also property taxes, insurance, and maintenance costs. More common in commercial leases.', 'lease'),

-- Financial and Legal Terms
('Escrow', 'Money or documents held by a neutral third party until certain conditions are met. Common in real estate transactions to protect both buyer and seller.', 'general'),
('Lien', 'A legal claim against property as security for a debt. If you don''t pay what you owe, the creditor might be able to take or sell the property.', 'general'),
('Power of Attorney', 'A legal document giving someone else the authority to act on your behalf in legal or financial matters. Can be limited to specific situations or very broad.', 'general'),
('Statute of Limitations', 'The time limit for filing a lawsuit or taking legal action. After this period expires, you generally can''t pursue your claim in court.', 'general'),
('Due Diligence', 'The investigation or research done before entering into a contract or agreement. Like checking someone''s background before hiring them or buying their business.', 'general'),
('Fiduciary Duty', 'A legal obligation to act in someone else''s best interest, putting their needs above your own. Common in relationships like lawyer-client or financial advisor-client.', 'general'),
('Liability', 'Legal responsibility for damages, debts, or obligations. If you''re liable for something, you''re legally required to pay for or fix it.', 'general'),
('Negligence', 'Failure to exercise reasonable care, resulting in harm to others. Not intentional wrongdoing, but carelessness that causes damage.', 'general'),
('Punitive Damages', 'Money awarded to punish someone for particularly bad behavior, not just to compensate for losses. Meant to deter others from similar conduct.', 'general'),
('Tort', 'A wrongful act (other than breach of contract) that causes harm to someone else. Examples include personal injury, defamation, or property damage.', 'general');