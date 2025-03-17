import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Badge, UserBadge } from '../types/database';

interface BadgeState {
  badges: Badge[];
  userBadges: UserBadge[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchBadges: () => Promise<void>;
  fetchUserBadges: (userId: string) => Promise<void>;
}

export const useBadgeStore = create<BadgeState>((set) => ({
  badges: [],
  userBadges: [],
  loading: false,
  error: null,

  fetchBadges: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('created_at');

      if (error) throw error;
      set({ badges: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },

  fetchUserBadges: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badges (*)
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      set({ userBadges: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },
}));