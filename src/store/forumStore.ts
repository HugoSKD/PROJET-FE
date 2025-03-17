import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { ForumCategory, ForumTopic, ForumPost, ForumReaction } from '../types/database';

interface ForumState {
  categories: ForumCategory[];
  topics: ForumTopic[];
  currentTopic: ForumTopic | null;
  posts: ForumPost[];
  reactions: Record<string, ForumReaction[]>;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchCategories: () => Promise<void>;
  fetchTopics: (categoryId?: string) => Promise<void>;
  fetchTopic: (id: string) => Promise<void>;
  fetchPosts: (topicId: string) => Promise<void>;
  fetchReactions: (postIds: string[]) => Promise<void>;
  createTopic: (topic: Partial<ForumTopic>) => Promise<ForumTopic>;
  updateTopic: (id: string, topic: Partial<ForumTopic>) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
  createPost: (post: Partial<ForumPost>) => Promise<ForumPost>;
  updatePost: (id: string, post: Partial<ForumPost>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  addReaction: (postId: string, type: ForumReaction['type']) => Promise<void>;
  removeReaction: (postId: string, type: ForumReaction['type']) => Promise<void>;
  toggleSubscription: (topicId: string) => Promise<void>;
}

export const useForumStore = create<ForumState>((set, get) => ({
  categories: [],
  topics: [],
  currentTopic: null,
  posts: [],
  reactions: {},
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('order_index');

      if (error) throw error;
      set({ categories: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },

  fetchTopics: async (categoryId?: string) => {
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('forum_topics')
        .select(`
          *,
          author:profiles!forum_topics_author_id_fkey(username, avatar_url),
          last_post_user:profiles!forum_topics_last_post_user_id_fkey(username)
        `)
        .order('is_pinned', { ascending: false })
        .order('last_post_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ topics: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },

  fetchTopic: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          author:profiles!forum_topics_author_id_fkey(username, avatar_url),
          category:forum_categories!forum_topics_category_id_fkey(name, slug)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      set({ currentTopic: data });

      // Increment view count
      await supabase.rpc('increment_topic_views', { topic_id: id });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },

  fetchPosts: async (topicId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles!forum_posts_author_id_fkey(username, avatar_url)
        `)
        .eq('topic_id', topicId)
        .order('created_at');

      if (error) throw error;
      set({ posts: data });

      // Fetch reactions for all posts
      if (data.length > 0) {
        await get().fetchReactions(data.map(p => p.id));
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },

  fetchReactions: async (postIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('forum_reactions')
        .select('*')
        .in('post_id', postIds);

      if (error) throw error;

      const reactionsByPost: Record<string, ForumReaction[]> = {};
      data.forEach(reaction => {
        if (!reactionsByPost[reaction.post_id]) {
          reactionsByPost[reaction.post_id] = [];
        }
        reactionsByPost[reaction.post_id].push(reaction);
      });

      set({ reactions: reactionsByPost });
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  },

  createTopic: async (topic: Partial<ForumTopic>) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('forum_topics')
        .insert(topic)
        .select()
        .single();

      if (error) throw error;
      set(state => ({ topics: [data, ...state.topics] }));
      return data;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateTopic: async (id: string, topic: Partial<ForumTopic>) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('forum_topics')
        .update(topic)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        topics: state.topics.map(t => t.id === id ? { ...t, ...topic } : t),
        currentTopic: state.currentTopic?.id === id ? { ...state.currentTopic, ...topic } : state.currentTopic
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteTopic: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('forum_topics')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        topics: state.topics.filter(t => t.id !== id),
        currentTopic: state.currentTopic?.id === id ? null : state.currentTopic
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createPost: async (post: Partial<ForumPost>) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert(post)
        .select(`
          *,
          author:profiles!forum_posts_author_id_fkey(username, avatar_url)
        `)
        .single();

      if (error) throw error;
      set(state => ({ posts: [...state.posts, data] }));
      return data;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updatePost: async (id: string, post: Partial<ForumPost>) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('forum_posts')
        .update(post)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        posts: state.posts.map(p => p.id === id ? { ...p, ...post } : p)
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deletePost: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        posts: state.posts.filter(p => p.id !== id)
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  addReaction: async (postId: string, type: ForumReaction['type']) => {
    try {
      const { data, error } = await supabase
        .from('forum_reactions')
        .insert({ post_id: postId, type })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        reactions: {
          ...state.reactions,
          [postId]: [...(state.reactions[postId] || []), data]
        }
      }));
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  },

  removeReaction: async (postId: string, type: ForumReaction['type']) => {
    try {
      const { error } = await supabase
        .from('forum_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('type', type);

      if (error) throw error;

      set(state => ({
        reactions: {
          ...state.reactions,
          [postId]: state.reactions[postId]?.filter(r => r.type !== type) || []
        }
      }));
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  },

  toggleSubscription: async (topicId: string) => {
    try {
      const { data: existing } = await supabase
        .from('forum_subscriptions')
        .select()
        .eq('topic_id', topicId)
        .single();

      if (existing) {
        await supabase
          .from('forum_subscriptions')
          .delete()
          .eq('topic_id', topicId);
      } else {
        await supabase
          .from('forum_subscriptions')
          .insert({ topic_id: topicId });
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
    }
  }
}));