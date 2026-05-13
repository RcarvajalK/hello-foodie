-- Migration to add session state flags to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS has_signed_nda boolean DEFAULT false;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS has_seen_tour boolean DEFAULT false;
