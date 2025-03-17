/*
  # Correction des politiques RLS pour les cours
  
  1. Modifications
    - Suppression des anciennes politiques
    - Création de nouvelles politiques plus permissives
    - Ajout de politiques pour les utilisateurs non authentifiés
*/

-- Supprime les politiques existantes pour les cours
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON courses;
DROP POLICY IF EXISTS "Authors can view their own courses" ON courses;
DROP POLICY IF EXISTS "Authors can manage their courses" ON courses;

-- Crée des politiques plus permissives
CREATE POLICY "Enable read access for all users"
ON courses FOR SELECT
TO public
USING (
  status = 'published' OR
  (
    auth.role() = 'authenticated' AND
    (
      author_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'author')
      )
    )
  )
);

CREATE POLICY "Enable insert for authors and admins"
ON courses FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = author_id OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'author')
  )
);

CREATE POLICY "Enable update for authors and admins"
ON courses FOR UPDATE
TO authenticated
USING (
  auth.uid() = author_id OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'author')
  )
)
WITH CHECK (
  auth.uid() = author_id OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'author')
  )
);

CREATE POLICY "Enable delete for authors and admins"
ON courses FOR DELETE
TO authenticated
USING (
  auth.uid() = author_id OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'author')
  )
);

-- Accorde les permissions nécessaires
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON courses TO anon;
GRANT ALL ON courses TO authenticated;

-- S'assure que RLS est activé
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;