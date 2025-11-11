-- Migration: Add journal_pins table for PIN protection
-- Run this in Supabase SQL Editor

-- Create journal_pins table
CREATE TABLE IF NOT EXISTS journal_pins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pin_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE journal_pins ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own PIN record" ON journal_pins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own PIN record" ON journal_pins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own PIN record" ON journal_pins
    FOR UPDATE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_journal_pins_user_id ON journal_pins(user_id);

-- Add comment
COMMENT ON TABLE journal_pins IS 'Stores hashed PINs for journal access protection';
