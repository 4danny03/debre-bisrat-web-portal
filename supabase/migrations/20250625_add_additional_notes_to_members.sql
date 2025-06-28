-- Add additional_notes column to members table for membership registration
ALTER TABLE members ADD COLUMN IF NOT EXISTS additional_notes TEXT;
