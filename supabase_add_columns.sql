-- Add entrepreneur_email and entrepreneur_name columns to ideas table
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS entrepreneur_email TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS entrepreneur_name TEXT;

-- Add index on entrepreneur_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_ideas_entrepreneur_email ON ideas(entrepreneur_email);
