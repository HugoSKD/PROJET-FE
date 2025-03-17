/*
  # Complete Database Schema
  
  This migration consolidates all previous migrations into a single, clean schema that includes:
  1. Base tables (profiles)
  2. Course system (themes, modules, courses, sections, quizzes)
  3. Forum system (categories, topics, posts, reactions)
  4. Resource system (tags, resources, votes, bookmarks)
  5. All necessary functions, triggers, and policies
*/

-- Drop existing schema and recreate
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Create extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  avatar_url text,
  bio text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'author', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Course system tables
CREATE TABLE course_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  color text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id uuid REFERENCES course_themes(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  difficulty_level text NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  order_index integer NOT NULL DEFAULT 0,
  prerequisites jsonb DEFAULT '[]',
  learning_objectives jsonb DEFAULT '[]',
  estimated_duration integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES course_modules(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  content jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  difficulty_level text NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  order_index integer NOT NULL DEFAULT 0,
  estimated_duration integer,
  points_reward integer DEFAULT 0,
  requirements jsonb DEFAULT '[]',
  learning_objectives jsonb DEFAULT '[]',
  resources jsonb DEFAULT '[]',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'video', 'interactive')),
  order_index integer NOT NULL DEFAULT 0,
  estimated_duration integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES sections(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  passing_score integer NOT NULL DEFAULT 70,
  max_attempts integer,
  time_limit integer,
  show_correct_answers boolean DEFAULT true,
  randomize_questions boolean DEFAULT false,
  points_reward integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  question text NOT NULL,
  type text NOT NULL CHECK (type IN ('multiple_choice', 'true_false', 'open')),
  options jsonb,
  correct_answer text NOT NULL,
  explanation text,
  points integer DEFAULT 1,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE user_progress (
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

CREATE TABLE user_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  score integer,
  answers jsonb NOT NULL DEFAULT '{}',
  time_spent integer,
  attempt_number integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, quiz_id, attempt_number)
);

CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Forum system tables
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

CREATE TABLE forum_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('like', 'helpful', 'insightful', 'agree', 'disagree')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id, type)
);

CREATE TABLE forum_subscriptions (
  topic_id uuid REFERENCES forum_topics(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (topic_id, user_id)
);

-- Resource system tables
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
ALTER TABLE course_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Course themes
CREATE POLICY "Themes are viewable by everyone"
ON course_themes FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage themes"
ON course_themes FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid()
  AND profiles.role = 'admin'
));

-- Course modules
CREATE POLICY "Modules are viewable by everyone"
ON course_modules FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage modules"
ON course_modules FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid()
  AND profiles.role = 'admin'
));

-- Courses
CREATE POLICY "Enable read access for all users"
ON courses FOR SELECT
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

-- Sections
CREATE POLICY "Enable read access for all users"
ON sections FOR SELECT
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

-- Quizzes and questions
CREATE POLICY "Enable read access for all users"
ON quizzes FOR SELECT
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

CREATE POLICY "Enable read access for all users"
ON quiz_questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM quizzes
    JOIN sections ON sections.id = quizzes.section_id
    JOIN courses ON courses.id = sections.course_id
    WHERE quizzes.id = quiz_id
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

-- Progress
CREATE POLICY "Enable read access for owners"
ON user_progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for owners"
ON user_progress FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for owners"
ON user_progress FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for owners"
ON user_progress FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Quiz attempts
CREATE POLICY "Enable read access for owners"
ON user_quiz_attempts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for owners"
ON user_quiz_attempts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Reviews
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

-- Forum categories
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

-- Forum topics
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

-- Forum posts
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

-- Forum reactions
CREATE POLICY "Reactions are viewable by everyone"
ON forum_reactions FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can manage own reactions"
ON forum_reactions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Forum subscriptions
CREATE POLICY "Users can view own subscriptions"
ON forum_subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own subscriptions"
ON forum_subscriptions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Resource tags
CREATE POLICY "Anyone can read resource tags"
ON resource_tags FOR SELECT
TO public
USING (true);

-- Resources
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

-- Resource tag relations
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

-- Resource votes
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

-- Resource bookmarks
CREATE POLICY "Users can read own bookmarks"
ON resource_bookmarks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bookmarks"
ON resource_bookmarks FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX course_themes_order_idx ON course_themes(order_index);
CREATE INDEX course_modules_theme_order_idx ON course_modules(theme_id, order_index);
CREATE INDEX courses_module_order_idx ON courses(module_id, order_index);
CREATE INDEX sections_course_order_idx ON sections(course_id, order_index);
CREATE INDEX quiz_questions_quiz_order_idx ON quiz_questions(quiz_id, order_index);
CREATE INDEX user_progress_user_course_idx ON user_progress(user_id, course_id);
CREATE INDEX user_quiz_attempts_user_quiz_idx ON user_quiz_attempts(user_id, quiz_id);
CREATE INDEX reviews_course_id_idx ON reviews(course_id);
CREATE INDEX reviews_user_id_idx ON reviews(user_id);
CREATE INDEX reviews_user_profiles_idx ON reviews(user_id);
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
CREATE INDEX resource_tags_name_idx ON resource_tags(name);
CREATE INDEX resources_author_id_idx ON resources(author_id);
CREATE INDEX resource_votes_resource_user_idx ON resource_votes(resource_id, user_id);
CREATE INDEX resource_bookmarks_user_idx ON resource_bookmarks(user_id);

-- Create triggers
CREATE TRIGGER update_course_themes_updated_at
    BEFORE UPDATE ON course_themes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_modules_updated_at
    BEFORE UPDATE ON course_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sections_updated_at
    BEFORE UPDATE ON sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
    BEFORE UPDATE ON quizzes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'user_' || substr(NEW.id::text, 1, 8)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create function to get review with profile
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
        SELECT id, username, avatar_url, role
        FROM profiles
        WHERE id = review_row.user_id
      ) p
    )
  );
$$;

-- Create function to update resource helpfulness
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

-- Create trigger for resource votes
CREATE TRIGGER resource_votes_update
  AFTER INSERT OR UPDATE OR DELETE ON resource_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_resource_helpfulness();

-- Create function to update topic post count
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

-- Create trigger for topic post count
CREATE TRIGGER update_topic_post_count
  AFTER INSERT OR DELETE ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_topic_post_count();

-- Create function to update post reaction count
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

-- Create trigger for post reaction count
CREATE TRIGGER update_post_reaction_count
  AFTER INSERT OR DELETE ON forum_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_post_reaction_count();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION get_review_with_profile TO anon;
GRANT EXECUTE ON FUNCTION get_review_with_profile TO authenticated;