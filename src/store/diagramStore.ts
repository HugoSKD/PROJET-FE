import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Diagram } from '../types/database';

interface DiagramState {
  diagrams: Diagram[];
  currentDiagram: Diagram | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchDiagrams: (sectionId: string) => Promise<void>;
  fetchDiagram: (id: string) => Promise<void>;
  createDiagram: (diagram: Partial<Diagram>) => Promise<Diagram>;
  updateDiagram: (id: string, diagram: Partial<Diagram>) => Promise<void>;
  deleteDiagram: (id: string) => Promise<void>;
}

export const useDiagramStore = create<DiagramState>((set, get) => ({
  diagrams: [],
  currentDiagram: null,
  loading: false,
  error: null,

  fetchDiagrams: async (sectionId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('diagrams')
        .select('*')
        .eq('section_id', sectionId)
        .order('created_at');

      if (error) throw error;
      set({ diagrams: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },

  fetchDiagram: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('diagrams')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      set({ currentDiagram: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },

  createDiagram: async (diagram: Partial<Diagram>) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('diagrams')
        .insert(diagram)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ diagrams: [data, ...state.diagrams] }));
      return data;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateDiagram: async (id: string, diagram: Partial<Diagram>) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('diagrams')
        .update(diagram)
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        diagrams: state.diagrams.map((d) => 
          d.id === id ? { ...d, ...diagram } : d
        ),
        currentDiagram: state.currentDiagram?.id === id 
          ? { ...state.currentDiagram, ...diagram }
          : state.currentDiagram
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteDiagram: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('diagrams')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        diagrams: state.diagrams.filter((d) => d.id !== id),
        currentDiagram: state.currentDiagram?.id === id ? null : state.currentDiagram
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));