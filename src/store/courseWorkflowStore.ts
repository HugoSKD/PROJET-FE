import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Course } from '../types/database';

export type CourseStatus = 'draft' | 'pending' | 'published' | 'rejected';

interface CourseWorkflowState {
  pendingCourses: Course[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchPendingCourses: () => Promise<void>;
  submitForReview: (courseId: string) => Promise<void>;
  approveCourse: (courseId: string) => Promise<void>;
  rejectCourse: (courseId: string, reason: string) => Promise<void>;
}

export const useCourseWorkflowStore = create<CourseWorkflowState>((set) => ({
  pendingCourses: [],
  loading: false,
  error: null,

  fetchPendingCourses: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*, profiles(*)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ pendingCourses: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },

  submitForReview: async (courseId: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('courses')
        .update({ status: 'pending' })
        .eq('id', courseId);

      if (error) throw error;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  approveCourse: async (courseId: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('courses')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', courseId);

      if (error) throw error;
      
      set((state) => ({
        pendingCourses: state.pendingCourses.filter(c => c.id !== courseId)
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  rejectCourse: async (courseId: string, reason: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('courses')
        .update({ 
          status: 'rejected',
          rejection_reason: reason
        })
        .eq('id', courseId);

      if (error) throw error;
      
      set((state) => ({
        pendingCourses: state.pendingCourses.filter(c => c.id !== courseId)
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));