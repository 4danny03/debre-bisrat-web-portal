CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    user_id UUID NOT NULL,
    role TEXT CHECK (role IN ('admin', 'super_admin')) NOT NULL
);
