-- ============================================================
-- RLS Policies for Clubs Privacy
-- Project: hbjewvdiriypkbqgyqpw (Hello Foodie)
-- Date: 2026-02-26
-- ============================================================

-- 1. Enable RLS on both tables (safe to run even if already enabled)
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- DROP existing policies on 'clubs' to start fresh
-- ============================================================
DROP POLICY IF EXISTS "clubs_select" ON clubs;
DROP POLICY IF EXISTS "clubs_insert" ON clubs;
DROP POLICY IF EXISTS "clubs_update" ON clubs;
DROP POLICY IF EXISTS "clubs_delete" ON clubs;

-- ============================================================
-- CLUBS SELECT POLICY
-- A user can see a club if:
--   (a) The club is public, OR
--   (b) The club is private AND the user is a member of that club
-- ============================================================
CREATE POLICY "clubs_select"
ON clubs
FOR SELECT
USING (
    type = 'public'
    OR
    (
        type = 'private'
        AND
        EXISTS (
            SELECT 1
            FROM club_members
            WHERE club_members.club_id = clubs.id
              AND club_members.user_id = auth.uid()
        )
    )
);

-- ============================================================
-- CLUBS INSERT POLICY
-- Any authenticated user can create a club
-- ============================================================
CREATE POLICY "clubs_insert"
ON clubs
FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
);

-- ============================================================
-- CLUBS UPDATE POLICY
-- Only the creator (admin) can update a club
-- ============================================================
CREATE POLICY "clubs_update"
ON clubs
FOR UPDATE
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- ============================================================
-- CLUBS DELETE POLICY
-- Only the creator (admin) can delete a club
-- ============================================================
CREATE POLICY "clubs_delete"
ON clubs
FOR DELETE
USING (created_by = auth.uid());


-- ============================================================
-- DROP existing policies on 'club_members' to start fresh
-- ============================================================
DROP POLICY IF EXISTS "club_members_select" ON club_members;
DROP POLICY IF EXISTS "club_members_insert" ON club_members;
DROP POLICY IF EXISTS "club_members_delete" ON club_members;

-- ============================================================
-- CLUB_MEMBERS SELECT POLICY
-- A user can see memberships if:
--   (a) The club is public, OR
--   (b) The club is private AND the user is also a member
-- ============================================================
CREATE POLICY "club_members_select"
ON club_members
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM clubs
        WHERE clubs.id = club_members.club_id
          AND (
              clubs.type = 'public'
              OR (
                  clubs.type = 'private'
                  AND EXISTS (
                      SELECT 1 FROM club_members cm2
                      WHERE cm2.club_id = clubs.id
                        AND cm2.user_id = auth.uid()
                  )
              )
          )
    )
);

-- ============================================================
-- CLUB_MEMBERS INSERT POLICY
-- An authenticated user can join a club if:
--   (a) The club is public (open to all), OR
--   (b) The user is the creator (auto-join on club creation), OR
--   (c) The insert is for themselves (user_id = auth.uid())
--       which covers invite-link flows
-- ============================================================
CREATE POLICY "club_members_insert"
ON club_members
FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
);

-- ============================================================
-- CLUB_MEMBERS DELETE POLICY
-- A user can remove themselves (leave) OR 
-- the club creator can remove anyone from their club
-- ============================================================
CREATE POLICY "club_members_delete"
ON club_members
FOR DELETE
USING (
    user_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM clubs
        WHERE clubs.id = club_members.club_id
          AND clubs.created_by = auth.uid()
    )
);
