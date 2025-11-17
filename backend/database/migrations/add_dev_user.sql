-- Add Development User Profile
-- Run this in Supabase SQL Editor for development/testing

-- Insert dev user profile if it doesn't exist
INSERT INTO profiles (id, email, name, user_type, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'dev@mindmate.local',
    'Development User',
    'individual',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Also add the placeholder user used in other parts of the app
INSERT INTO profiles (id, email, name, user_type, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'placeholder@mindmate.local',
    'Placeholder User',
    'individual',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verify the users were created
SELECT id, email, name FROM profiles WHERE id IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000'
);
