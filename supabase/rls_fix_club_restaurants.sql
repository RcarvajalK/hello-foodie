-- ============================================================
-- RLS Fix for Club Membership and Collaborative Sharing
-- Project: Hello Foodie
-- Purpose: Allow club members to add and remove restaurants from clubs
-- ============================================================

-- 1. DROP old policies for club_restaurants
DROP POLICY IF EXISTS "club_restaurants_select" ON club_restaurants;
DROP POLICY IF EXISTS "club_restaurants_insert" ON club_restaurants;
DROP POLICY IF EXISTS "club_restaurants_delete" ON club_restaurants;

-- 2. CREATE SELECT Policy
-- Anyone who is a member of the club can see the restaurants in it
CREATE POLICY "club_restaurants_select"
ON club_restaurants
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM club_members
        WHERE club_members.club_id = club_restaurants.club_id
          AND club_members.user_id = auth.uid()
    )
);

-- 3. CREATE INSERT Policy
-- A member of a club can add any restaurant to that club
CREATE POLICY "club_restaurants_insert"
ON club_restaurants
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM club_members
        WHERE club_members.club_id = club_restaurants.club_id
          AND club_members.user_id = auth.uid()
    )
);

-- 4. CREATE DELETE Policy
-- A member can remove a restaurant from a club
CREATE POLICY "club_restaurants_delete"
ON club_restaurants
FOR DELETE
USING (
    EXISTS (
        SELECT 1
        FROM club_members
        WHERE club_members.club_id = club_restaurants.club_id
          AND club_members.user_id = auth.uid()
    )
);

-- 5. Ensure RLS is enabled
ALTER TABLE club_restaurants ENABLE ROW LEVEL SECURITY;

-- Note: Run this in your Supabase SQL Editor.
