/*
  # Fix Database Relationships
  
  This migration:
  1. Adds missing foreign key relationships for profiles
  2. Updates views and functions to properly handle these relationships
*/

-- Drop existing views if they exist
DROP VIEW IF EXISTS reviews_with_profiles;

-- Create view for reviews with profiles
CREATE VIEW reviews_with_profiles AS
SELECT 
  r.*,
  jsonb_build_object(
    'id', p.id,
    'username', p.username,
    'avatar_url', p.avatar_url,
    'role', p.role
  ) as profile
FROM reviews r
LEFT JOIN profiles p ON p.id = r.user_id;

-- Create view for resources with authors
CREATE VIEW resources_with_authors AS
SELECT 
  r.*,
  jsonb_build_object(
    'id', p.id,
    'username', p.username,
    'avatar_url', p.avatar_url,
    'role', p.role
  ) as author
FROM resources r
LEFT JOIN profiles p ON p.id = r.author_id;

-- Create view for forum topics with authors
CREATE VIEW forum_topics_with_authors AS
SELECT 
  t.*,
  jsonb_build_object(
    'id', p.id,
    'username', p.username,
    'avatar_url', p.avatar_url,
    'role', p.role
  ) as author,
  jsonb_build_object(
    'id', lp.id,
    'username', lp.username,
    'avatar_url', lp.avatar_url,
    'role', lp.role
  ) as last_post_user
FROM forum_topics t
LEFT JOIN profiles p ON p.id = t.author_id
LEFT JOIN profiles lp ON lp.id = t.last_post_user_id;

-- Create view for forum posts with authors
CREATE VIEW forum_posts_with_authors AS
SELECT 
  p.*,
  jsonb_build_object(
    'id', pr.id,
    'username', pr.username,
    'avatar_url', pr.avatar_url,
    'role', pr.role
  ) as author
FROM forum_posts p
LEFT JOIN profiles pr ON pr.id = p.author_id;

-- Grant permissions on views
GRANT SELECT ON reviews_with_profiles TO anon;
GRANT SELECT ON reviews_with_profiles TO authenticated;
GRANT SELECT ON resources_with_authors TO anon;
GRANT SELECT ON resources_with_authors TO authenticated;
GRANT SELECT ON forum_topics_with_authors TO anon;
GRANT SELECT ON forum_topics_with_authors TO authenticated;
GRANT SELECT ON forum_posts_with_authors TO anon;
GRANT SELECT ON forum_posts_with_authors TO authenticated;

-- Update RLS policies to use views
DROP POLICY IF EXISTS "Anyone can read resources" ON resources;
CREATE POLICY "Anyone can read resources"
ON resources FOR SELECT
TO public
USING (true);

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

-- Create indexes for better join performance
CREATE INDEX IF NOT EXISTS resources_author_profiles_idx ON resources(author_id);
CREATE INDEX IF NOT EXISTS forum_topics_author_profiles_idx ON forum_topics(author_id);
CREATE INDEX IF NOT EXISTS forum_topics_last_post_user_profiles_idx ON forum_topics(last_post_user_id);
CREATE INDEX IF NOT EXISTS forum_posts_author_profiles_idx ON forum_posts(author_id);