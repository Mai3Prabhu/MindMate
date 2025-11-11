-- Migration: Add AI cache and logging tables
-- Date: 2024-11-11
-- Description: Creates tables for caching AI responses and logging interactions

-- AI response cache table
CREATE TABLE IF NOT EXISTS ai_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key TEXT NOT NULL UNIQUE,
    prompt_type TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI interaction logs table
CREATE TABLE IF NOT EXISTS ai_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_type TEXT NOT NULL,
    prompt TEXT,
    response TEXT,
    success BOOLEAN NOT NULL,
    error TEXT,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_cache_key ON ai_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_cache_created ON ai_cache(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_type ON ai_logs(prompt_type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON ai_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON ai_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_success ON ai_logs(success);

-- Cleanup old cache entries (optional, can be run periodically)
-- DELETE FROM ai_cache WHERE created_at < NOW() - INTERVAL '7 days';

-- Cleanup old logs (optional, can be run periodically)
-- DELETE FROM ai_logs WHERE created_at < NOW() - INTERVAL '30 days';

-- Comments
COMMENT ON TABLE ai_cache IS 'Caches AI responses to reduce API calls and improve performance';
COMMENT ON TABLE ai_logs IS 'Logs all AI interactions for debugging and monitoring';
COMMENT ON COLUMN ai_cache.cache_key IS 'MD5 hash of prompt type and context';
COMMENT ON COLUMN ai_cache.prompt_type IS 'Type of AI prompt (therapy_response, emotion_analysis, etc.)';
COMMENT ON COLUMN ai_logs.success IS 'Whether the AI interaction succeeded';
COMMENT ON COLUMN ai_logs.error IS 'Error message if interaction failed';
