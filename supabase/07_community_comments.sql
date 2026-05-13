-- 1. Create community_comments table
CREATE TABLE IF NOT EXISTS community_comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    club_restaurant_id uuid REFERENCES club_restaurants(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

-- 3. Add RLS Policies
CREATE POLICY "community_comments_read"
ON community_comments
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "community_comments_insert"
ON community_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_comments_update"
ON community_comments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "community_comments_delete"
ON community_comments
FOR DELETE
USING (auth.uid() = user_id);
