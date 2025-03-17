-- Drop existing view if it exists
DROP VIEW IF EXISTS reviews_with_profiles;

-- Create view for reviews with profiles
CREATE VIEW reviews_with_profiles AS
SELECT 
  r.id,
  r.user_id,
  r.course_id,
  r.rating,
  r.comment,
  r.created_at,
  r.updated_at,
  jsonb_build_object(
    'id', p.id,
    'username', p.username,
    'avatar_url', p.avatar_url,
    'role', p.role
  ) as profile
FROM reviews r
LEFT JOIN profiles p ON p.id = r.user_id;

-- Create index for better join performance
CREATE INDEX IF NOT EXISTS reviews_user_id_profile_idx ON reviews(user_id);

-- Update the reviews policy
DROP POLICY IF EXISTS "Enable read access for all users" ON reviews;
CREATE POLICY "Enable read access for all users"
ON reviews FOR SELECT
TO public
USING (true);

-- Grant permissions
GRANT SELECT ON reviews_with_profiles TO anon;
GRANT SELECT ON reviews_with_profiles TO authenticated;