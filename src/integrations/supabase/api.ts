import { supabase } from './client';
import { Database } from './types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Member = Database['public']['Tables']['members']['Row'];
type Donation = Database['public']['Tables']['donations']['Row'];
type Event = Database['public']['Tables']['events']['Row'];
type Announcement = Database['public']['Tables']['announcements']['Row'];

export const api = {
  auth: {
    // Auth related functions
    getCurrentUser: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session?.user;
    },
    getProfile: async (userId: string): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    },
  },
  
  members: {
    // Member management
    getMembers: async (filters?: {
      status?: string;
      type?: string;
      search?: string;
    }): Promise<Member[]> => {
      let query = supabase.from('members').select('*');
      
      if (filters?.status) {
        query = query.eq('membership_status', filters.status);
      }
      if (filters?.type) {
        query = query.eq('membership_type', filters.type);
      }
      if (filters?.search) {
        query = query.ilike('full_name', `%${filters.search}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    
    createMember: async (memberData: Omit<Member, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('members')
        .insert([memberData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },

  events: {
    // Event management
    getEvents: async (filters?: {
      status?: string;
      type?: string;
      from?: Date;
      to?: Date;
    }): Promise<Event[]> => {
      let query = supabase.from('events').select('*');
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.type) {
        query = query.eq('event_type', filters.type);
      }
      if (filters?.from) {
        query = query.gte('date', filters.from.toISOString());
      }
      if (filters?.to) {
        query = query.lte('date', filters.to.toISOString());
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    
    createEvent: async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },

  donations: {
    // Donation tracking
    getDonations: async (filters?: {
      status?: string;
      type?: string;
      from?: Date;
      to?: Date;
    }): Promise<Donation[]> => {
      let query = supabase.from('donations').select('*');
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.type) {
        query = query.eq('donation_type', filters.type);
      }
      if (filters?.from) {
        query = query.gte('created_at', filters.from.toISOString());
      }
      if (filters?.to) {
        query = query.lte('created_at', filters.to.toISOString());
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    
    createDonation: async (donationData: Omit<Donation, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('donations')
        .insert([donationData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },

  announcements: {
    // Announcement management
    getAnnouncements: async (filters?: {
      type?: string;
      active?: boolean;
    }): Promise<Announcement[]> => {
      let query = supabase.from('announcements').select('*');
      
      if (filters?.type) {
        query = query.eq('announcement_type', filters.type);
      }
      if (filters?.active !== undefined) {
        query = query.eq('is_active', filters.active);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    
    createAnnouncement: async (announcementData: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('announcements')
        .insert([announcementData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },

  storage: {
    // File storage helpers
    uploadFile: async (bucket: string, path: string, file: File) => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);
      if (error) throw error;
      return data;
    },
    
    getPublicUrl: (bucket: string, path: string) => {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
      return data.publicUrl;
    },
  },
};
