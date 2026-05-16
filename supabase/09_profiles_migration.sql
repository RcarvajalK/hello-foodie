-- ============================================================
-- Profiles Auto-Creation & Username Refinements
-- Project: Hello Foodie
-- Fix: Removed created_at/updated_at (not in profiles schema)
-- Run this in the Supabase SQL Editor AFTER 08_username_system.sql
-- ============================================================

-- 1. Ensure display_name column exists
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 2. Ensure avatar_url column exists
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Tighten username constraint to 3-20 characters
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_username_format;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_username_format
    CHECK (
      username IS NULL
      OR (
        length(username) >= 3
        AND length(username) <= 20
        AND username ~ '^[a-z0-9_]+$'
      )
    );

-- 4. Function: auto-create a profile row for every new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    display_name,
    avatar_url
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 5. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Update is_username_available RPC (3-20 chars)
CREATE OR REPLACE FUNCTION is_username_available(p_username TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    length(p_username) >= 3
    AND length(p_username) <= 20
    AND p_username ~ '^[a-z0-9_]+$'
    AND NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE lower(username) = lower(p_username)
    );
$$;

-- 7. RLS policies
DROP POLICY IF EXISTS "profiles_self_insert" ON profiles;
CREATE POLICY "profiles_self_insert"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 8. Backfill: create profile rows for existing users without one
INSERT INTO public.profiles (id, full_name, display_name)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1))
FROM auth.users
ON CONFLICT (id) DO NOTHING;
