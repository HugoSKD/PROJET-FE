-- Supprime les politiques existantes
DROP POLICY IF EXISTS "Published sections are viewable by everyone" ON sections;
DROP POLICY IF EXISTS "Authors can manage sections" ON sections;

-- Crée des politiques plus permissives pour les sections
CREATE POLICY "Enable read access for all users"
ON sections FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_id
    AND (
      courses.status = 'published'
      OR (
        auth.role() = 'authenticated'
        AND (
          courses.author_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'author')
          )
        )
      )
    )
  )
);

CREATE POLICY "Enable insert for authors and admins"
ON sections FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_id
    AND (
      courses.author_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'author')
      )
    )
  )
);

CREATE POLICY "Enable update for authors and admins"
ON sections FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_id
    AND (
      courses.author_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'author')
      )
    )
  )
);

CREATE POLICY "Enable delete for authors and admins"
ON sections FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_id
    AND (
      courses.author_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'author')
      )
    )
  )
);

-- Accorde les permissions nécessaires
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON sections TO anon;
GRANT ALL ON sections TO authenticated;

-- Crée la table reviews si elle n'existe pas
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Active RLS sur la table reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Crée les politiques pour reviews
CREATE POLICY "Enable read access for all users"
ON reviews FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for review owners"
ON reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for review owners"
ON reviews FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Crée la table progress si elle n'existe pas
CREATE TABLE IF NOT EXISTS progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  section_id uuid REFERENCES sections(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completion_date timestamptz,
  last_accessed timestamptz DEFAULT now(),
  time_spent integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, section_id)
);

-- Active RLS sur la table progress
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Crée les politiques pour progress
CREATE POLICY "Enable read access for owners"
ON progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for owners"
ON progress FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for owners"
ON progress FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for owners"
ON progress FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Crée les index pour de meilleures performances
CREATE INDEX IF NOT EXISTS reviews_course_id_idx ON reviews(course_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON reviews(user_id);
CREATE INDEX IF NOT EXISTS progress_user_id_idx ON progress(user_id);
CREATE INDEX IF NOT EXISTS progress_course_id_idx ON progress(course_id);
CREATE INDEX IF NOT EXISTS progress_section_id_idx ON progress(section_id);

-- Crée le trigger pour updated_at sur reviews
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Crée le trigger pour updated_at sur progress
CREATE TRIGGER update_progress_updated_at
    BEFORE UPDATE ON progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();