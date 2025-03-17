export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          bio: string | null
          role: 'user' | 'author' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'user' | 'author' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'user' | 'author' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      forum_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          slug: string
          icon: string | null
          color: string | null
          parent_id: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
      }
      forum_topics: {
        Row: {
          id: string
          category_id: string
          author_id: string
          title: string
          content: string
          slug: string
          tags: string[]
          is_pinned: boolean
          is_locked: boolean
          views_count: number
          posts_count: number
          last_post_at: string
          last_post_user_id: string | null
          created_at: string
          updated_at: string
        }
      }
      forum_posts: {
        Row: {
          id: string
          topic_id: string
          author_id: string
          content: string
          is_solution: boolean
          reactions_count: number
          parent_id: string | null
          created_at: string
          updated_at: string
        }
      }
      forum_reactions: {
        Row: {
          id: string
          post_id: string
          user_id: string
          type: 'like' | 'helpful' | 'insightful' | 'agree' | 'disagree'
          created_at: string
        }
      }
      forum_subscriptions: {
        Row: {
          topic_id: string
          user_id: string
          created_at: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ForumCategory = Database['public']['Tables']['forum_categories']['Row']
export type ForumTopic = Database['public']['Tables']['forum_topics']['Row']
export type ForumPost = Database['public']['Tables']['forum_posts']['Row']
export type ForumReaction = Database['public']['Tables']['forum_reactions']['Row']
export type ForumSubscription = Database['public']['Tables']['forum_subscriptions']['Row']