import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Quiz, QuizQuestion, QuizAttempt } from '../types/database';

interface QuizState {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  questions: QuizQuestion[];
  attempts: QuizAttempt[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchQuizzes: (sectionId: string) => Promise<void>;
  fetchQuiz: (id: string) => Promise<void>;
  fetchQuestions: (quizId: string) => Promise<void>;
  fetchAttempts: (quizId: string) => Promise<void>;
  createQuiz: (quiz: Partial<Quiz>) => Promise<Quiz>;
  updateQuiz: (id: string, quiz: Partial<Quiz>) => Promise<void>;
  deleteQuiz: (id: string) => Promise<void>;
  createQuestion: (question: Partial<QuizQuestion>) => Promise<void>;
  updateQuestion: (id: string, question: Partial<QuizQuestion>) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  submitAttempt: (quizId: string, answers: Record<string, string>) => Promise<void>;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  quizzes: [],
  currentQuiz: null,
  questions: [],
  attempts: [],
  loading: false,
  error: null,

  fetchQuizzes: async (sectionId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('section_id', sectionId)
        .order('created_at');

      if (error) throw error;
      set({ quizzes: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },

  fetchQuiz: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      set({ currentQuiz: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },

  fetchQuestions: async (quizId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index');

      if (error) throw error;
      set({ questions: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },

  fetchAttempts: async (quizId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quizId)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      set({ attempts: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },

  createQuiz: async (quiz: Partial<Quiz>) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert(quiz)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ quizzes: [data, ...state.quizzes] }));
      return data;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateQuiz: async (id: string, quiz: Partial<Quiz>) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('quizzes')
        .update(quiz)
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        quizzes: state.quizzes.map((q) => 
          q.id === id ? { ...q, ...quiz } : q
        ),
        currentQuiz: state.currentQuiz?.id === id 
          ? { ...state.currentQuiz, ...quiz }
          : state.currentQuiz
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteQuiz: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        quizzes: state.quizzes.filter((q) => q.id !== id),
        currentQuiz: state.currentQuiz?.id === id ? null : state.currentQuiz
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createQuestion: async (question: Partial<QuizQuestion>) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('quiz_questions')
        .insert(question);

      if (error) throw error;

      const { data: newQuestions } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', question.quiz_id)
        .order('order_index');

      set({ questions: newQuestions || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateQuestion: async (id: string, question: Partial<QuizQuestion>) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('quiz_questions')
        .update(question)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        questions: state.questions.map((q) =>
          q.id === id ? { ...q, ...question } : q
        ),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteQuestion: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        questions: state.questions.filter((q) => q.id !== id),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  submitAttempt: async (quizId: string, answers: Record<string, string>) => {
    set({ loading: true, error: null });
    try {
      const { questions } = get();
      
      // Calculer le score
      let correctAnswers = 0;
      questions.forEach(question => {
        if (answers[question.id] === question.correct_answer) {
          correctAnswers++;
        }
      });
      
      const score = Math.round((correctAnswers / questions.length) * 100);

      const { error } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: quizId,
          answers,
          score,
        });

      if (error) throw error;

      const { data: newAttempts } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quizId)
        .order('completed_at', { ascending: false });

      set({ attempts: newAttempts || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));