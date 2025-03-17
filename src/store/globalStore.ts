import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface GlobalState {
  // État de l'interface
  isLoading: boolean;
  error: string | null;
  isDarkMode: boolean;
  sidebarOpen: boolean;
  
  // Notifications
  notifications: {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    duration?: number;
  }[];

  // Actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  addNotification: (notification: Omit<GlobalState['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  // État initial
  isLoading: false,
  error: null,
  isDarkMode: true,
  sidebarOpen: false,
  notifications: [],

  // Actions
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  addNotification: (notification) => 
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: crypto.randomUUID() }
      ]
    })),
    
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    })),
}));