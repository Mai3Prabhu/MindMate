-- Add mood tracking columns to meditation_sessions table
-- Run this migration in Supabase SQL Editor

ALTER TABLE meditation_sessions 
ADD COLUMN IF NOT EXISTS before_calmness INTEGER CHECK (before_calmness >= 1 AND before_calmness <= 10),
ADD COLUMN IF NOT EXISTS after_calmness INTEGER CHECK (after_calmness >= 1 AND after_calmness <= 10);

-- Add comment for documentation
COMMENT ON COLUMN meditation_sessions.before_calmness IS 'User calmness rating before meditation (1-10)';
COMMENT ON COLUMN meditation_sessions.after_calmness IS 'User calmness rating after meditation (1-10)';
