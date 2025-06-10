
export interface Member {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  membership_date: string | null;
  membership_status: string | null;
  membership_type: string | null;
  join_date: string | null;
  last_renewal_date: string | null;
  next_renewal_date: string | null;
  created_at: string;
  updated_at: string;
}

export type MembershipType = "regular" | "student" | "senior" | "family";
export type MembershipStatus = "active" | "inactive" | "pending";
