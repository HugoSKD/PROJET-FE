/*
  # Système de cours complet
  
  1. Nouvelles tables
    - course_themes (thèmes des cours)
    - course_modules (modules dans chaque thème)
    - courses (cours dans chaque module)
    - sections (sections de cours)
    - quizzes (quiz dans les sections)
    - quiz_questions (questions des quiz)
    - user_progress (progression des utilisateurs)
    - user_quiz_attempts (tentatives de quiz)
    
  2. Relations
    - Hiérarchie: Thème -> Module -> Cours -> Section -> Quiz
    - Suivi utilisateur: progression et résultats des quiz
    
  3. Sécurité
    - RLS pour toutes les tables
    - Politiques d'accès différenciées
*/

-- Thèmes de cours
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

-- Modules de cours
CREATE TABLE course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id uuid REFERENCES course_themes(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  difficulty_level text NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  order_index integer NOT NULL DEFAULT 0,
  prerequisites jsonb DEFAULT '[]',
  learning_objectives jsonb DEFAULT '[]',
  estimated_duration integer, -- en minutes
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cours
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
  estimated_duration integer, -- en minutes
  points_reward integer DEFAULT 0,
  requirements jsonb DEFAULT '[]',
  learning_objectives jsonb DEFAULT '[]',
  resources jsonb DEFAULT '[]',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sections de cours
CREATE TABLE sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'video', 'interactive')),
  order_index integer NOT NULL DEFAULT 0,
  estimated_duration integer, -- en minutes
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quiz
CREATE TABLE quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES sections(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  passing_score integer NOT NULL DEFAULT 70,
  max_attempts integer DEFAULT NULL,
  time_limit integer DEFAULT NULL, -- en minutes, NULL = pas de limite
  show_correct_answers boolean DEFAULT true,
  randomize_questions boolean DEFAULT false,
  points_reward integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Questions de quiz
CREATE TABLE quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  question text NOT NULL,
  type text NOT NULL CHECK (type IN ('multiple_choice', 'true_false', 'open')),
  options jsonb DEFAULT NULL, -- pour les questions à choix multiples
  correct_answer text NOT NULL,
  explanation text,
  points integer DEFAULT 1,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Progression des utilisateurs
CREATE TABLE user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  section_id uuid REFERENCES sections(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completion_date timestamptz,
  last_accessed timestamptz DEFAULT now(),
  time_spent integer DEFAULT 0, -- en secondes
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, section_id)
);

-- Tentatives de quiz
CREATE TABLE user_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  score integer,
  answers jsonb NOT NULL DEFAULT '{}',
  time_spent integer, -- en secondes
  attempt_number integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, quiz_id, attempt_number)
);

-- Active RLS sur toutes les tables
ALTER TABLE course_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Politiques RLS

-- Thèmes
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

-- Modules
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

-- Cours
CREATE POLICY "Published courses are viewable by everyone"
  ON courses FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authors can view their own courses"
  ON courses FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can manage their courses"
  ON courses FOR ALL
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
CREATE POLICY "Published sections are viewable by everyone"
  ON sections FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_id
    AND courses.status = 'published'
  ));

CREATE POLICY "Authors can manage sections"
  ON sections FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_id
    AND (courses.author_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'author')
    ))
  ));

-- Quiz
CREATE POLICY "Published quizzes are viewable by everyone"
  ON quizzes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM sections
    JOIN courses ON courses.id = sections.course_id
    WHERE sections.id = section_id
    AND courses.status = 'published'
  ));

-- Questions de quiz
CREATE POLICY "Quiz questions are viewable with quiz"
  ON quiz_questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM quizzes
    JOIN sections ON sections.id = quizzes.section_id
    JOIN courses ON courses.id = sections.course_id
    WHERE quizzes.id = quiz_id
    AND courses.status = 'published'
  ));

-- Progression
CREATE POLICY "Users can view and manage their own progress"
  ON user_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tentatives de quiz
CREATE POLICY "Users can view and manage their own quiz attempts"
  ON user_quiz_attempts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index pour les performances
CREATE INDEX course_themes_order_idx ON course_themes(order_index);
CREATE INDEX course_modules_theme_order_idx ON course_modules(theme_id, order_index);
CREATE INDEX courses_module_order_idx ON courses(module_id, order_index);
CREATE INDEX sections_course_order_idx ON sections(course_id, order_index);
CREATE INDEX quiz_questions_quiz_order_idx ON quiz_questions(quiz_id, order_index);
CREATE INDEX user_progress_user_course_idx ON user_progress(user_id, course_id);
CREATE INDEX user_quiz_attempts_user_quiz_idx ON user_quiz_attempts(user_id, quiz_id);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_course_themes_updated_at
    BEFORE UPDATE ON course_themes
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_course_modules_updated_at
    BEFORE UPDATE ON course_modules
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_sections_updated_at
    BEFORE UPDATE ON sections
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
    BEFORE UPDATE ON quizzes
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();