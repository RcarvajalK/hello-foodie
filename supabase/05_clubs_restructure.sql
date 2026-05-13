-- ============================================================
-- Clubs Restructure: Circles & Communities
-- Description: Adds fields for Community rankings and validations
-- ============================================================

-- 1. Update club_restaurants table with new fields
ALTER TABLE club_restaurants
ADD COLUMN IF NOT EXISTS recommender_rating numeric(2,1) CHECK (recommender_rating >= 1.0 AND recommender_rating <= 5.0),
ADD COLUMN IF NOT EXISTS average_spend numeric(10,2),
ADD COLUMN IF NOT EXISTS pro_tip text;

-- Make sure added_by exists, it should but just in case
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'club_restaurants' AND column_name = 'added_by') THEN
        ALTER TABLE club_restaurants ADD COLUMN added_by uuid REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Create community_validations table
CREATE TABLE IF NOT EXISTS community_validations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    club_restaurant_id uuid REFERENCES club_restaurants(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    validation_type text CHECK (validation_type IN ('confirm', 'matizar', 'report')),
    new_spend numeric(10,2),
    new_rating numeric(2,1) CHECK (new_rating >= 1.0 AND new_rating <= 5.0),
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(club_restaurant_id, user_id) -- A user can only validate once per restaurant in a club
);

-- Enable RLS
ALTER TABLE community_validations ENABLE ROW LEVEL SECURITY;

-- Select policy: Anyone in the club can see the validations
CREATE POLICY "community_validations_select"
ON community_validations
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM club_restaurants cr
        JOIN club_members cm ON cr.club_id = cm.club_id
        WHERE cr.id = community_validations.club_restaurant_id
          AND cm.user_id = auth.uid()
    )
);

-- Insert policy: Anyone in the club can insert a validation
CREATE POLICY "community_validations_insert"
ON community_validations
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM club_restaurants cr
        JOIN club_members cm ON cr.club_id = cm.club_id
        WHERE cr.id = community_validations.club_restaurant_id
          AND cm.user_id = auth.uid()
    )
    AND auth.uid() = user_id
);

-- Update policy: Users can update their own validations
CREATE POLICY "community_validations_update"
ON community_validations
FOR UPDATE
USING (auth.uid() = user_id);

-- Delete policy: Users can delete their own validations
CREATE POLICY "community_validations_delete"
ON community_validations
FOR DELETE
USING (auth.uid() = user_id);


-- 3. Update profiles table for Gamification (Trust Score)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS trust_score integer DEFAULT 100;
