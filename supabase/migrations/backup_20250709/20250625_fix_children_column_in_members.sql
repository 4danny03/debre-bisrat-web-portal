-- Ensure children column exists and is JSONB for membership registration
ALTER TABLE members ADD COLUMN IF NOT EXISTS children JSONB;
