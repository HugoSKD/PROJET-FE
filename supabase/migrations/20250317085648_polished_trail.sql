-- Drop and recreate the get_review_with_profile function with proper profile field
CREATE OR REPLACE FUNCTION get_review_with_profile(review_row reviews)
RETURNS json
LANGUAGE sql
STABLE
AS $$
  SELECT json_build_object(
    'id', review_row.id,
    'user_id', review_row.user_id,
    'course_id', review_row.course_id,
    'rating', review_row.rating,
    'comment', review_row.comment,
    'created_at', review_row.created_at,
    'updated_at', review_row.updated_at,
    'profile', (
      SELECT row_to_json(p)
      FROM (
        SELECT username, avatar_url, role
        FROM profiles
        WHERE id = review_row.user_id
      ) p
    )
  );
$$;

-- Grant execute permission on function
GRANT EXECUTE ON FUNCTION get_review_with_profile TO authenticated;
GRANT EXECUTE ON FUNCTION get_review_with_profile TO anon;

-- Update reviews policy to include profile access
DROP POLICY IF EXISTS "Enable read access for all users" ON reviews;
CREATE POLICY "Enable read access for all users"
ON reviews FOR SELECT
TO public
USING (true);

-- Create index for better join performance
CREATE INDEX IF NOT EXISTS reviews_user_profiles_idx ON reviews(user_id);

-- Grant necessary permissions
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON profiles TO authenticated;