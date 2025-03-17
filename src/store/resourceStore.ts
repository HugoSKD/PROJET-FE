import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Resource, ResourceTag, ResourceVote } from '../types/database';

interface ResourceState {
  resources: Resource[];
  tags: ResourceTag[];
  userVotes: Record<string, ResourceVote[]>;
  userBookmarks: Set<string>;
  loading: boolean;
  error: string | null;
  fetchResources: () => Promise<void>;
  fetchTags: () => Promise<void>;
  fetchUserVotes: () => Promise<void>;
  fetchUserBookmarks: () => Promise<void>;
  createResource: (resource: Partial<Resource>) => Promise<void>;
  updateResource: (id: string, resource: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  vote: (resourceId: string, voteType: ResourceVote['vote_type']) => Promise<void>;
  toggleBookmark: (resourceId: string) => Promise<void>;
}

export const useResourceStore = create<ResourceState>((set, get) => ({
  resources: [],
  tags: [],
  userVotes: {},
  userBookmarks: new Set(),
  loading: false,
  error: null,

  fetchResources: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          tags:resource_tag_relations(
            resource_tags(*)
          ),
          author:profiles(*)
        `)
        .order('helpfulness_score', { ascending: false });

      if (error) throw error;

      // Transform the nested tags data
      const resources = data.map(resource => ({
        ...resource,
        tags: resource.tags?.map((t: any) => t.resource_tags) || [],
      }));

      set({ resources });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },

  fetchTags: async () => {
    try {
      const { data, error } = await supabase
        .from('resource_tags')
        .select('*')
        .order('name');

      if (error) throw error;
      set({ tags: data });
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  },

  fetchUserVotes: async () => {
    try {
      const { data, error } = await supabase
        .from('resource_votes')
        .select('*');

      if (error) throw error;

      const votes: Record<string, ResourceVote[]> = {};
      data.forEach(vote => {
        if (!votes[vote.resource_id]) {
          votes[vote.resource_id] = [];
        }
        votes[vote.resource_id].push(vote);
      });

      set({ userVotes: votes });
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  },

  fetchUserBookmarks: async () => {
    try {
      const { data, error } = await supabase
        .from('resource_bookmarks')
        .select('resource_id');

      if (error) throw error;

      set({ userBookmarks: new Set(data.map(b => b.resource_id)) });
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  },

  createResource: async (resource: Partial<Resource>) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert(resource)
        .select()
        .single();

      if (error) throw error;

      if (resource.tags?.length) {
        const tagRelations = resource.tags.map(tag => ({
          resource_id: data.id,
          tag_id: tag.id,
        }));

        const { error: tagError } = await supabase
          .from('resource_tag_relations')
          .insert(tagRelations);

        if (tagError) throw tagError;
      }

      await get().fetchResources();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateResource: async (id: string, resource: Partial<Resource>) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('resources')
        .update(resource)
        .eq('id', id);

      if (error) throw error;

      if (resource.tags) {
        // Delete existing relations
        await supabase
          .from('resource_tag_relations')
          .delete()
          .eq('resource_id', id);

        // Insert new relations
        const tagRelations = resource.tags.map(tag => ({
          resource_id: id,
          tag_id: tag.id,
        }));

        const { error: tagError } = await supabase
          .from('resource_tag_relations')
          .insert(tagRelations);

        if (tagError) throw tagError;
      }

      await get().fetchResources();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteResource: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        resources: state.resources.filter(r => r.id !== id),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  vote: async (resourceId: string, voteType: ResourceVote['vote_type']) => {
    try {
      const { userVotes } = get();
      const existingVote = userVotes[resourceId]?.find(v => v.vote_type === voteType);

      if (existingVote) {
        // Remove vote if it already exists
        const { error } = await supabase
          .from('resource_votes')
          .delete()
          .eq('id', existingVote.id);

        if (error) throw error;
      } else {
        // Add new vote
        const { error } = await supabase
          .from('resource_votes')
          .insert({
            resource_id: resourceId,
            vote_type: voteType,
          });

        if (error) throw error;
      }

      await Promise.all([
        get().fetchResources(),
        get().fetchUserVotes(),
      ]);
    } catch (error) {
      console.error('Error voting:', error);
    }
  },

  toggleBookmark: async (resourceId: string) => {
    try {
      const { userBookmarks } = get();
      const isBookmarked = userBookmarks.has(resourceId);

      if (isBookmarked) {
        const { error } = await supabase
          .from('resource_bookmarks')
          .delete()
          .eq('resource_id', resourceId);

        if (error) throw error;

        set(state => ({
          userBookmarks: new Set([...state.userBookmarks].filter(id => id !== resourceId)),
        }));
      } else {
        const { error } = await supabase
          .from('resource_bookmarks')
          .insert({ resource_id: resourceId });

        if (error) throw error;

        set(state => ({
          userBookmarks: new Set([...state.userBookmarks, resourceId]),
        }));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  },
}));