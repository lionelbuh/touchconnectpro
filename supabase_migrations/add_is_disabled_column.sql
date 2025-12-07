-- Migration: Add is_disabled column to all application tables
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard -> SQL Editor)
-- This enables the Admin disable/enable user feature

-- Add is_disabled to ideas (entrepreneur applications)
ALTER TABLE ideas 
ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN NOT NULL DEFAULT FALSE;

-- Add is_disabled to mentor_applications
ALTER TABLE mentor_applications 
ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN NOT NULL DEFAULT FALSE;

-- Add is_disabled to coach_applications
ALTER TABLE coach_applications 
ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN NOT NULL DEFAULT FALSE;

-- Add is_disabled to investor_applications
ALTER TABLE investor_applications 
ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN NOT NULL DEFAULT FALSE;

-- Verify the columns were added
SELECT 'ideas' as table_name, column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'ideas' AND column_name = 'is_disabled'
UNION ALL
SELECT 'mentor_applications', column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'mentor_applications' AND column_name = 'is_disabled'
UNION ALL
SELECT 'coach_applications', column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'coach_applications' AND column_name = 'is_disabled'
UNION ALL
SELECT 'investor_applications', column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'investor_applications' AND column_name = 'is_disabled';
