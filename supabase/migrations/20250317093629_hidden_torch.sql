/*
  # Resource System Migration
  
  1. Drop existing tables if they exist
  2. Create tables with proper constraints
  3. Enable RLS and create policies
  4. Add indexes and triggers
  5. Insert initial tags
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS resource_bookmarks CASCADE;
DROP TABLE IF EXISTS resource_votes CASCADE;
DROP TABLE IF EXISTS resource_tag_relations CASCADE;
DROP TABLE IF EXISTS resource_tags CASCADE;
DROP TABLE IF EXISTS resources CASCADE;

-- Create resource_tags table
CREATE TABLE resource_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create resources table
CREATE TABLE resources (
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

-- Create resource_tag_relations table
CREATE TABLE resource_tag_relations (
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES resource_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, tag_id)
);

-- Create resource_votes table
CREATE TABLE resource_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful', 'innovative', 'practical', 'outdated')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(resource_id, user_id, vote_type)
);

-- Create resource_bookmarks table
CREATE TABLE resource_bookmarks (
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (resource_id, user_id)
);

-- Enable RLS
ALTER TABLE resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read resource tags"
ON resource_tags FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can read resources"
ON resources FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can create resources"
ON resources FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update resources"
ON resources FOR UPDATE
TO authenticated
USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete resources"
ON resources FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

CREATE POLICY "Anyone can read resource tag relations"
ON resource_tag_relations FOR SELECT
TO public
USING (true);

CREATE POLICY "Authors can manage resource tags"
ON resource_tag_relations FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM resources
  WHERE resources.id = resource_id
  AND resources.author_id = auth.uid()
));

CREATE POLICY "Anyone can read votes"
ON resource_votes FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can vote"
ON resource_votes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
ON resource_votes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
ON resource_votes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can read own bookmarks"
ON resource_bookmarks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bookmarks"
ON resource_bookmarks FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX resource_tags_name_idx ON resource_tags(name);
CREATE INDEX resources_author_id_idx ON resources(author_id);
CREATE INDEX resource_votes_resource_user_idx ON resource_votes(resource_id, user_id);
CREATE INDEX resource_bookmarks_user_idx ON resource_bookmarks(user_id);

-- Create trigger for updating helpfulness score
CREATE OR REPLACE FUNCTION update_resource_helpfulness()
RETURNS TRIGGER AS $$
DECLARE
  helpful_count integer;
  not_helpful_count integer;
  innovative_count integer;
  practical_count integer;
  outdated_count integer;
  total_votes integer;
  new_score float;
BEGIN
  -- Count different types of votes
  SELECT
    COUNT(*) FILTER (WHERE vote_type = 'helpful'),
    COUNT(*) FILTER (WHERE vote_type = 'not_helpful'),
    COUNT(*) FILTER (WHERE vote_type = 'innovative'),
    COUNT(*) FILTER (WHERE vote_type = 'practical'),
    COUNT(*) FILTER (WHERE vote_type = 'outdated')
  INTO helpful_count, not_helpful_count, innovative_count, practical_count, outdated_count
  FROM resource_votes
  WHERE resource_id = NEW.resource_id;

  total_votes = helpful_count + not_helpful_count + innovative_count + practical_count + outdated_count;

  -- Calculate weighted score
  IF total_votes > 0 THEN
    new_score = (
      (helpful_count * 1.5 + innovative_count * 1.2 + practical_count - not_helpful_count * 1.5 - outdated_count * 1.2)
      / total_votes
    );
  ELSE
    new_score = 0;
  END IF;

  -- Update resource
  UPDATE resources
  SET
    votes_up = helpful_count + innovative_count + practical_count,
    votes_down = not_helpful_count + outdated_count,
    helpfulness_score = new_score,
    updated_at = now()
  WHERE id = NEW.resource_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for votes
CREATE TRIGGER resource_votes_update
  AFTER INSERT OR UPDATE OR DELETE ON resource_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_resource_helpfulness();

-- Insert initial tags
INSERT INTO resource_tags (name, color) VALUES
('article', '#3B82F6'),
('video', '#EF4444'),
('podcast', '#10B981'),
('book', '#8B5CF6'),
('tool', '#F59E0B'),
('trading', '#6366F1'),
('investing', '#EC4899'),
('analysis', '#14B8A6'),
('strategy', '#F97316'),
('risk-management', '#EAB308'),
('psychology', '#A855F7'),
('fundamentals', '#06B6D4'),
('advanced', '#DC2626'),
('beginner', '#22C55E'),
('market-news', '#6B7280'),
('research', '#8B5CF6'),
('education', '#0EA5E9'),
('software', '#F43F5E');