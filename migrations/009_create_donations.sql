CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    donor_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    donation_date DATE NOT NULL,
    notes TEXT
);
