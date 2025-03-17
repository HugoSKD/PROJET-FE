/*
  # Forum System Migration
  
  1. New Tables
    - forum_categories (categories for organizing topics)
    - forum_topics (discussion topics)
    - forum_posts (posts/replies in topics)
    - forum_reactions (likes/reactions on posts)
    - forum_subscriptions (topic subscriptions)
    
  2. Security
    - RLS policies for all tables
    - Proper permissions and roles
    
  3. Features
    - Categories and subcategories
    - Topics with tags
    - Posts with markdown content
    - Reactions and likes
    - Topic subscriptions
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS forum_reactions CASCADE;
DROP TABLE IF EXISTS forum_subscriptions CASCADE;
DROP TABLE IF EXISTS forum_posts CASCADE;
DROP TABLE IF EXISTS forum_topics CASCADE;
DROP TABLE IF EXISTS forum_categories CASCADE;

-- Create forum_categories table
CREATE TABLE forum_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  slug text NOT NULL UNIQUE,
  icon text,
  color text,
  parent_id uuid REFERENCES forum_categories(id) ON DELETE SET NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create forum_topics table
CREATE TABLE forum_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES forum_categories(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  slug text NOT NULL UNIQUE,
  tags text[] DEFAULT '{}',
  is_pinned boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  views_count integer DEFAULT 0,
  posts_count integer DEFAULT 0,
  last_post_at timestamptz DEFAULT now(),
  last_post_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create forum_posts table
CREATE TABLE forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES forum_topics(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  is_solution boolean DEFAULT false,
  reactions_count integer DEFAULT 0,
  parent_id uuid REFERENCES forum_posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create forum_reactions table
CREATE TABLE forum_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('like', 'helpful', 'insightful', 'agree', 'disagree')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id, type)
);

-- Create forum_subscriptions table
CREATE TABLE forum_subscriptions (
  topic_id uuid REFERENCES forum_topics(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (topic_id, user_id)
);

-- Enable RLS
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for forum_categories
CREATE POLICY "Categories are viewable by everyone"
ON forum_categories FOR SELECT
TO public
USING (true);

CREATE POLICY "Only admins can manage categories"
ON forum_categories FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid()
  AND profiles.role = 'admin'
));

-- Create policies for forum_topics
CREATE POLICY "Topics are viewable by everyone"
ON forum_topics FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can create topics"
ON forum_topics FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors and admins can update topics"
ON forum_topics FOR UPDATE
TO authenticated
USING (
  auth.uid() = author_id OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Authors and admins can delete topics"
ON forum_topics FOR DELETE
TO authenticated
USING (
  auth.uid() = author_id OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create policies for forum_posts
CREATE POLICY "Posts are viewable by everyone"
ON forum_posts FOR SELECT
TO public
USING (true);

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

CREATE POLICY "Authors can update own posts"
ON forum_posts FOR UPDATE
TO authenticated
USING (auth.uid() = author_id);

CREATE POLICY "Authors and admins can delete posts"
ON forum_posts FOR DELETE
TO authenticated
USING (
  auth.uid() = author_id OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create policies for forum_reactions
CREATE POLICY "Reactions are viewable by everyone"
ON forum_reactions FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can manage own reactions"
ON forum_reactions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policies for forum_subscriptions
CREATE POLICY "Users can view own subscriptions"
ON forum_subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own subscriptions"
ON forum_subscriptions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX forum_categories_parent_id_idx ON forum_categories(parent_id);
CREATE INDEX forum_categories_slug_idx ON forum_categories(slug);
CREATE INDEX forum_topics_category_id_idx ON forum_topics(category_id);
CREATE INDEX forum_topics_author_id_idx ON forum_topics(author_id);
CREATE INDEX forum_topics_slug_idx ON forum_topics(slug);
CREATE INDEX forum_topics_tags_idx ON forum_topics USING gin(tags);
CREATE INDEX forum_posts_topic_id_idx ON forum_posts(topic_id);
CREATE INDEX forum_posts_author_id_idx ON forum_posts(author_id);
CREATE INDEX forum_posts_parent_id_idx ON forum_posts(parent_id);
CREATE INDEX forum_reactions_post_id_idx ON forum_reactions(post_id);
CREATE INDEX forum_reactions_user_id_idx ON forum_reactions(user_id);
CREATE INDEX forum_subscriptions_user_id_idx ON forum_subscriptions(user_id);

-- Create trigger function for updating post counts
CREATE OR REPLACE FUNCTION update_topic_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_topics
    SET 
      posts_count = posts_count + 1,
      last_post_at = NEW.created_at,
      last_post_user_id = NEW.author_id
    WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_topics
    SET posts_count = posts_count - 1
    WHERE id = OLD.topic_id;
    
    -- Update last post info if necessary
    UPDATE forum_topics t
    SET 
      last_post_at = COALESCE(
        (SELECT MAX(created_at) FROM forum_posts WHERE topic_id = t.id),
        t.created_at
      ),
      last_post_user_id = (
        SELECT author_id 
        FROM forum_posts 
        WHERE topic_id = t.id 
        ORDER BY created_at DESC 
        LIMIT 1
      )
    WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for post count updates
CREATE TRIGGER update_topic_post_count
  AFTER INSERT OR DELETE ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_topic_post_count();

-- Create trigger function for updating reaction counts
CREATE OR REPLACE FUNCTION update_post_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts
    SET reactions_count = reactions_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts
    SET reactions_count = reactions_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for reaction count updates
CREATE TRIGGER update_post_reaction_count
  AFTER INSERT OR DELETE ON forum_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_post_reaction_count();

-- Insert initial categories
INSERT INTO forum_categories (name, description, slug, icon, color, order_index) VALUES
('Général', 'Discussions générales sur la finance et l''investissement', 'general', '💬', '#6366F1', 1),
('Trading', 'Stratégies et discussions sur le trading', 'trading', '📊', '#EF4444', 2),
('Analyse Technique', 'Discussions sur l''analyse technique', 'technical-analysis', '📈', '#10B981', 3),
('Analyse Fondamentale', 'Discussions sur l''analyse fondamentale', 'fundamental-analysis', '📚', '#F59E0B', 4),
('Crypto-monnaies', 'Tout sur les crypto-monnaies', 'crypto', '₿', '#8B5CF6', 5),
('Débutants', 'Questions et discussions pour les débutants', 'beginners', '🎓', '#EC4899', 6),
('Actualités', 'Actualités et analyses du marché', 'news', '📰', '#14B8A6', 7),
('Aide & Support', 'Questions techniques et support', 'support', '❓', '#6B7280', 8);