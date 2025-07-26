/**
 * JSON type for Postgres JSON/JSONB columns
 */
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// ...existing code...

/**
 * Convenience type for Appointment row
 */
export type Appointment = Database['public']['Tables']['appointments']['Row'];
/**
 * Main database schema types for Supabase
 * Modernized for strictness and maintainability
 */
export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string;
          service_title: string;
          requested_date: string;
          requested_time: string;
          admin_notes: string | null;
          admin_response: string | null;
          confirmed_date: string | null;
          confirmed_time: string | null;
          notes: string | null;
          responded_at: string | null;
          responded_by: string | null;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Omit<Database['public']['Tables']['appointments']['Row'], 'id'>> & { email: string; name: string; phone: string; service_title: string; requested_date: string; requested_time: string; };
        Update: Partial<Database['public']['Tables']['appointments']['Row']>;
        Relationships: [
          {
            foreignKeyName: "appointments_responded_by_fkey";
            columns: ["responded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      donations: {
        Row: {
          id: string;
          amount: number;
          donor_email: string | null;
          donor_name: string | null;
          payment_id: string | null;
          payment_method: string | null;
          payment_status: string | null;
          purpose: string | null;
          is_anonymous: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['donations']['Row'], 'id' | 'created_at' | 'updated_at'>> & { amount: number; };
        Update: Partial<Database['public']['Tables']['donations']['Row']>;
        Relationships: [];
      };
      email_campaigns: {
        Row: {
          id: string;
          name: string;
          subject: string;
          content: string;
          status: string | null;
          scheduled_at: string | null;
          sent_at: string | null;
          recipient_count: number | null;
          sent_count: number | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Omit<Database['public']['Tables']['email_campaigns']['Row'], 'id'>> & { name: string; subject: string; content: string; };
        Update: Partial<Database['public']['Tables']['email_campaigns']['Row']>;
        Relationships: [];
      };
      email_settings: {
      // ...existing code for other tables, modernized in the same way...
        Row: {
          auto_welcome_email: boolean | null;
          created_at: string | null;
          enable_newsletters: boolean | null;
          from_email: string | null;
          from_name: string | null;
          id: number;
          newsletter_frequency: string | null;
          smtp_host: string | null;
          smtp_password: string | null;
          smtp_port: number | null;
          smtp_username: string | null;
          updated_at: string | null;
        };
        Insert: {
          auto_welcome_email?: boolean | null;
          created_at?: string | null;
          enable_newsletters?: boolean | null;
          from_email?: string | null;
          from_name?: string | null;
          id?: number;
          newsletter_frequency?: string | null;
          smtp_host?: string | null;
          smtp_password?: string | null;
          smtp_port?: number | null;
          smtp_username?: string | null;
          updated_at?: string | null;
        };
        Update: {
          auto_welcome_email?: boolean | null;
          created_at?: string | null;
          enable_newsletters?: boolean | null;
          from_email?: string | null;
          from_name?: string | null;
          id?: number;
          newsletter_frequency?: string | null;
          smtp_host?: string | null;
          smtp_password?: string | null;
          smtp_port?: number | null;
          smtp_username?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      email_subscribers: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          name: string | null;
          preferences: Json | null;
          status: string | null;
          subscribed_at: string | null;
          unsubscribed_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id?: string;
          name?: string | null;
          preferences?: Json | null;
          status?: string | null;
          subscribed_at?: string | null;
          unsubscribed_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          name?: string | null;
          preferences?: Json | null;
          status?: string | null;
          subscribed_at?: string | null;
          unsubscribed_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      email_templates: {
        Row: {
          content: string;
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          name: string;
          subject: string;
          template_type: string;
          updated_at: string | null;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          subject: string;
          template_type: string;
          updated_at?: string | null;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          subject?: string;
          template_type?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      events: {
        Row: {
          created_at: string;
          description: string | null;
          event_date: string;
          event_time: string | null;
          id: string;
          image_url: string | null;
          is_featured: boolean | null;
          location: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          event_date: string;
          event_time?: string | null;
          id?: string;
          image_url?: string | null;
          is_featured?: boolean | null;
          location?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          event_date?: string;
          event_time?: string | null;
          id?: string;
          image_url?: string | null;
          is_featured?: boolean | null;
          location?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      gallery: {
        Row: {
          category: string | null;
          created_at: string;
          description: string | null;
          id: string;
          image_url: string;
          is_featured: boolean | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url: string;
          is_featured?: boolean | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string;
          is_featured?: boolean | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      members: {
        Row: {
          address: string | null;
          created_at: string;
          email: string | null;
          full_name: string;
          id: string;
          join_date: string | null;
          last_renewal_date: string | null;
          membership_date: string | null;
          membership_status: string | null;
          membership_type: string | null;
          next_renewal_date: string | null;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          email?: string | null;
          full_name: string;
          id?: string;
          join_date?: string | null;
          last_renewal_date?: string | null;
          membership_date?: string | null;
          membership_status?: string | null;
          membership_type?: string | null;
          next_renewal_date?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string;
          id?: string;
          join_date?: string | null;
          last_renewal_date?: string | null;
          membership_date?: string | null;
          membership_status?: string | null;
          membership_type?: string | null;
          next_renewal_date?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          name: string | null;
          subscribed: boolean | null;
          subscription_date: string | null;
          unsubscribe_token: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id?: string;
          name?: string | null;
          subscribed?: boolean | null;
          subscription_date?: string | null;
          unsubscribe_token?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          name?: string | null;
          subscribed?: boolean | null;
          subscription_date?: string | null;
          unsubscribe_token?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      prayer_requests: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          is_answered: boolean | null;
          is_public: boolean | null;
          name: string;
          request: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: string;
          is_answered?: boolean | null;
          is_public?: boolean | null;
          name: string;
          request: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          is_answered?: boolean | null;
          is_public?: boolean | null;
          name?: string;
          request?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          role: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: string;
          role?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          role?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      scheduled_content: {
        Row: {
          content: Json;
          created_at: string | null;
          created_by: string | null;
          id: string;
          published_at: string | null;
          recurring: Json | null;
          scheduled_for: string;
          status: string;
          title: string;
          type: string;
          updated_at: string | null;
        };
        Insert: {
          content: Json;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          published_at?: string | null;
          recurring?: Json | null;
          scheduled_for: string;
          status?: string;
          title: string;
          type: string;
          updated_at?: string | null;
        };
        Update: {
          content?: Json;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          published_at?: string | null;
          recurring?: Json | null;
          scheduled_for?: string;
          status?: string;
          title?: string;
          type?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      sermons: {
        Row: {
          audio_url: string | null;
          created_at: string;
          description: string | null;
          id: string;
          is_featured: boolean | null;
          preacher: string | null;
          scripture_reference: string | null;
          sermon_date: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          audio_url?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_featured?: boolean | null;
          preacher?: string | null;
          scripture_reference?: string | null;
          sermon_date: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          audio_url?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_featured?: boolean | null;
          preacher?: string | null;
          scripture_reference?: string | null;
          sermon_date?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          admin_email: string | null;
          church_address: string | null;
          church_name: string | null;
          created_at: string;
          email: string | null;
          enable_donations: boolean | null;
          enable_email_notifications: boolean | null;
          enable_membership: boolean | null;
          enable_newsletter: boolean | null;
          enable_stripe: boolean | null;
          from_email: string | null;
          id: number;
          maintenance_mode: boolean | null;
          phone_number: string | null;
          stripe_publishable_key: string | null;
          updated_at: string;
        };
        Insert: {
          admin_email?: string | null;
          church_address?: string | null;
          church_name?: string | null;
          created_at?: string;
          email?: string | null;
          enable_donations?: boolean | null;
          enable_email_notifications?: boolean | null;
          enable_membership?: boolean | null;
          enable_newsletter?: boolean | null;
          enable_stripe?: boolean | null;
          from_email?: string | null;
          id?: number;
          maintenance_mode?: boolean | null;
          phone_number?: string | null;
          stripe_publishable_key?: string | null;
          updated_at?: string;
        };
        Update: {
          admin_email?: string | null;
          church_address?: string | null;
          church_name?: string | null;
          created_at?: string;
          email?: string | null;
          enable_donations?: boolean | null;
          enable_email_notifications?: boolean | null;
          enable_membership?: boolean | null;
          enable_newsletter?: boolean | null;
          enable_stripe?: boolean | null;
          from_email?: string | null;
          id?: number;
          maintenance_mode?: boolean | null;
          phone_number?: string | null;
          stripe_publishable_key?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      stripe_settings: {
        Row: {
          created_at: string | null;
          default_currency: string | null;
          enable_stripe: boolean | null;
          id: number;
          stripe_mode: string | null;
          stripe_publishable_key: string | null;
          stripe_secret_key: string | null;
          stripe_webhook_secret: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          default_currency?: string | null;
          enable_stripe?: boolean | null;
          id?: number;
          stripe_mode?: string | null;
          stripe_publishable_key?: string | null;
          stripe_secret_key?: string | null;
          stripe_webhook_secret?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          default_currency?: string | null;
          enable_stripe?: boolean | null;
          id?: number;
          stripe_mode?: string | null;
          stripe_publishable_key?: string | null;
          stripe_secret_key?: string | null;
          stripe_webhook_secret?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          is_approved: boolean | null;
          name: string;
          updated_at: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          is_approved?: boolean | null;
          name: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          is_approved?: boolean | null;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
