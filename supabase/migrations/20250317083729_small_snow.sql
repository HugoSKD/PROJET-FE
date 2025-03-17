/*
  # Complete Course System Setup
  
  1. Tables
    - course_themes (themes)
    - course_modules (modules within themes)
    - courses (courses within modules)
    - sections (course sections)
    - quizzes (section quizzes)
    - quiz_questions (quiz questions)
    - user_progress (user progress tracking)
    - user_quiz_attempts (quiz attempts)
    - reviews (course reviews)
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_quiz_attempts CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS course_modules CASCADE;
DROP TABLE IF EXISTS course_themes CASCADE;

-- Create course_themes table
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

-- Create course_modules table
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

-- Create courses table
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

-- Create sections table
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

-- Create quizzes table
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

-- Create quiz_questions table
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

-- Create user_progress table
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

-- Create user_quiz_attempts table
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

-- Create reviews table
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

-- Enable RLS on all tables
ALTER TABLE course_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for course_themes
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

-- Create policies for course_modules
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

-- Create policies for courses
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

-- Create policies for sections
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

-- Create policies for quizzes
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

-- Create policies for quiz_questions
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

-- Create policies for user_progress
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

-- Create policies for user_quiz_attempts
CREATE POLICY "Enable read access for owners"
ON user_quiz_attempts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for owners"
ON user_quiz_attempts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policies for reviews
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

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

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