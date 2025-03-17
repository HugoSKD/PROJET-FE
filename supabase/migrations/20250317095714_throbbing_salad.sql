-- Update policies for courses
DROP POLICY IF EXISTS "Enable read access for all users" ON courses;
CREATE POLICY "Enable read access for all users"
ON courses FOR SELECT
TO public
USING (true);

-- Update policies for resources
DROP POLICY IF EXISTS "Anyone can read resources" ON resources;
CREATE POLICY "Anyone can read resources"
ON resources FOR SELECT
TO public
USING (true);

-- Update policies for forum
DROP POLICY IF EXISTS "Topics are viewable by everyone" ON forum_topics;
CREATE POLICY "Topics are viewable by everyone"
ON forum_topics FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Posts are viewable by everyone" ON forum_posts;
CREATE POLICY "Posts are viewable by everyone"
ON forum_posts FOR SELECT
TO public
USING (true);

-- Update policies for forum interactions (require authentication)
DROP POLICY IF EXISTS "Authenticated users can create topics" ON forum_topics;
CREATE POLICY "Authenticated users can create topics"
ON forum_topics FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON forum_posts;
CREATE POLICY "Authenticated users can create posts"
ON forum_posts FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = author_id AND
  NOT EXISTS (
    SELECT 1 FROM forum_topics
    WHERE forum_topics.id = topic_id
    AND forum_topics.is_locked = true
  )
);

DROP POLICY IF EXISTS "Authenticated users can manage own reactions" ON forum_reactions;
CREATE POLICY "Authenticated users can manage own reactions"
ON forum_reactions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;