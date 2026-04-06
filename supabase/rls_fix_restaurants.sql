-- ============================================================
-- RLS Fix for Restaurant Visibility in Clubs
-- Project: Hello Foodie
-- Purpose: Allow club members to see restaurants added to their clubs
-- ============================================================

-- 1. DROP old SELECT policy for restaurants (if exists)
DROP POLICY IF EXISTS "Enable select for users based on owner or club" ON restaurants;
DROP POLICY IF EXISTS "Restaurants select policy" ON restaurants; -- Common name

-- 2. CREATE New SELECT Policy for 'restaurants'
-- A user can see a restaurant if:
--   (a) They are the owner (user_id = auth.uid())
--   (b) The restaurant is shared in a club they belong to
CREATE POLICY "restaurants_select_v2"
ON restaurants
FOR SELECT
USING (
    user_id = auth.uid() -- Owner
    OR
    EXISTS (
        SELECT 1
        FROM club_restaurants cr
        JOIN club_members cm ON cr.club_id = cm.club_id
        WHERE cr.restaurant_id = restaurants.id
          AND cm.user_id = auth.uid()
    )
);

-- 3. Ensure RLS is enabled
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- 4. Additional: Policy for 'club_restaurants'
-- Members of a club should be able to see which restaurants are in it
DROP POLICY IF EXISTS "club_restaurants_select" ON club_restaurants;
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

-- Note: Run these in your Supabase SQL Editor.
