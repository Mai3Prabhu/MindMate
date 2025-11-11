-- Migration: Add performance indexes for common queries
-- Date: 2024-11-11
-- Description: Creates additional indexes to optimize frequently accessed queries

-- Therapy-related indexes
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_started_at ON therapy_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_user_started ON therapy_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_therapy_messages_session_id ON therapy_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_therapy_messages_timestamp ON therapy_messages(timestamp DESC);

-- Journal indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_timestamp ON journal_entries(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_timestamp ON journal_entries(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_mood_tag ON journal_entries(mood_tag);

-- FeelHear indexes
CREATE INDEX IF NOT EXISTS idx_feelhear_sessions_user_id ON feelhear_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_feelhear_sessions_timestamp ON feelhear_sessions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_feelhear_sessions_saved ON feelhear_sessions(saved) WHERE saved = true;

-- Brain Gym indexes
CREATE INDEX IF NOT EXISTS idx_braingym_scores_user_game ON braingym_scores(user_id, game_type);
CREATE INDEX IF NOT EXISTS idx_braingym_scores_timestamp ON braingym_scores(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_braingym_scores_user_game_timestamp ON braingym_scores(user_id, game_type, timestamp DESC);

-- Digital Wellness indexes
CREATE INDEX IF NOT EXISTS idx_digital_wellness_user_date ON digital_wellness(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_digital_wellness_date ON digital_wellness(date DESC);

-- Wellness Plan indexes
CREATE INDEX IF NOT EXISTS idx_wellness_plan_user_id ON wellness_plan(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_plan_updated_at ON wellness_plan(updated_at DESC);

-- Content Library indexes
CREATE INDEX IF NOT EXISTS idx_content_items_category ON content_items(category);
CREATE INDEX IF NOT EXISTS idx_content_items_type ON content_items(type);
CREATE INDEX IF NOT EXISTS idx_content_items_category_type ON content_items(category, type);
CREATE INDEX IF NOT EXISTS idx_content_items_created_at ON content_items(created_at DESC);

-- Content Progress indexes
CREATE INDEX IF NOT EXISTS idx_content_progress_user_id ON content_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_content_progress_content_id ON content_progress(content_id);
CREATE INDEX IF NOT EXISTS idx_content_progress_completed ON content_progress(completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_progress_opened_at ON content_progress(opened_at DESC);

-- Symphony indexes (additional)
CREATE INDEX IF NOT EXISTS idx_symphony_posts_user_id ON symphony_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_symphony_posts_emotion ON symphony_posts(emotion_label);
CREATE INDEX IF NOT EXISTS idx_symphony_posts_region_timestamp ON symphony_posts(region, timestamp DESC);

-- Emotion events indexes (additional)
CREATE INDEX IF NOT EXISTS idx_emotion_events_user_timestamp ON emotion_events(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_emotion_events_label ON emotion_events(label);
CREATE INDEX IF NOT EXISTS idx_emotion_events_source ON emotion_events(source);

-- Meditation sessions indexes (additional)
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_timestamp ON meditation_sessions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_theme ON meditation_sessions(theme);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_user_ended ON therapy_sessions(user_id, ended_at DESC) WHERE ended_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_emotion_events_user_label_timestamp ON emotion_events(user_id, label, timestamp DESC);

-- Partial indexes for specific conditions
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_active ON therapy_sessions(user_id, started_at DESC) WHERE ended_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_feelhear_sessions_analyzed ON feelhear_sessions(user_id, timestamp DESC) WHERE analyzed_emotion IS NOT NULL;

-- Comments
COMMENT ON INDEX idx_therapy_sessions_user_started IS 'Optimizes therapy session history queries';
COMMENT ON INDEX idx_braingym_scores_user_game_timestamp IS 'Optimizes game trends and statistics queries';
COMMENT ON INDEX idx_content_progress_user_id IS 'Optimizes user content progress lookups';
COMMENT ON INDEX idx_digital_wellness_user_date IS 'Optimizes wellness metrics retrieval';
COMMENT ON INDEX idx_symphony_posts_region_timestamp IS 'Optimizes regional mood aggregation queries';

-- Analyze tables to update statistics
ANALYZE emotion_events;
ANALYZE journal_entries;
ANALYZE therapy_sessions;
ANALYZE therapy_messages;
ANALYZE feelhear_sessions;
ANALYZE meditation_sessions;
ANALYZE wellness_plan;
ANALYZE braingym_scores;
ANALYZE digital_wellness;
ANALYZE symphony_posts;
ANALYZE content_items;
ANALYZE content_progress;
