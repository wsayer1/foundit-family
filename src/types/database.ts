export type AppearancePreference = 'light' | 'dark' | 'system';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          points: number;
          items_posted: number;
          items_claimed: number;
          created_at: string;
          appearance_preference: AppearancePreference;
          location_enabled: boolean;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          points?: number;
          items_posted?: number;
          items_claimed?: number;
          created_at?: string;
          appearance_preference?: AppearancePreference;
          location_enabled?: boolean;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
          points?: number;
          items_posted?: number;
          items_claimed?: number;
          created_at?: string;
          appearance_preference?: AppearancePreference;
          location_enabled?: boolean;
        };
      };
      items: {
        Row: {
          id: string;
          user_id: string;
          image_url: string;
          description: string;
          latitude: number;
          longitude: number;
          status: 'available' | 'claimed' | 'expired';
          still_there_count: number;
          created_at: string;
          claimed_at: string | null;
          claimed_by: string | null;
          category: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_url: string;
          description: string;
          latitude: number;
          longitude: number;
          status?: 'available' | 'claimed' | 'expired';
          still_there_count?: number;
          created_at?: string;
          claimed_at?: string | null;
          claimed_by?: string | null;
          category?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          image_url?: string;
          description?: string;
          latitude?: number;
          longitude?: number;
          status?: 'available' | 'claimed' | 'expired';
          still_there_count?: number;
          created_at?: string;
          claimed_at?: string | null;
          claimed_by?: string | null;
          category?: string | null;
        };
      };
      confirmations: {
        Row: {
          id: string;
          item_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Item = Database['public']['Tables']['items']['Row'];
export type Confirmation = Database['public']['Tables']['confirmations']['Row'];

export interface ItemWithProfile extends Item {
  profiles: Pick<Profile, 'username' | 'avatar_url'> | null;
}
