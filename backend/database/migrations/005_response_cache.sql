-- Migration: Add response cache table
-- Date: 2024-11-11
-- Description: Creates table for caching API responses

-- Response cache table
CREATE TABLE IF NOT EXISTS response_cache (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_response_cache_expires ON response_cache(expires_at);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_response_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on upsert
CREATE TRIGGER response_cache_updated_at
    BEFORE UPDATE ON response_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_response_cache_updated_at();

-- Comments
COMMENT ON TABLE response_cache IS 'Caches API responses to reduce database load';
COMMENT ON COLUMN response_cache.key IS 'MD5 hash of cache key (prefix + parameters)';
COMMENT ON COLUMN response_cache.value IS 'JSON-serialized cached value';
COMMENT ON COLUMN response_cache.expires_at IS 'Expiration timestamp for cache entry';

-- Cleanup function (can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM response_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_cache IS 'Deletes expired cache entries and returns count';
