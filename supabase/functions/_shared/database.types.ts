export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "user" | "admin";
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          date: string;
          location: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      gallery: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          url: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      site_settings: {
        Row: {
          id: number;
          church_name: string | null;
          church_address: string | null;
          phone_number: string | null;
          email: string | null;
          enable_donations: boolean;
          enable_membership: boolean;
          maintenance_mode: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      members: {
        Row: {
          id: string;
          user_id: string | null;
          full_name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          membership_type: "regular" | "student" | "senior" | "family";
          membership_status: "pending" | "active" | "inactive";
          join_date: string;
          last_renewal_date: string | null;
          next_renewal_date: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      donations: {
        Row: {
          id: string;
          user_id: string | null;
          amount: number;
          currency: string;
          donation_type: "one_time" | "recurring" | "special";
          purpose: string | null;
          transaction_id: string | null;
          status: "pending" | "completed" | "failed";
          payment_method: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          announcement_type: "general" | "event" | "urgent";
          start_date: string;
          end_date: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          table_name: string | null;
          record_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          created_at: string;
        };
      };
      sermons: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          scripture_reference: string | null;
          audio_url: string | null;
          preacher: string | null;
          sermon_date: string;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      testimonials: {
        Row: {
          id: string;
          name: string;
          content: string;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      prayer_requests: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          request: string;
          is_public: boolean;
          is_answered: boolean;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}
