CREATE TABLE sermons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    title TEXT NOT NULL,
    preacher TEXT NOT NULL,
    sermon_date DATE NOT NULL,
    video_url TEXT,
    notes TEXT
);
