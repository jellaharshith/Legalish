/*
  # Contract Chunks Table for RAG System

  1. New Tables
    - `contract_chunks`
      - `id` (uuid, primary key)
      - `doc_name` (text) - Document type identifier
      - `chunk_text` (text) - The actual chunk content
      - `chunk_index` (integer) - Order within document
      - `doc_type` (text) - general, lease, employment
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `contract_chunks` table
    - Add policies for authenticated users to read chunks
    - Add indexes for efficient querying

  3. Sample Data
    - Insert example chunks for each document type
    - Provide training examples for different tones and contract types
*/

-- Create contract_chunks table
CREATE TABLE IF NOT EXISTS public.contract_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_name text NOT NULL,
  chunk_text text NOT NULL,
  chunk_index integer NOT NULL DEFAULT 0,
  doc_type text NOT NULL DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contract_chunks ENABLE ROW LEVEL SECURITY;

-- Create policies - allow all authenticated users to read chunks
CREATE POLICY "Authenticated users can read contract chunks"
  ON public.contract_chunks
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for efficient querying
CREATE INDEX contract_chunks_doc_name_idx ON public.contract_chunks(doc_name);
CREATE INDEX contract_chunks_doc_type_idx ON public.contract_chunks(doc_type);
CREATE INDEX contract_chunks_chunk_index_idx ON public.contract_chunks(chunk_index);

-- Insert sample chunks for general contracts
INSERT INTO public.contract_chunks (doc_name, chunk_text, chunk_index, doc_type) VALUES
('general_terms_examples', 'This agreement establishes the terms between parties for service provision. Key elements include payment schedules, deliverables, and termination clauses. Red flags to watch: unlimited liability, vague scope definitions, and one-sided termination rights.', 1, 'general'),
('general_terms_examples', 'Payment terms should specify amounts, due dates, and late fees. Concerning clauses include: "payment at our sole discretion," automatic renewals without notice, and penalties exceeding actual damages.', 2, 'general'),
('general_terms_examples', 'Intellectual property clauses define ownership of work products. Warning signs: broad IP assignments, perpetual licenses, and claims to pre-existing IP. Fair terms clearly distinguish between work-for-hire and retained rights.', 3, 'general'),
('general_terms_examples', 'Termination provisions should be mutual and reasonable. Red flags include: termination without cause by one party only, excessive notice periods, and post-termination restrictions that are overly broad.', 4, 'general'),
('general_terms_examples', 'Dispute resolution clauses specify how conflicts are handled. Concerning terms: mandatory arbitration in distant locations, waiver of class action rights, and one-sided attorney fee provisions.', 5, 'general');

-- Insert sample chunks for lease agreements
INSERT INTO public.contract_chunks (doc_name, chunk_text, chunk_index, doc_type) VALUES
('lease_agreement_examples', 'Residential lease agreements define tenant and landlord obligations. Critical elements: rent amount, security deposits, maintenance responsibilities, and lease duration. Red flags: excessive fees, unclear maintenance duties, and restrictive guest policies.', 1, 'lease'),
('lease_agreement_examples', 'Security deposit terms should specify amount, conditions for return, and timeline. Warning signs: non-refundable deposits labeled as "fees," vague damage definitions, and automatic forfeiture clauses.', 2, 'lease'),
('lease_agreement_examples', 'Maintenance and repair clauses allocate responsibilities between parties. Concerning provisions: tenant responsible for all repairs, landlord entry without proper notice, and penalties for normal wear and tear.', 3, 'lease'),
('lease_agreement_examples', 'Early termination clauses should be fair and clearly defined. Red flags: excessive penalties, no early termination allowed, and forfeiture of entire security deposit for early departure.', 4, 'lease'),
('lease_agreement_examples', 'Pet and guest policies should be reasonable and clearly stated. Warning signs: blanket pet bans, excessive pet deposits, and unreasonable restrictions on overnight guests.', 5, 'lease');

-- Insert sample chunks for employment contracts
INSERT INTO public.contract_chunks (doc_name, chunk_text, chunk_index, doc_type) VALUES
('employment_contract_examples', 'Employment agreements define the relationship between employer and employee. Key components: job duties, compensation, benefits, and termination procedures. Red flags: vague job descriptions, below-market compensation, and excessive non-compete clauses.', 1, 'employment'),
('employment_contract_examples', 'Compensation and benefits should be clearly detailed. Warning signs: unpaid overtime expectations, benefit reductions without notice, and commission structures that favor the employer disproportionately.', 2, 'employment'),
('employment_contract_examples', 'Non-compete and confidentiality clauses should be reasonable in scope and duration. Concerning terms: overly broad non-competes, indefinite confidentiality periods, and restrictions on future employment opportunities.', 3, 'employment'),
('employment_contract_examples', 'Termination provisions should specify notice periods and severance. Red flags: at-will termination with no severance, immediate termination for minor infractions, and forfeiture of earned benefits upon termination.', 4, 'employment'),
('employment_contract_examples', 'Intellectual property clauses in employment should distinguish between work-related and personal creations. Warning signs: claims to all employee inventions, broad assignment of pre-existing IP, and restrictions on personal projects.', 5, 'employment');

-- Create updated_at trigger for contract_chunks
CREATE OR REPLACE TRIGGER contract_chunks_updated_at
  BEFORE UPDATE ON public.contract_chunks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();