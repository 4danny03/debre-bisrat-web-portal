CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    approved BOOLEAN DEFAULT FALSE
);
