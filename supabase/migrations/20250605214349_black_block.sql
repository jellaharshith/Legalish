/*
  # Analyses Table for Legal Terms History

  1. New Tables
    - `analyses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `input_text` (text)
      - `input_url` (text, nullable)
      - `input_file_name` (text, nullable)
      - `summary_data` (jsonb)
      - `red_flags_data` (jsonb)
      - `created_at` (timestamptz)
      - `analysis_time_ms` (integer)

  2. Security
    - Enable RLS on `analyses` table
    - Add policies for users to:
      - Insert their own analyses
      - View their own analyses
*/

-- Create analyses table
CREATE TABLE IF NOT EXISTS public.analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  input_text text NOT NULL,
  input_url text,
  input_file_name text,
  summary_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  red_flags_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  analysis_time_ms integer
);

-- Enable RLS
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own analyses"
  ON public.analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analyses"
  ON public.analyses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX analyses_user_id_idx ON public.analyses(user_id);
CREATE INDEX analyses_created_at_idx ON public.analyses(created_at DESC);