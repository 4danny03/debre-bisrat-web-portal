CREATE TABLE prayer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    name TEXT NOT NULL,
    request TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'answered')) DEFAULT 'pending'
);
