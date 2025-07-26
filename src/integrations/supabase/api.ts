// API integration layer for Supabase
import { supabase } from "./client";

// Members API
export const api = {
  members: {
    async getMembers() {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },

    async getMember(id: string) {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },

    async getMemberProfile(userId: string) {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    },

    async getMemberDonations(userId: string) {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("member_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },

    async getMemberEvents(userId: string) {
      const { data, error } = await supabase
        .from("event_registrations")
        .select(
          `
          *,
          events (
            id,
            title,
            event_date
          )
        `,
        )
        .eq("member_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },

    async createMember(member: any) {
      // Use the membership-management edge function for better handling
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-membership-management",
        {
          body: {
            action: "create_member",
            member_data: member,
          },
        },
      );

      if (error) throw error;
      return data.member;
    },

    async updateMember(id: string, updates: any) {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-membership-management",
        {
          body: {
            action: "update_member",
            member_id: id,
            update_data: updates,
          },
        },
      );

      if (error) throw error;
      return data.member;
    },

    async activateMembership(id: string) {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-membership-management",
        {
          body: {
            action: "activate_membership",
            member_id: id,
          },
        },
      );

      if (error) throw error;
      return data.member;
    },

    async deleteMember(id: string) {
      const { error } = await supabase.from("members").delete().eq("id", id);

      if (error) throw error;
    },
  },

  // Appointments API
  appointments: {
    async getAppointments() {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          *,
          responded_by_profile:profiles!appointments_responded_by_fkey(
            email
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },

    async getAppointmentsByStatus(status: string) {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          *,
          responded_by_profile:profiles!appointments_responded_by_fkey(
            email
          )
        `,
        )
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },

    async createAppointment(appointment: any) {
      // Use the appointment-request edge function for public submissions
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-appointment-request",
        {
          body: appointment,
        },
      );

      if (error) throw error;
      return data.appointment;
    },

    async respondToAppointment(id: string, response: any) {
      const { data, error } = await supabase
        .from("appointments")
        .update({
          ...response,
          responded_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(
          `
          *,
          responded_by_profile:profiles!appointments_responded_by_fkey(
            email
          )
        `,
        )
        .single();

      if (error) throw error;
      return data;
    },
  },

  // Donations API
  donations: {
    async getDonations() {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },

    async createDonation(donation: any) {
      const { data, error } = await supabase
        .from("donations")
        .insert(donation)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async getDonationStats() {
      const { data, error } = await supabase
        .from("donations")
        .select("amount, created_at, status")
        .eq("status", "completed");

      if (error) throw error;

      const total = data?.reduce((sum, d) => sum + d.amount, 0) || 0;
      const count = data?.length || 0;
      const average = count > 0 ? total / count : 0;

      // Calculate monthly growth
      const currentMonth = new Date().getMonth();
      const monthlyDonations =
        data?.filter(
          (d) => new Date(d.created_at).getMonth() === currentMonth,
        ) || [];

      return {
        total_amount: total,
        total_donations: count,
        average_donation: average,
        monthly_growth: monthlyDonations.length,
      };
    },
  },

  // Events API
  events: {
    async getEvents() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) throw error;
      return data;
    },

    async getUpcomingEvents() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("event_date", new Date().toISOString().split("T")[0])
        .order("event_date", { ascending: true })
        .limit(10);

      if (error) throw error;
      return data;
    },

    async createEvent(event: any) {
      const { data, error } = await supabase
        .from("events")
        .insert(event)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async updateEvent(id: string, updates: any) {
      const { data, error } = await supabase
        .from("events")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async deleteEvent(id: string) {
      const { error } = await supabase.from("events").delete().eq("id", id);

      if (error) throw error;
    },
  },

  // Prayer Requests API
  prayerRequests: {
    async getPrayerRequests() {
      const { data, error } = await supabase
        .from("prayer_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },

    async createPrayerRequest(request: any) {
      const { data, error } = await supabase
        .from("prayer_requests")
        .insert(request)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async updatePrayerRequest(id: string, updates: any) {
      const { data, error } = await supabase
        .from("prayer_requests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  },

  // Testimonials API
  testimonials: {
    async getTestimonials() {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },

    async getApprovedTestimonials() {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },

    async createTestimonial(testimonial: any) {
      const { data, error } = await supabase
        .from("testimonials")
        .insert(testimonial)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async updateTestimonial(id: string, updates: any) {
      const { data, error } = await supabase
        .from("testimonials")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  },

  // Admin API
  admin: {
    async getDashboardStats() {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-admin-dashboard",
        {
          body: { action: "dashboard" },
        },
      );

      if (error) throw error;
      return data.dashboard;
    },

    async getRecentActivity() {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-admin-dashboard",
        {
          body: { action: "recent_activity" },
        },
      );

      if (error) throw error;
      return data.activity;
    },

    async getSystemHealth() {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-admin-dashboard",
        {
          body: { action: "system_health" },
        },
      );

      if (error) throw error;
      return data.health;
    },
  },
};
