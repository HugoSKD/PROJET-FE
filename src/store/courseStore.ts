import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Course, Section, Progress, Review } from '../types/database';

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  sections: Section[];
  progress: Progress[];
  reviews: Review[];
  loading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  fetchCourse: (id: string) => Promise<void>;
  fetchSections: (courseId: string) => Promise<void>;
  fetchProgress: (courseId: string) => Promise<void>;
  fetchReviews: (courseId: string) => Promise<void>;
  createCourse: (course: Partial<Course>) => Promise<Course>;
  updateCourse: (id: string, course: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  createSection: (section: Partial<Section>) => Promise<void>;
  updateSection: (id: string, section: Partial<Section>) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;
  updateProgress: (sectionId: string, completed: boolean) => Promise<void>;
  createReview: (review: Partial<Review>) => Promise<void>;
  updateReview: (id: string, review: Partial<Review>) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  currentCourse: null,
  sections: [],
  progress: [],
  reviews: [],
  loading: false,
  error: null,

  fetchCourses: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ courses: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },

  fetchCourse: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      set({ currentCourse: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },

  fetchSections: async (courseId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (error) throw error;
      set({ sections: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },

  fetchProgress: async (courseId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('progress')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at');

      if (error) throw error;
      set({ progress: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },

  fetchReviews: async (courseId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(*)')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ reviews: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },

  createCourse: async (course: Partial<Course>) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert(course)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ courses: [data, ...state.courses] }));
      return data;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateCourse: async (id: string, course: Partial<Course>) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('courses')
        .update(course)
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        courses: state.courses.map((c) => 
          c.id === id ? { ...c, ...course } : c
        ),
        currentCourse: state.currentCourse?.id === id 
          ? { ...state.currentCourse, ...course }
          : state.currentCourse
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteCourse: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        courses: state.courses.filter((c) => c.id !== id),
        currentCourse: state.currentCourse?.id === id ? null : state.currentCourse
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createSection: async (section: Partial<Section>) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('sections')
        .insert(section);

      if (error) throw error;

      const { data: newSections } = await supabase
        .from('sections')
        .select('*')
        .eq('course_id', section.course_id)
        .order('order_index');

      set({ sections: newSections || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateSection: async (id: string, section: Partial<Section>) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('sections')
        .update(section)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        sections: state.sections.map((s) =>
          s.id === id ? { ...s, ...section } : s
        ),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteSection: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        sections: state.sections.filter((s) => s.id !== id),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateProgress: async (sectionId: string, completed: boolean) => {
    set({ loading: true, error: null });
    try {
      const { currentCourse } = get();
      if (!currentCourse) throw new Error('No current course');

      const { error } = await supabase
        .from('progress')
        .upsert({
          section_id: sectionId,
          course_id: currentCourse.id,
          completed,
          last_accessed: new Date().toISOString(),
        });

      if (error) throw error;

      const { data: newProgress } = await supabase
        .from('progress')
        .select('*')
        .eq('course_id', currentCourse.id);

      set({ progress: newProgress || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createReview: async (review: Partial<Review>) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('reviews')
        .insert(review);

      if (error) throw error;

      const { data: newReviews } = await supabase
        .from('reviews')
        .select('*, profiles(*)')
        .eq('course_id', review.course_id)
        .order('created_at', { ascending: false });

      set({ reviews: newReviews || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateReview: async (id: string, review: Partial<Review>) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('reviews')
        .update(review)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        reviews: state.reviews.map((r) =>
          r.id === id ? { ...r, ...review } : r
        ),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteReview: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        reviews: state.reviews.filter((r) => r.id !== id),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));