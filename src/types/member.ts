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

  // Personal Information
  registration_date: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  baptismal_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  occupation: string | null;

  // Address Information
  street_address: string | null;
  apt_suite_bldg: string | null;
  city: string | null;
  state_province_region: string | null;
  postal_zip_code: string | null;
  country: string | null;

  // Family Information
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
  children: Array<{ name: string; age: string }> | null;
  family_size: number | null;

  // Contact & Communication
  contact_method: string | null;
  preferred_language: string | null;
  email_updates: boolean | null;
  sms_updates: boolean | null;
  newsletter_consent: boolean | null;
  social_media_consent: boolean | null;
  photo_consent: boolean | null;

  // Emergency Contact
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  emergency_medical_info: string | null;

  // Religious Information
  baptized: boolean | null;
  baptism_date: string | null;
  baptism_location: string | null;
  confirmation_status: boolean | null;
  confirmation_date: string | null;
  godparents: string | null;
  spiritual_father: string | null;
  previous_member: boolean | null;
  previous_church: string | null;

  // Interests & Skills
  ministry_interests: string[] | null;
  volunteer_interests: string[] | null;
  church_activities_interest: string[] | null;
  skills: string | null;
  volunteer_availability: string | null;
  leadership_experience: string | null;

  // Church Involvement
  church_school_interest: boolean | null;
  youth_group_interest: boolean | null;
  choir_interest: boolean | null;
  bible_study_interest: boolean | null;
  prayer_group_interest: boolean | null;
  community_service_interest: boolean | null;

  // Membership Management
  membership_fee_paid: boolean | null;
  payment_reference: string | null;
  membership_card_issued: boolean | null;
  membership_card_number: string | null;
  membership_level: string | null;
  voting_rights: boolean | null;
  committee_eligibility: boolean | null;
  leadership_eligibility: boolean | null;

  // Integration & Follow-up
  integration_status: string | null;
  orientation_completed: boolean | null;
  orientation_date: string | null;
  mentor_assigned: string | null;
  last_contact_date: string | null;
  follow_up_required: boolean | null;

  // Additional Information
  how_did_you_hear: string | null;
  referral_source: string | null;
  additional_notes: string | null;
  registration_notes: string | null;
  dietary_restrictions: string | null;
  medical_conditions: string | null;
  special_needs: string | null;
  transportation_needed: boolean | null;

  // Demographics
  household_income_range: string | null;
  education_level: string | null;
  languages_spoken: string[] | null;

  // Membership Sponsor
  membership_sponsor: string | null;
  membership_sponsor_phone: string | null;

  // Legal & Compliance
  data_processing_consent: boolean | null;
  terms_accepted_at: string | null;
  privacy_policy_accepted_at: string | null;
  membership_agreement_signed: boolean | null;
  background_check_required: boolean | null;
  background_check_completed: boolean | null;
  background_check_date: string | null;

  // Technical
  registration_ip_address: string | null;
  registration_user_agent: string | null;
  insurance_info: string | null;
}

export type MembershipType = "regular" | "student" | "senior" | "family";
export type MembershipStatus = "active" | "inactive" | "pending";
export type IntegrationStatus =
  | "new"
  | "in_progress"
  | "integrated"
  | "inactive";
export type MembershipLevel = "regular" | "associate" | "honorary" | "life";
export type ContactMethod = "email" | "phone" | "both";

export interface MembershipStatistics {
  total_members: number;
  active_members: number;
  pending_members: number;
  inactive_members: number;
  regular_members: number;
  student_members: number;
  senior_members: number;
  family_members: number;
  paid_members: number;
  members_needing_followup: number;
  new_members_this_month: number;
  new_members_this_week: number;
}

export interface ActiveMember {
  id: string;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  membership_type: string | null;
  membership_status: string | null;
  registration_date: string | null;
  membership_date: string | null;
  last_renewal_date: string | null;
  next_renewal_date: string | null;
  membership_fee_paid: boolean | null;
  integration_status: string | null;
  preferred_language: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  created_at: string;
  updated_at: string;
}
