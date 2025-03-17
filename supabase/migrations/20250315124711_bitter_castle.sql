-- Crée une fonction pour joindre reviews et profiles
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

-- Crée un index pour améliorer les performances des jointures
CREATE INDEX IF NOT EXISTS reviews_user_profiles_idx ON reviews(user_id);

-- Accorde les permissions nécessaires
GRANT EXECUTE ON FUNCTION get_review_with_profile TO authenticated;
GRANT EXECUTE ON FUNCTION get_review_with_profile TO anon;

-- Met à jour la politique de lecture des reviews
DROP POLICY IF EXISTS "Enable read access for all users" ON reviews;
CREATE POLICY "reviews_read_policy"
ON reviews FOR SELECT
TO public
USING (true);

COMMENT ON FUNCTION get_review_with_profile IS 'Retourne une review avec les informations du profil associé';