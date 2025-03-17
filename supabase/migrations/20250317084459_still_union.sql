-- Update the get_review_with_profile function
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
    'profiles', (
      SELECT json_build_object(
        'username', p.username,
        'avatar_url', p.avatar_url,
        'role', p.role
      )
      FROM profiles p
      WHERE p.id = review_row.user_id
    )
  );
$$;

-- Grant execute permission on function
GRANT EXECUTE ON FUNCTION get_review_with_profile TO authenticated;
GRANT EXECUTE ON FUNCTION get_review_with_profile TO anon;