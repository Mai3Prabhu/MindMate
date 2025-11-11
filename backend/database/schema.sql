-- MindMate Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_name TEXT,
    email TEXT,
    age INTEGER,
    gender TEXT,
    phone TEXT,
    place TEXT,
    location JSONB, -- {lat, lng, address}
    user_type TEXT CHECK (user_type IN ('individual', 'caregiver', 'family')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emotion events table
CREATE TABLE IF NOT EXISTS emotion_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    label TEXT NOT NULL, -- happy, sad, anxious, calm, etc.
    intensity INTEGER CHECK (intensity >= 0 AND intensity <= 100),
    source TEXT, -- 'manual', 'therapy', 'feelhear', etc.
    encrypted_snippet TEXT, -- Optional encrypted text snippet
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal entries table (encrypted)
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    encrypted_content TEXT NOT NULL, -- AES-256 encrypted
    mood_tag TEXT,
    theme TEXT, -- nature-forest, ocean, night, minimal, zen
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Therapy sessions table
CREATE TABLE IF NOT EXISTS therapy_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    mode TEXT CHECK (mode IN ('gentle', 'conversational', 'silent')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    topics TEXT[], -- Array of detected topics
    feeling_rating INTEGER CHECK (feeling_rating >= 1 AND feeling_rating <= 10),
    key_insights TEXT
);

-- Therapy messages table (encrypted)
CREATE TABLE IF NOT EXISTS therapy_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES therapy_sessions(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'therapist')),
    encrypted_text TEXT NOT NULL, -- AES-256 encrypted
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FeelHear sessions table
CREATE TABLE IF NOT EXISTS feelhear_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    audio_url TEXT, -- Supabase Storage URL
    analyzed_emotion TEXT,
    intensity INTEGER,
    summary TEXT, -- Gemini-generated summary
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    saved BOOLEAN DEFAULT FALSE
);

-- Meditation sessions table
CREATE TABLE IF NOT EXISTS meditation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    theme TEXT NOT NULL, -- forest, ocean, night
    duration_minutes INTEGER NOT NULL,
    voice_type TEXT, -- male, female, silent
    time_of_day TEXT, -- morning, afternoon, evening, night
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wellness plan state table
CREATE TABLE IF NOT EXISTS wellness_plan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    meditation_streak INTEGER DEFAULT 0,
    journal_streak INTEGER DEFAULT 0,
    breath_streak INTEGER DEFAULT 0,
    movement_streak INTEGER DEFAULT 0,
    last_meditation DATE,
    last_journal DATE,
    last_breath DATE,
    last_movement DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brain Gym scores table
CREATE TABLE IF NOT EXISTS braingym_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    game_type TEXT NOT NULL, -- memory_match, recall, pattern, reaction
    score INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Digital wellness metrics table
CREATE TABLE IF NOT EXISTS digital_wellness (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    daily_screen_minutes INTEGER,
    app_usage_json JSONB, -- {app_name: minutes}
    detections TEXT[], -- doomscrolling, binge, notification_storm
    date DATE NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Symphony posts table
CREATE TABLE IF NOT EXISTS symphony_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    emotion_label TEXT NOT NULL,
    color_code TEXT, -- hex color
    short_text TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Library items table
CREATE TABLE IF NOT EXISTS content_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL, -- mindfulness, emotional_wellness, cognitive_health, etc.
    type TEXT NOT NULL, -- article, video, podcast
    duration_min INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content progress tracking table
CREATE TABLE IF NOT EXISTS content_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, content_id)
);

-- User settings table (theme, notifications, etc.)
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    theme TEXT CHECK (theme IN ('light', 'dark', 'system')) DEFAULT 'system',
    notification_settings JSONB DEFAULT '{"email_notifications": true, "push_notifications": true, "therapy_reminders": true, "journal_reminders": true, "wellness_tips": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feelhear_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE braingym_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_wellness ENABLE ROW LEVEL SECURITY;
ALTER TABLE symphony_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Emotion events: Users can manage their own events
CREATE POLICY "Users can view own emotions" ON emotion_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emotions" ON emotion_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own emotions" ON emotion_events
    FOR DELETE USING (auth.uid() = user_id);

-- User settings: Users can manage their own settings
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Similar policies for other tables...
-- (Add full RLS policies for production)

-- Indexes for performance
CREATE INDEX idx_emotion_events_user_id ON emotion_events(user_id);
CREATE INDEX idx_emotion_events_timestamp ON emotion_events(timestamp DESC);
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_therapy_sessions_user_id ON therapy_sessions(user_id);
CREATE INDEX idx_meditation_sessions_user_id ON meditation_sessions(user_id);
CREATE INDEX idx_symphony_posts_timestamp ON symphony_posts(timestamp DESC);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Seed some content library items
INSERT INTO content_items (title, url, category, type, duration_min, description) VALUES
('Introduction to Mindfulness Meditation', 'https://example.com/mindfulness-intro', 'mindfulness', 'article', 10, 'A beginner-friendly guide to mindfulness practices'),
('Managing Anxiety Through Breathing', 'https://example.com/anxiety-breathing', 'emotional_wellness', 'video', 15, 'Learn effective breathing techniques for anxiety relief'),
('Cognitive Behavioral Therapy Basics', 'https://example.com/cbt-basics', 'cognitive_health', 'article', 20, 'Understanding CBT principles for mental wellness'),
('Sleep Hygiene for Better Rest', 'https://example.com/sleep-hygiene', 'emotional_wellness', 'podcast', 25, 'Improve your sleep quality with these evidence-based tips');
