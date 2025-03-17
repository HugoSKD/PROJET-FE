/*
  # Complete Database Schema Reset
  
  This migration:
  1. Drops and recreates the public schema
  2. Creates all tables with correct auth.users references
  3. Enables RLS and creates policies
  4. Creates all necessary functions and triggers
*/

-- Drop and recreate schema
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Create extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create base tables
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  avatar_url text,
  bio text,
  achievement_points integer DEFAULT 0,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'author', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  level text NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration integer NOT NULL,
  image_url text NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
  published_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(course_id, order_index)
);

CREATE TABLE progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  section_id uuid REFERENCES sections(id) ON DELETE CASCADE NOT NULL,
  completed boolean DEFAULT false,
  last_accessed timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id)
);

CREATE TABLE achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon text NOT NULL,
  criteria jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE user_achievements (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE resource_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

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

CREATE TABLE resource_tag_relations (
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES resource_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, tag_id)
);

CREATE TABLE resource_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful', 'innovative', 'practical', 'outdated')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(resource_id, user_id, vote_type)
);

CREATE TABLE resource_bookmarks (
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (resource_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Published courses are viewable by everyone" ON courses FOR SELECT TO authenticated USING (status = 'published');
CREATE POLICY "Authors can view own courses" ON courses FOR SELECT TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Authors can update own courses" ON courses FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Authors can create courses" ON courses FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can delete own courses" ON courses FOR DELETE TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "Published sections are viewable by everyone" ON sections FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_id AND status = 'published'));
CREATE POLICY "Authors can manage sections" ON sections FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_id AND author_id = auth.uid()));

CREATE POLICY "Users can manage own progress" ON progress FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own reviews" ON reviews FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Achievements are viewable by everyone" ON achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read resource tags" ON resource_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read resources" ON resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create resources" ON resources FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update resources" ON resources FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete resources" ON resources FOR DELETE TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "Anyone can read resource tag relations" ON resource_tag_relations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authors can manage resource tags" ON resource_tag_relations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM resources WHERE id = resource_id AND author_id = auth.uid()));

CREATE POLICY "Anyone can read votes" ON resource_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can vote" ON resource_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own votes" ON resource_votes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON resource_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can read own bookmarks" ON resource_bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bookmarks" ON resource_bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

  IF total_votes > 0 THEN
    new_score = (
      (helpful_count * 1.5 + innovative_count * 1.2 + practical_count - not_helpful_count * 1.5 - outdated_count * 1.2)
      / total_votes
    );
  ELSE
    new_score = 0;
  END IF;

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

-- Create triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sections_updated_at
  BEFORE UPDATE ON sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER resource_votes_update
  AFTER INSERT OR UPDATE OR DELETE ON resource_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_resource_helpfulness();