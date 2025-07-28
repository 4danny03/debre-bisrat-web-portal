export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          admin_notes: string | null;
          admin_response: string | null;
          confirmed_date: string | null;
          confirmed_time: string | null;
          created_at: string | null;
          email: string;
          id: string;
          name: string;
          notes: string | null;
          phone: string;
          requested_date: string;
          requested_time: string;
          responded_at: string | null;
          responded_by: string | null;
          service_title: string;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          admin_notes?: string | null;
          admin_response?: string | null;
          confirmed_date?: string | null;
          confirmed_time?: string | null;
          created_at?: string | null;
          email: string;
          id?: string;
          name: string;
          notes?: string | null;
          phone: string;
          requested_date: string;
          requested_time: string;
          responded_at?: string | null;
          responded_by?: string | null;
          service_title: string;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          admin_notes?: string | null;
          admin_response?: string | null;
          confirmed_date?: string | null;
          confirmed_time?: string | null;
          created_at?: string | null;
          email?: string;
          id?: string;
          name?: string;
          notes?: string | null;
          phone?: string;
          requested_date?: string;
          requested_time?: string;
          responded_at?: string | null;
          responded_by?: string | null;
          service_title?: string;
          status?: string | null;
          updated_at?: string | null;
        };
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
          amount: number;
          created_at: string;
          donor_email: string | null;
          donor_name: string | null;
          id: string;
          is_anonymous: boolean | null;
          payment_id: string | null;
          payment_method: string | null;
          payment_status: string | null;
          purpose: string | null;
          updated_at: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          donor_email?: string | null;
          donor_name?: string | null;
          id?: string;
          is_anonymous?: boolean | null;
          payment_id?: string | null;
          payment_method?: string | null;
          payment_status?: string | null;
          purpose?: string | null;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          donor_email?: string | null;
          donor_name?: string | null;
          id?: string;
          is_anonymous?: boolean | null;
          payment_id?: string | null;
          payment_method?: string | null;
          payment_status?: string | null;
          purpose?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      email_campaigns: {
        Row: {
          content: string;
          created_at: string | null;
          created_by: string | null;
          id: string;
          name: string;
          recipient_count: number | null;
          scheduled_at: string | null;
          sent_at: string | null;
          sent_count: number | null;
          status: string | null;
          subject: string;
          updated_at: string | null;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          name: string;
          recipient_count?: number | null;
          scheduled_at?: string | null;
          sent_at?: string | null;
          sent_count?: number | null;
          status?: string | null;
          subject: string;
          updated_at?: string | null;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          name?: string;
          recipient_count?: number | null;
          scheduled_at?: string | null;
          sent_at?: string | null;
          sent_count?: number | null;
          status?: string | null;
          subject?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      email_settings: {
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
          registration_date: string | null;
          first_name: string | null;
          middle_name: string | null;
          last_name: string | null;
          baptismal_name: string | null;
          street_address: string | null;
          apt_suite_bldg: string | null;
          city: string | null;
          state_province_region: string | null;
          postal_zip_code: string | null;
          country: string | null;
          date_of_birth: string | null;
          gender: string | null;
          marital_status: string | null;
          spouse_name: string | null;
          spouse_baptismal_name: string | null;
          spouse_phone: string | null;
          spouse_email: string | null;
          child1_first_name: string | null;
          child1_middle_name: string | null;
          child1_last_name: string | null;
          child1_date_of_birth: string | null;
          child2_first_name: string | null;
          child2_middle_name: string | null;
          child2_last_name: string | null;
          child2_date_of_birth: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          emergency_contact_relation: string | null;
          preferred_language: string | null;
          ministry_interests: string[] | null;
          volunteer_interests: string[] | null;
          skills: string | null;
          how_did_you_hear: string | null;
          additional_notes: string | null;
          baptized: boolean | null;
          baptism_date: string | null;
          previous_member: boolean | null;
          previous_church: string | null;
          children: Json | null;
          email_updates: boolean | null;
          sms_updates: boolean | null;
          photo_consent: boolean | null;
          occupation: string | null;
          contact_method: string | null;
          membership_fee_paid: boolean | null;
          payment_reference: string | null;
          registration_notes: string | null;
          church_activities_interest: string[] | null;
          dietary_restrictions: string | null;
          medical_conditions: string | null;
          transportation_needed: boolean | null;
          volunteer_availability: string | null;
          social_media_consent: boolean | null;
          newsletter_consent: boolean | null;
          data_processing_consent: boolean | null;
          membership_card_issued: boolean | null;
          membership_card_number: string | null;
          referral_source: string | null;
          family_size: number | null;
          household_income_range: string | null;
          education_level: string | null;
          languages_spoken: string[] | null;
          baptism_location: string | null;
          confirmation_status: boolean | null;
          confirmation_date: string | null;
          godparents: string | null;
          spiritual_father: string | null;
          church_school_interest: boolean | null;
          youth_group_interest: boolean | null;
          choir_interest: boolean | null;
          bible_study_interest: boolean | null;
          prayer_group_interest: boolean | null;
          community_service_interest: boolean | null;
          leadership_experience: string | null;
          special_needs: string | null;
          emergency_medical_info: string | null;
          insurance_info: string | null;
          membership_sponsor: string | null;
          membership_sponsor_phone: string | null;
          registration_ip_address: string | null;
          registration_user_agent: string | null;
          terms_accepted_at: string | null;
          privacy_policy_accepted_at: string | null;
          membership_agreement_signed: boolean | null;
          background_check_required: boolean | null;
          background_check_completed: boolean | null;
          background_check_date: string | null;
          orientation_completed: boolean | null;
          orientation_date: string | null;
          mentor_assigned: string | null;
          integration_status: string | null;
          last_contact_date: string | null;
          follow_up_required: boolean | null;
          membership_level: string | null;
          voting_rights: boolean | null;
          committee_eligibility: boolean | null;
          leadership_eligibility: boolean | null;
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
          registration_date?: string | null;
          first_name?: string | null;
          middle_name?: string | null;
          last_name?: string | null;
          baptismal_name?: string | null;
          street_address?: string | null;
          apt_suite_bldg?: string | null;
          city?: string | null;
          state_province_region?: string | null;
          postal_zip_code?: string | null;
          country?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          marital_status?: string | null;
          spouse_name?: string | null;
          spouse_baptismal_name?: string | null;
          spouse_phone?: string | null;
          spouse_email?: string | null;
          child1_first_name?: string | null;
          child1_middle_name?: string | null;
          child1_last_name?: string | null;
          child1_date_of_birth?: string | null;
          child2_first_name?: string | null;
          child2_middle_name?: string | null;
          child2_last_name?: string | null;
          child2_date_of_birth?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          emergency_contact_relation?: string | null;
          preferred_language?: string | null;
          ministry_interests?: string[] | null;
          volunteer_interests?: string[] | null;
          skills?: string | null;
          how_did_you_hear?: string | null;
          additional_notes?: string | null;
          baptized?: boolean | null;
          baptism_date?: string | null;
          previous_member?: boolean | null;
          previous_church?: string | null;
          children?: Json | null;
          email_updates?: boolean | null;
          sms_updates?: boolean | null;
          photo_consent?: boolean | null;
          occupation?: string | null;
          contact_method?: string | null;
          membership_fee_paid?: boolean | null;
          payment_reference?: string | null;
          registration_notes?: string | null;
          church_activities_interest?: string[] | null;
          dietary_restrictions?: string | null;
          medical_conditions?: string | null;
          transportation_needed?: boolean | null;
          volunteer_availability?: string | null;
          social_media_consent?: boolean | null;
          newsletter_consent?: boolean | null;
          data_processing_consent?: boolean | null;
          membership_card_issued?: boolean | null;
          membership_card_number?: string | null;
          referral_source?: string | null;
          family_size?: number | null;
          household_income_range?: string | null;
          education_level?: string | null;
          languages_spoken?: string[] | null;
          baptism_location?: string | null;
          confirmation_status?: boolean | null;
          confirmation_date?: string | null;
          godparents?: string | null;
          spiritual_father?: string | null;
          church_school_interest?: boolean | null;
          youth_group_interest?: boolean | null;
          choir_interest?: boolean | null;
          bible_study_interest?: boolean | null;
          prayer_group_interest?: boolean | null;
          community_service_interest?: boolean | null;
          leadership_experience?: string | null;
          special_needs?: string | null;
          emergency_medical_info?: string | null;
          insurance_info?: string | null;
          membership_sponsor?: string | null;
          membership_sponsor_phone?: string | null;
          registration_ip_address?: string | null;
          registration_user_agent?: string | null;
          terms_accepted_at?: string | null;
          privacy_policy_accepted_at?: string | null;
          membership_agreement_signed?: boolean | null;
          background_check_required?: boolean | null;
          background_check_completed?: boolean | null;
          background_check_date?: string | null;
          orientation_completed?: boolean | null;
          orientation_date?: string | null;
          mentor_assigned?: string | null;
          integration_status?: string | null;
          last_contact_date?: string | null;
          follow_up_required?: boolean | null;
          membership_level?: string | null;
          voting_rights?: boolean | null;
          committee_eligibility?: boolean | null;
          leadership_eligibility?: boolean | null;
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
          registration_date?: string | null;
          first_name?: string | null;
          middle_name?: string | null;
          last_name?: string | null;
          baptismal_name?: string | null;
          street_address?: string | null;
          apt_suite_bldg?: string | null;
          city?: string | null;
          state_province_region?: string | null;
          postal_zip_code?: string | null;
          country?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          marital_status?: string | null;
          spouse_name?: string | null;
          spouse_baptismal_name?: string | null;
          spouse_phone?: string | null;
          spouse_email?: string | null;
          child1_first_name?: string | null;
          child1_middle_name?: string | null;
          child1_last_name?: string | null;
          child1_date_of_birth?: string | null;
          child2_first_name?: string | null;
          child2_middle_name?: string | null;
          child2_last_name?: string | null;
          child2_date_of_birth?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          emergency_contact_relation?: string | null;
          preferred_language?: string | null;
          ministry_interests?: string[] | null;
          volunteer_interests?: string[] | null;
          skills?: string | null;
          how_did_you_hear?: string | null;
          additional_notes?: string | null;
          baptized?: boolean | null;
          baptism_date?: string | null;
          previous_member?: boolean | null;
          previous_church?: string | null;
          children?: Json | null;
          email_updates?: boolean | null;
          sms_updates?: boolean | null;
          photo_consent?: boolean | null;
          occupation?: string | null;
          contact_method?: string | null;
          membership_fee_paid?: boolean | null;
          payment_reference?: string | null;
          registration_notes?: string | null;
          church_activities_interest?: string[] | null;
          dietary_restrictions?: string | null;
          medical_conditions?: string | null;
          transportation_needed?: boolean | null;
          volunteer_availability?: string | null;
          social_media_consent?: boolean | null;
          newsletter_consent?: boolean | null;
          data_processing_consent?: boolean | null;
          membership_card_issued?: boolean | null;
          membership_card_number?: string | null;
          referral_source?: string | null;
          family_size?: number | null;
          household_income_range?: string | null;
          education_level?: string | null;
          languages_spoken?: string[] | null;
          baptism_location?: string | null;
          confirmation_status?: boolean | null;
          confirmation_date?: string | null;
          godparents?: string | null;
          spiritual_father?: string | null;
          church_school_interest?: boolean | null;
          youth_group_interest?: boolean | null;
          choir_interest?: boolean | null;
          bible_study_interest?: boolean | null;
          prayer_group_interest?: boolean | null;
          community_service_interest?: boolean | null;
          leadership_experience?: string | null;
          special_needs?: string | null;
          emergency_medical_info?: string | null;
          insurance_info?: string | null;
          membership_sponsor?: string | null;
          membership_sponsor_phone?: string | null;
          registration_ip_address?: string | null;
          registration_user_agent?: string | null;
          terms_accepted_at?: string | null;
          privacy_policy_accepted_at?: string | null;
          membership_agreement_signed?: boolean | null;
          background_check_required?: boolean | null;
          background_check_completed?: boolean | null;
          background_check_date?: string | null;
          orientation_completed?: boolean | null;
          orientation_date?: string | null;
          mentor_assigned?: string | null;
          integration_status?: string | null;
          last_contact_date?: string | null;
          follow_up_required?: boolean | null;
          membership_level?: string | null;
          voting_rights?: boolean | null;
          committee_eligibility?: boolean | null;
          leadership_eligibility?: boolean | null;
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
