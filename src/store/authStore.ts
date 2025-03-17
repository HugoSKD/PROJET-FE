import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';
import { z } from 'zod';

const emailSchema = z.string().email('Email invalide');
const passwordSchema = z.string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre');
const usernameSchema = z.string()
  .min(3, 'Le pseudo doit contenir au moins 3 caractères')
  .max(20, 'Le pseudo ne peut pas dépasser 20 caractères')
  .regex(/^[a-z0-9_]+$/, 'Le pseudo ne peut contenir que des lettres minuscules, chiffres et underscores');

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);

      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!user) throw new Error('Erreur de connexion');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      set({ user, profile, error: null });
    } catch (error) {
      let errorMessage = 'Une erreur est survenue';
      if (error instanceof z.ZodError) {
        errorMessage = error.errors[0].message;
      } else if (error instanceof Error) {
        if (error.message === 'Invalid login credentials') {
          errorMessage = 'Email ou mot de passe incorrect';
        } else {
          errorMessage = error.message;
        }
      }
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email: string, password: string, username: string) => {
    set({ loading: true, error: null });
    try {
      // Validation des entrées
      emailSchema.parse(email);
      passwordSchema.parse(password);
      usernameSchema.parse(username);

      // Vérification de l'existence du pseudo
      const { data: existingUser, error: usernameCheckError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (usernameCheckError) throw usernameCheckError;
      if (existingUser) throw new Error('Ce pseudo est déjà pris');

      // Inscription
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('Erreur lors de la création du compte');

      // On attend un peu pour laisser le trigger handle_new_user s'exécuter
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Récupération du profil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      set({ user, profile, error: null });
    } catch (error) {
      let errorMessage = 'Une erreur est survenue';
      if (error instanceof z.ZodError) {
        errorMessage = error.errors[0].message;
      } else if (error instanceof Error) {
        if (error.message === 'User already registered') {
          errorMessage = 'Cet email est déjà utilisé';
        } else {
          errorMessage = error.message;
        }
      }
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, profile: null, error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erreur de déconnexion' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  checkAuth: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        set({ user: session.user, profile, error: null });
      }
    } catch (error) {
      console.error('Erreur de vérification de l\'authentification:', error);
      set({ error: error instanceof Error ? error.message : 'Erreur de vérification' });
    }
  },

  updateProfile: async (profileData: Partial<Profile>) => {
    const { user } = get();
    if (!user) throw new Error('Non authentifié');

    set({ loading: true, error: null });
    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      set({ profile: updatedProfile, error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erreur de mise à jour du profil' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateAvatar: async (avatarUrl: string) => {
    const { user } = get();
    if (!user) throw new Error('Non authentifié');

    set({ loading: true, error: null });
    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      set({ profile: updatedProfile, error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erreur de mise à jour de l\'avatar' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteAccount: async () => {
    const { user } = get();
    if (!user) throw new Error('Non authentifié');

    set({ loading: true, error: null });
    try {
      const { error } = await supabase.rpc('delete_user');
      if (error) throw error;
      
      await supabase.auth.signOut();
      set({ user: null, profile: null, error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erreur de suppression du compte' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

// Écouteur des changements d'état d'authentification
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    useAuthStore.setState({ 
      user: session.user, 
      profile,
      loading: false,
      error: null 
    });
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ 
      user: null, 
      profile: null,
      loading: false,
      error: null 
    });
  }
});