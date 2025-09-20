-- Migration: Add action_id column to actions table
-- Run this in your Supabase SQL editor

-- Add action_id column to actions table
ALTER TABLE actions ADD COLUMN IF NOT EXISTS action_id TEXT;

-- Update existing records to have action_id (if any exist)
-- This will set a default action_id for existing records
UPDATE actions SET action_id = 'legacy-' || id::text WHERE action_id IS NULL;

-- Make action_id NOT NULL after setting default values
ALTER TABLE actions ALTER COLUMN action_id SET NOT NULL;

-- Add index for better performance when querying by action_id
CREATE INDEX IF NOT EXISTS idx_actions_action_id ON actions(action_id);
