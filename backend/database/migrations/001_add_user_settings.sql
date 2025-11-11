-- Migration: Add user_settings table
-- Date: 2024-01-15
-- Description: Add user settings table for theme preferences and notification settings

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    theme TEXT CHECK (theme IN ('light', 'dark', 'system')) DEFAULT 'system',
    notification_settings JSONB DEFAULT '{"email_notifications": true, "push_notifications": true, "therapy_reminders": true, "journal_reminders": true, "wellness_tips": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Insert default settings for existing users
INSERT INTO user_settings (user_id, theme, notification_settings)
SELECT 
    id,
    'system',
    '{"email_notifications": true, "push_notifications": true, "therapy_reminders": true, "journal_reminders": true, "wellness_tips": true}'::jsonb
FROM profiles
WHERE id NOT IN (SELECT user_id FROM user_settings)
ON CONFLICT (user_id) DO NOTHING;
