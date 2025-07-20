type AppointmentRow = {
  id: string;
  created_at?: string;
  updated_at?: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  appointment_date: string;
  notes?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
};

type MemberRow = {
  id: string;
  created_at?: string;
  updated_at?: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  membership_type: "regular" | "student" | "senior" | "family";
  membership_status: "pending" | "active" | "inactive";
  membership_date?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
};

type AdminUserRow = {
  id: string;
  created_at?: string;
  user_id: string;
  role: "admin" | "super_admin";
};

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: AppointmentRow;
        Insert: Omit<
          Partial<AppointmentRow>,
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<AppointmentRow>;
      };
      members: {
        Row: MemberRow;
        Insert: Omit<Partial<MemberRow>, "id" | "created_at" | "updated_at">;
        Update: Partial<MemberRow>;
      };
      admin_users: {
        Row: AdminUserRow;
        Insert: Omit<AdminUserRow, "id" | "created_at">;
        Update: Partial<AdminUserRow>;
      };
    };
    Views: {
      // Add views here if you have any
    };
    Functions: {
      // Add functions here if you have any
    };
    Enums: {
      // Add enums here if you have any
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

// Helper type to infer the return type of a promise
export type PromiseReturnType<T> = T extends Promise<infer R> ? R : T;
