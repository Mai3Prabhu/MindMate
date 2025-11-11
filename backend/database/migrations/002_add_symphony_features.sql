-- Migration: Add Symphony region tracking and resonances
-- Date: 2024-11-11
-- Description: Adds region column to symphony_posts and creates symphony_resonances table

-- Add region column to symphony_posts
ALTER TABLE symphony_posts 
ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'unknown';

-- Create symphony_resonances table for tracking reactions
CREATE TABLE IF NOT EXISTS symphony_resonances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES symphony_posts(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id) -- Prevent duplicate resonances
);

-- Enable RLS on symphony_resonances
ALTER TABLE symphony_resonances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for symphony_resonances
CREATE POLICY "Users can view own resonances" ON symphony_resonances
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resonances" ON symphony_resonances
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resonances" ON symphony_resonances
    FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_symphony_posts_region ON symphony_posts(region);
CREATE INDEX IF NOT EXISTS idx_symphony_posts_emotion ON symphony_posts(emotion_label);
CREATE INDEX IF NOT EXISTS idx_symphony_resonances_post_id ON symphony_resonances(post_id);
CREATE INDEX IF NOT EXISTS idx_symphony_resonances_user_id ON symphony_resonances(user_id);

-- Add comment
COMMENT ON TABLE symphony_resonances IS 'Tracks user resonances (reactions) with Symphony posts';
COMMENT ON COLUMN symphony_posts.region IS 'Geographic region for mood aggregation (e.g., north_america, europe, asia)';
