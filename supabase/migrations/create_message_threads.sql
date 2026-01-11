-- Create message_threads table for entrepreneur-mentor messaging
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/mfkxbjtrxwajlyxnxzdn/sql/new

CREATE TABLE IF NOT EXISTS public.message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entrepreneur_email TEXT NOT NULL,
  mentor_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  entries JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_message_threads_entrepreneur_email 
  ON public.message_threads(entrepreneur_email);

CREATE INDEX IF NOT EXISTS idx_message_threads_mentor_email 
  ON public.message_threads(mentor_email);

CREATE INDEX IF NOT EXISTS idx_message_threads_status 
  ON public.message_threads(status);

CREATE INDEX IF NOT EXISTS idx_message_threads_updated_at 
  ON public.message_threads(updated_at DESC);

-- Enable Row Level Security (optional, can be adjusted based on your auth needs)
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows authenticated users to see their own threads
-- (Adjust this based on your security requirements)
CREATE POLICY "Users can view their own message threads" ON public.message_threads
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert message threads" ON public.message_threads
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own message threads" ON public.message_threads
  FOR UPDATE
  USING (true);

-- Grant access to authenticated and anon roles
GRANT SELECT, INSERT, UPDATE ON public.message_threads TO anon;
GRANT SELECT, INSERT, UPDATE ON public.message_threads TO authenticated;
GRANT ALL ON public.message_threads TO service_role;

-- Comment on table
COMMENT ON TABLE public.message_threads IS 'Threaded messaging between entrepreneurs and mentors';
COMMENT ON COLUMN public.message_threads.entries IS 'JSON array of message entries: [{sender_role, sender_email, sender_name, message, timestamp, attachments}]';
