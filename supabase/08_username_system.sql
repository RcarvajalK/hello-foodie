-- ============================================================
-- Username System Migration
-- Project: Hello Foodie
-- Description: Adds unique @username handle to profiles table,
--              enables public profile search by username.
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- 1. Add username column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. Add uniqueness constraint (case-insensitive via index)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx
  ON profiles (lower(username));

-- 3. Add check constraint for valid username format
--    Rules: 3-30 chars, lowercase letters, numbers, underscores only
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_username_format;

ALTER TABLE profiles
ADD CONSTRAINT profiles_username_format
  CHECK (
    username IS NULL
    OR (
      length(username) >= 3
      AND length(username) <= 30
      AND username ~ '^[a-z0-9_]+$'
    )
  );

-- 4. Public SELECT policy on profiles (needed for username search)
--    Drop existing if any, then recreate
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;

CREATE POLICY "profiles_public_read"
ON profiles
FOR SELECT
USING (true);  -- Profiles are public (only non-sensitive fields exposed)

-- 5. Allow users to update their own profile (including username)
DROP POLICY IF EXISTS "profiles_self_update" ON profiles;

CREATE POLICY "profiles_self_update"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6. Helper RPC function: check if a username is available
--    Can be called from the frontend with .rpc('is_username_available', { p_username: 'foo' })
CREATE OR REPLACE FUNCTION is_username_available(p_username TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE lower(username) = lower(p_username)
  );
$$;

-- 7. Helper RPC function: search profiles by username prefix
--    Returns safe public fields only
CREATE OR REPLACE FUNCTION search_profiles_by_username(p_query TEXT, p_limit INT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id, username, full_name, avatar_url, bio
  FROM profiles
  WHERE
    username IS NOT NULL
    AND lower(username) LIKE lower(p_query) || '%'
  ORDER BY username
  LIMIT p_limit;
$$;
