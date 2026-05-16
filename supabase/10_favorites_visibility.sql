-- ============================================================
-- Favorites Visibility Setting
-- Project: Hello Foodie
-- Adds a global favorites_visibility column to profiles so users
-- can control who sees their favorites list: private / circles / public
-- Run in Supabase SQL Editor
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS favorites_visibility TEXT
  DEFAULT 'private'
  CHECK (favorites_visibility IN ('private', 'circles', 'public'));

-- Ensure existing rows have the default set explicitly
UPDATE profiles
  SET favorites_visibility = 'private'
  WHERE favorites_visibility IS NULL;
