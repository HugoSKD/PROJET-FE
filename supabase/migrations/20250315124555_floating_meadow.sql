/*
  # Ajout des tables manquantes et correction des politiques

  1. Tables ajoutées
    - resource_tags
    - resources
    - resource_tag_relations
  
  2. Modifications
    - Suppression des politiques existantes avant création
    - Ajout des index de performance
    - Configuration des triggers
*/

-- Crée la table resource_tags
CREATE TABLE IF NOT EXISTS resource_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Active RLS sur resource_tags
ALTER TABLE resource_tags ENABLE ROW LEVEL SECURITY;

-- Crée les politiques pour resource_tags
DROP POLICY IF EXISTS "Enable read access for all users" ON resource_tags;
CREATE POLICY "resource_tags_read_policy" 
ON resource_tags FOR SELECT 
TO public 
USING (true);

-- Crée la table resources
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  url text NOT NULL,
  type text NOT NULL CHECK (type IN ('article', 'video', 'podcast', 'book', 'tool', 'other')),
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  votes_up integer DEFAULT 0,
  votes_down integer DEFAULT 0,
  helpfulness_score float DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Active RLS sur resources
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Crée les politiques pour resources
DROP POLICY IF EXISTS "Enable read access for all users" ON resources;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON resources;
DROP POLICY IF EXISTS "Enable update for resource owners" ON resources;
DROP POLICY IF EXISTS "Enable delete for resource owners" ON resources;

CREATE POLICY "resources_read_policy"
ON resources FOR SELECT
TO public
USING (true);

CREATE POLICY "resources_insert_policy"
ON resources FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "resources_update_policy"
ON resources FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "resources_delete_policy"
ON resources FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Crée la table resource_tag_relations
CREATE TABLE IF NOT EXISTS resource_tag_relations (
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES resource_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, tag_id)
);

-- Active RLS sur resource_tag_relations
ALTER TABLE resource_tag_relations ENABLE ROW LEVEL SECURITY;

-- Crée les politiques pour resource_tag_relations
DROP POLICY IF EXISTS "Enable read access for all users" ON resource_tag_relations;
DROP POLICY IF EXISTS "Enable management for resource owners" ON resource_tag_relations;

CREATE POLICY "resource_tag_relations_read_policy"
ON resource_tag_relations FOR SELECT
TO public
USING (true);

CREATE POLICY "resource_tag_relations_manage_policy"
ON resource_tag_relations FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM resources
    WHERE resources.id = resource_id
    AND resources.author_id = auth.uid()
  )
);

-- Crée les index pour de meilleures performances
CREATE INDEX IF NOT EXISTS resources_author_id_idx ON resources(author_id);
CREATE INDEX IF NOT EXISTS resource_tags_name_idx ON resource_tags(name);

-- Crée les triggers pour updated_at
CREATE TRIGGER update_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Accorde les permissions nécessaires
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Met à jour les politiques des quiz
DROP POLICY IF EXISTS "Published quizzes are viewable by everyone" ON quizzes;
CREATE POLICY "quizzes_read_policy"
ON quizzes FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM sections
    JOIN courses ON courses.id = sections.course_id
    WHERE sections.id = section_id
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