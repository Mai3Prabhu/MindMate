-- Add Focus Mode, Content Library, Journal, and Symphony tables
-- Run this migration in Supabase SQL Editor

-- Focus Mode Sessions Table
CREATE TABLE IF NOT EXISTS focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    duration_minutes INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    environment TEXT, -- morning, day, evening
    tree_stage TEXT, -- sprout, sapling, tree
    before_focus_level INTEGER CHECK (before_focus_level >= 1 AND before_focus_level <= 10),
    after_focus_level INTEGER CHECK (after_focus_level >= 1 AND after_focus_level <= 10),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Focus Streaks Table
CREATE TABLE IF NOT EXISTS focus_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_session_date DATE,
    total_sessions INTEGER DEFAULT 0,
    total_minutes INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Content Library Items Table
CREATE TABLE IF NOT EXISTS content_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- Article, Video, Podcast, Activity
    category TEXT NOT NULL,
    duration TEXT,
    thumbnail TEXT,
    description TEXT,
    link TEXT NOT NULL,
    tags TEXT[],
    featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Content Interactions Table
CREATE TABLE IF NOT EXISTS user_content_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    liked BOOLEAN DEFAULT FALSE,
    saved BOOLEAN DEFAULT FALSE,
    viewed BOOLEAN DEFAULT FALSE,
    completed BOOLEAN DEFAULT FALSE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_started_at ON focus_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_focus_streaks_user_id ON focus_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_content_items_category ON content_items(category);
CREATE INDEX IF NOT EXISTS idx_content_items_type ON content_items(type);
CREATE INDEX IF NOT EXISTS idx_user_content_interactions_user_id ON user_content_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_content_interactions_content_id ON user_content_interactions(content_id);

-- Row Level Security
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Focus Sessions
CREATE POLICY "Users can view own focus sessions" ON focus_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own focus sessions" ON focus_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own focus sessions" ON focus_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Focus Streaks
CREATE POLICY "Users can view own focus streaks" ON focus_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own focus streaks" ON focus_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own focus streaks" ON focus_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Content Items (public read, admin write)
CREATE POLICY "Anyone can view content items" ON content_items
    FOR SELECT USING (true);

-- RLS Policies for User Content Interactions
CREATE POLICY "Users can view own content interactions" ON user_content_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content interactions" ON user_content_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content interactions" ON user_content_interactions
    FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample content items
-- Journal Tables
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    mood_tag TEXT,
    theme TEXT DEFAULT 'minimal',
    word_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_entry_date DATE,
    total_entries INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Symphony Tables
CREATE TABLE IF NOT EXISTS symphony_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    emotion_label TEXT NOT NULL,
    short_text TEXT,
    color_code TEXT,
    resonance_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS symphony_resonances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES symphony_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Additional indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_journal_streaks_user_id ON journal_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_symphony_posts_created_at ON symphony_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_symphony_posts_emotion ON symphony_posts(emotion_label);
CREATE INDEX IF NOT EXISTS idx_symphony_resonances_post_id ON symphony_resonances(post_id);

-- RLS Policies for Journal
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal entries" ON journal_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries" ON journal_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" ON journal_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries" ON journal_entries
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own journal streaks" ON journal_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal streaks" ON journal_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal streaks" ON journal_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Symphony (anonymous posts, public read)
ALTER TABLE symphony_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE symphony_resonances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view symphony posts" ON symphony_posts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert symphony posts" ON symphony_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all resonances" ON symphony_resonances
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own resonances" ON symphony_resonances
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resonances" ON symphony_resonances
    FOR DELETE USING (auth.uid() = user_id);

-- Functions for resonance counting
CREATE OR REPLACE FUNCTION increment_resonance(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE symphony_posts 
    SET resonance_count = resonance_count + 1 
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_resonance(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE symphony_posts 
    SET resonance_count = GREATEST(resonance_count - 1, 0)
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample content items
INSERT INTO content_items (title, type, category, duration, thumbnail, description, link, tags, featured) VALUES
('Introduction to Mindfulness Meditation', 'Article', 'Mindful', '10 min', '/content-thumbnails/mindfulness.jpg', 'A beginner-friendly guide to mindfulness practices and meditation techniques.', 'https://www.mindful.org/how-to-meditate/', ARRAY['meditation', 'mindfulness', 'beginner'], true),
('Managing Anxiety Through Breathing', 'Video', 'Emotional Wellness', '15 min', '/content-thumbnails/anxiety.jpg', 'Learn effective breathing techniques for anxiety relief and emotional regulation.', 'https://www.youtube.com/watch?v=SEfs5TJZ6Nk', ARRAY['anxiety', 'breathing', 'techniques'], true),
('The Science of Sleep', 'Podcast', 'Sleep & Relaxation', '45 min', '/content-thumbnails/sleep.jpg', 'Understanding sleep cycles and how to improve your sleep quality naturally.', 'https://example.com/sleep-podcast', ARRAY['sleep', 'health', 'science'], false),
('Cognitive Behavioral Therapy Basics', 'Article', 'Cognitive', '12 min', '/content-thumbnails/cbt.jpg', 'Learn the fundamentals of CBT and how it can help reshape negative thought patterns.', 'https://example.com/cbt-basics', ARRAY['cbt', 'therapy', 'cognitive'], false),
('Building Healthy Relationships', 'Video', 'Relationships', '20 min', '/content-thumbnails/relationships.jpg', 'Essential communication skills and boundaries for healthier relationships.', 'https://example.com/relationships', ARRAY['relationships', 'communication', 'boundaries'], false),
('Stress Management Techniques', 'Article', 'Stress Management', '8 min', '/content-thumbnails/stress.jpg', 'Practical strategies to manage and reduce stress in daily life.', 'https://example.com/stress-management', ARRAY['stress', 'management', 'wellness'], true),
('Guided Body Scan Meditation', 'Podcast', 'Mindful', '30 min', '/content-thumbnails/body-scan.jpg', 'A soothing guided meditation to release tension and promote relaxation.', 'https://example.com/body-scan', ARRAY['meditation', 'relaxation', 'guided'], false),
('Productivity Without Burnout', 'Article', 'Productivity', '15 min', '/content-thumbnails/productivity.jpg', 'Sustainable productivity strategies that prioritize mental health.', 'https://example.com/productivity', ARRAY['productivity', 'burnout', 'balance'], false),
('Understanding Emotional Intelligence', 'Video', 'Emotional Wellness', '25 min', '/content-thumbnails/eq.jpg', 'Develop your emotional intelligence for better self-awareness and relationships.', 'https://example.com/emotional-intelligence', ARRAY['emotional intelligence', 'self-awareness', 'growth'], false),
('Progressive Muscle Relaxation', 'Activity', 'Sleep & Relaxation', '20 min', '/content-thumbnails/pmr.jpg', 'Interactive exercise to systematically relax your body and mind.', 'https://example.com/pmr', ARRAY['relaxation', 'exercise', 'sleep'], false),
('Journaling for Mental Clarity', 'Article', 'Mindful', '10 min', '/content-thumbnails/journaling.jpg', 'How to use journaling as a tool for self-reflection and emotional processing.', 'https://example.com/journaling', ARRAY['journaling', 'reflection', 'clarity'], false),
('Overcoming Social Anxiety', 'Podcast', 'Emotional Wellness', '40 min', '/content-thumbnails/social-anxiety.jpg', 'Expert insights and practical tips for managing social anxiety.', 'https://example.com/social-anxiety', ARRAY['anxiety', 'social', 'coping'], false)
ON CONFLICT DO NOTHING;
