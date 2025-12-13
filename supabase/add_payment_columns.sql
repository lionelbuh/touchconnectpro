-- Add payment-related columns to the ideas table
-- Run this in the Supabase SQL Editor

ALTER TABLE ideas 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for faster lookups by customer ID
CREATE INDEX IF NOT EXISTS idx_ideas_stripe_customer_id ON ideas(stripe_customer_id);

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ideas' 
AND column_name IN ('payment_status', 'stripe_customer_id', 'stripe_subscription_id', 'payment_date');
