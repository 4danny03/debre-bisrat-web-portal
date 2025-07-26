export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          admin_notes: string | null
          admin_response: string | null
          confirmed_date: string | null
          confirmed_time: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          requested_date: string
          requested_time: string
          responded_at: string | null
          responded_by: string | null
          service_title: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          admin_response?: string | null
          confirmed_date?: string | null
          confirmed_time?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          requested_date: string
          requested_time: string
          responded_at?: string | null
          responded_by?: string | null
          service_title: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          admin_response?: string | null
          confirmed_date?: string | null
          confirmed_time?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          requested_date?: string
          requested_time?: string
          responded_at?: string | null
          responded_by?: string | null
          service_title?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string | null
          donor_email: string | null
          donor_name: string | null
          donor_phone: string | null
          id: string
          is_membership_fee: boolean | null
          member_id: string | null
          notes: string | null
          payment_method: string | null
          purpose: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          donor_email?: string | null
          donor_name?: string | null
          donor_phone?: string | null
          id?: string
          is_membership_fee?: boolean | null
          member_id?: string | null
          notes?: string | null
          payment_method?: string | null
          purpose?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          donor_email?: string | null
          donor_name?: string | null
          donor_phone?: string | null
          id?: string
          is_membership_fee?: boolean | null
          member_id?: string | null
          notes?: string | null
          payment_method?: string | null
          purpose?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          click_rate: number | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          open_rate: number | null
          recipient_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          subject: string
          title: string
          updated_at: string | null
        }
        Insert: {
          click_rate?: number | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          open_rate?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          title: string
          updated_at?: string | null
        }
        Update: {
          click_rate?: number | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          open_rate?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          created_at: string | null
          email: string
          event_id: string | null
          id: string
          member_id: string | null
          name: string
          notes: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          event_id?: string | null
          id?: string
          member_id?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          event_id?: string | null
          id?: string
          member_id?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          event_date: string
          event_time: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          location: string | null
          max_attendees: number | null
          registration_deadline: string | null
          registration_required: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_date: string
          event_time?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          location?: string | null
          max_attendees?: number | null
          registration_deadline?: string | null
          registration_required?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_date?: string
          event_time?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          location?: string | null
          max_attendees?: number | null
          registration_deadline?: string | null
          registration_required?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gallery: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          event_id: string | null
          id: string
          image_url: string
          is_featured: boolean | null
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          image_url: string
          is_featured?: boolean | null
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          image_url?: string
          is_featured?: boolean | null
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          email_updates: boolean | null
          first_name: string | null
          full_name: string
          gender: string | null
          id: string
          join_date: string | null
          last_name: string | null
          last_renewal_date: string | null
          membership_date: string | null
          membership_fee_paid: boolean | null
          membership_status: string | null
          membership_type: string | null
          ministry_interests: string | null
          newsletter_consent: boolean | null
          next_renewal_date: string | null
          payment_status: string | null
          phone: string | null
          postal_zip_code: string | null
          preferred_language: string | null
          registration_date: string | null
          state_province_region: string | null
          street_address: string | null
          stripe_customer_id: string | null
          terms_accepted: boolean | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          email_updates?: boolean | null
          first_name?: string | null
          full_name: string
          gender?: string | null
          id?: string
          join_date?: string | null
          last_name?: string | null
          last_renewal_date?: string | null
          membership_date?: string | null
          membership_fee_paid?: boolean | null
          membership_status?: string | null
          membership_type?: string | null
          ministry_interests?: string | null
          newsletter_consent?: boolean | null
          next_renewal_date?: string | null
          payment_status?: string | null
          phone?: string | null
          postal_zip_code?: string | null
          preferred_language?: string | null
          registration_date?: string | null
          state_province_region?: string | null
          street_address?: string | null
          stripe_customer_id?: string | null
          terms_accepted?: boolean | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          email_updates?: boolean | null
          first_name?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          join_date?: string | null
          last_name?: string | null
          last_renewal_date?: string | null
          membership_date?: string | null
          membership_fee_paid?: boolean | null
          membership_status?: string | null
          membership_type?: string | null
          ministry_interests?: string | null
          newsletter_consent?: boolean | null
          next_renewal_date?: string | null
          payment_status?: string | null
          phone?: string | null
          postal_zip_code?: string | null
          preferred_language?: string | null
          registration_date?: string | null
          state_province_region?: string | null
          street_address?: string | null
          stripe_customer_id?: string | null
          terms_accepted?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      prayer_requests: {
        Row: {
          admin_notes: string | null
          category: string | null
          created_at: string | null
          email: string | null
          id: string
          is_anonymous: boolean | null
          is_answered: boolean | null
          is_approved: boolean | null
          is_urgent: boolean | null
          name: string
          phone: string | null
          request_text: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          category?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_answered?: boolean | null
          is_approved?: boolean | null
          is_urgent?: boolean | null
          name: string
          phone?: string | null
          request_text: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_answered?: boolean | null
          is_approved?: boolean | null
          is_urgent?: boolean | null
          name?: string
          phone?: string | null
          request_text?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sermons: {
        Row: {
          audio_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          featured: boolean | null
          id: string
          scripture_reference: string | null
          series: string | null
          sermon_date: string
          speaker: string | null
          tags: string[] | null
          title: string
          transcript: string | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          scripture_reference?: string | null
          series?: string | null
          sermon_date: string
          speaker?: string | null
          tags?: string[] | null
          title: string
          transcript?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          scripture_reference?: string | null
          series?: string | null
          sermon_date?: string
          speaker?: string | null
          tags?: string[] | null
          title?: string
          transcript?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          admin_notes: string | null
          category: string | null
          created_at: string | null
          email: string | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          name: string
          testimonial_text: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          category?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          name: string
          testimonial_text: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          name?: string
          testimonial_text?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
