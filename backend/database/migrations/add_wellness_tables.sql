-- Wellness Plan Tables
-- Run this migration in Supabase SQL Editor

-- Breathing Sessions Table
CREATE TABLE IF NOT EXISTS breathing_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    pattern TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    before_calmness INTEGER CHECK (before_calmness >= 1 AND before_calmness <= 10),
    after_calmness INTEGER CHECK (after_calmness >= 1 AND after_calmness <= 10),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Breathing Logs Table (for Box Breathing and other patterns)
CREATE TABLE IF NOT EXISTS breathing_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    breathing_type TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    cycles_completed INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wellness Activities Table
CREATE TABLE IF NOT EXISTS wellness_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    intensity TEXT NOT NULL,
    calories INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wellness Goals Table
CREATE TABLE IF NOT EXISTS wellness_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target INTEGER NOT NULL,
    current INTEGER DEFAULT 0,
    unit TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wellness Streaks Table
CREATE TABLE IF NOT EXISTS wellness_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    breathing_streak INTEGER DEFAULT 0,
    activity_streak INTEGER DEFAULT 0,
    meditation_streak INTEGER DEFAULT 0,
    journal_streak INTEGER DEFAULT 0,
    last_breathing_date DATE,
    last_activity_date DATE,
    last_meditation_date DATE,
    last_journal_date DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Wellness Badges Table
CREATE TABLE IF NOT EXISTS wellness_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_name TEXT NOT NULL,
    badge_type TEXT NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_breathing_sessions_user_id ON breathing_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_breathing_sessions_completed_at ON breathing_sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_breathing_logs_user_id ON breathing_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_breathing_logs_completed_at ON breathing_logs(completed_at);
CREATE INDEX IF NOT EXISTS idx_wellness_activities_user_id ON wellness_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_activities_completed_at ON wellness_activities(completed_at);
CREATE INDEX IF NOT EXISTS idx_wellness_goals_user_id ON wellness_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_streaks_user_id ON wellness_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_badges_user_id ON wellness_badges(user_id);

-- Row Level Security
ALTER TABLE breathing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE breathing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own breathing sessions" ON breathing_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own breathing sessions" ON breathing_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own breathing logs" ON breathing_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own breathing logs" ON breathing_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own activities" ON wellness_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON wellness_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own goals" ON wellness_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON wellness_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON wellness_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON wellness_goals
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own streaks" ON wellness_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON wellness_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON wellness_streaks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own badges" ON wellness_badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON wellness_badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);
