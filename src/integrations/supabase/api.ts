
import { supabase } from "./client";
import { dataSyncService } from "@/services/DataSyncService";
import type { Database, Appointment } from '@/types/supabase';

type TableName = keyof Database['public']['Tables'];
type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];



export const api = {
  // Member API
  members: {
    getMembers: async function () {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    getMemberProfile: async function (userId: string) {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    getMemberDonations: async function (userId: string, limit = 5) {
      const { data, error } = await supabase
        .from('donations')
        .select('amount, payment_method, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
    getMemberEvents: async function (userId: string, limit = 5) {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          status,
          events (
            id,
            title,
            event_date
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
  },
  // Events API
  events: {
    getEvents: async function () {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    getUpcomingEvents: async function (limit = 10) {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', today)
        .order('event_date', { ascending: true })
        .limit(limit);
      if (error) throw error;
      return data;
    },
    createEvent: async function (event: TableInsert<'events'>) {
      const { data, error } = await supabase
        .from('events')
        .insert([event])
        .select()
        .single();
      if (error) throw error;
      dataSyncService.notifyAdminAction('create', 'events', data);
      return data;
    },
    updateEvent: async function (id: string, updates: TableUpdate<'events'>) {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      dataSyncService.notifyAdminAction('update', 'events', data);
      return data;
    },
    deleteEvent: async function (id: string) {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      dataSyncService.notifyAdminAction('delete', 'events', { id });
      return true;
    },
  },
  // Members API
  members: {
    getMembers: async function () {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    createMember: async function (member: Database['public']['Tables']['members']['Insert']) {
      const { data, error } = await supabase
        .from('members')
        .insert([member])
        .select()
        .single();
      if (error) throw error;
      dataSyncService.notifyAdminAction('create', 'members', data);
      return data;
    },
    updateMember: async function (id: string, updates: Database['public']['Tables']['members']['Update']) {
      const { data, error } = await supabase
        .from('members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      dataSyncService.notifyAdminAction('update', 'members', data);
      return data;
    },
    deleteMember: async function (id: string) {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) throw error;
      dataSyncService.notifyAdminAction('delete', 'members', { id });
      return true;
    },
  },

  // Sermons API
  sermons: {
    getSermons: async function () {
      const { data, error } = await supabase
        .from("sermons")
        .select("*")
        .order("sermon_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    createSermon: async function (sermon: Record<string, unknown>) {
      const { data, error } = await supabase
        .from("sermons")
        .insert([sermon])
        .select()
        .single();
      if (error) throw error;
      dataSyncService.notifyAdminAction("create", "sermons", data);
      return data;
    },
    updateSermon: async function (id: string, updates: Record<string, unknown>) {
      const { data, error } = await supabase
        .from("sermons")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      dataSyncService.notifyAdminAction("update", "sermons", data);
      return data;
    },
    deleteSermon: async function (id: string) {
      const { error } = await supabase.from("sermons").delete().eq("id", id);
      if (error) throw error;
      dataSyncService.notifyAdminAction("delete", "sermons", { id });
      return true;
    },
  },

  // Testimonials API
  testimonials: {
    getTestimonials: async function (approvedOnly: boolean = false) {
      let query = supabase.from('testimonials').select('*');
      if (approvedOnly) {
        query = query.eq('is_approved', true);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    createTestimonial: async function (testimonial: Database['public']['Tables']['testimonials']['Insert']) {
      const { data, error } = await supabase
        .from('testimonials')
        .insert([testimonial])
        .select()
        .single();
      if (error) throw error;
      dataSyncService.notifyAdminAction('create', 'testimonials', data);
      return data;
    },
    updateTestimonial: async function (id: string, updates: Database['public']['Tables']['testimonials']['Update']) {
      const { data, error } = await supabase
        .from('testimonials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      dataSyncService.notifyAdminAction('update', 'testimonials', data);
      return data;
    },
    deleteTestimonial: async function (id: string) {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);
      if (error) throw error;
      dataSyncService.notifyAdminAction('delete', 'testimonials', { id });
      return true;
    },
  },

  // Prayer Requests API
  prayerRequests: {
    getPrayerRequests: async function (approvedOnly: boolean = false) {
      let query = supabase.from('prayer_requests').select('*');
      if (approvedOnly) {
        query = query.eq('is_approved', true);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    createPrayerRequest: async function (request: Database['public']['Tables']['prayer_requests']['Insert']) {
      const { data, error } = await supabase
        .from('prayer_requests')
        .insert([request])
        .select()
        .single();
      if (error) throw error;
      dataSyncService.notifyAdminAction('create', 'prayer_requests', data);
      return data;
    },
    updatePrayerRequest: async function (id: string, updates: Database['public']['Tables']['prayer_requests']['Update']) {
      const { data, error } = await supabase
        .from('prayer_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      dataSyncService.notifyAdminAction('update', 'prayer_requests', data);
      return data;
    },
    deletePrayerRequest: async function (id: string) {
      const { error } = await supabase
        .from('prayer_requests')
        .delete()
        .eq('id', id);
      if (error) throw error;
      dataSyncService.notifyAdminAction('delete', 'prayer_requests', { id });
      return true;
    },
  },

  // Donations API
  donations: {
    getDonations: async function () {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    createDonation: async function (donation: Database['public']['Tables']['donations']['Insert']) {
      const { data, error } = await supabase
        .from('donations')
        .insert([donation])
        .select()
        .single();
      if (error) throw error;
      dataSyncService.notifyAdminAction('create', 'donations', data);
      return data;
    },
    updateDonation: async function (id: string, updates: Database['public']['Tables']['donations']['Update']) {
      const { data, error } = await supabase
        .from('donations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      dataSyncService.notifyAdminAction('update', 'donations', data);
      return data;
    },
  },

  // Gallery API
  gallery: {
    getGalleryImages: async function () {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    createGalleryImage: async function (image: Database['public']['Tables']['gallery']['Insert']) {
      const { data, error } = await supabase
        .from('gallery')
        .insert([image])
        .select()
        .single();
      if (error) throw error;
      dataSyncService.notifyAdminAction('create', 'gallery', data);
      return data;
    },
    deleteGalleryImage: async function (id: string) {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;
      dataSyncService.notifyAdminAction('delete', 'gallery', { id });
      return true;
    },
  },

  // Users API
  users: {
    getUsers: async function () {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    createUser: async function (user: Database['public']['Tables']['profiles']['Insert']) {
      const { data, error } = await supabase
        .from('profiles')
        .insert([user])
        .select()
        .single();
      if (error) throw error;
      dataSyncService.notifyAdminAction('create', 'profiles', data);
      return data;
    },
    updateUser: async function (id: string, updates: Database['public']['Tables']['profiles']['Update']) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      dataSyncService.notifyAdminAction('update', 'profiles', data);
      return data;
    },
    deleteUser: async function (id: string) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      dataSyncService.notifyAdminAction('delete', 'profiles', { id });
      return true;
    },
  },

  // Appointments API
  appointments: {
    getAppointments: async function () {
      const { data, error } = await supabase
        .from('appointments')
        .select(`*, responded_by_profile:profiles!appointments_responded_by_fkey(email)`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    getAppointmentById: async function (id: string) {
      const { data, error } = await supabase
        .from('appointments')
        .select(`*, responded_by_profile:profiles!appointments_responded_by_fkey(email)`)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    createAppointment: async function (appointment: Database['public']['Tables']['appointments']['Insert']) {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointment])
        .select()
        .single();
      if (error) throw error;
      return data as Appointment;
    },
    updateAppointment: async function (id: string, updates: Database['public']['Tables']['appointments']['Update']) {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      dataSyncService.notifyAdminAction('update', 'appointments', data);
      return data as Appointment;
    },
    respondToAppointment: async function (
      id: string,
      response: {
        status: string;
        admin_response: string;
        admin_notes?: string;
        confirmed_date?: string;
        confirmed_time?: string;
        responded_by: string;
      },
    ) {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          ...response,
          responded_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      dataSyncService.notifyAdminAction('respond_appointment', 'appointments', data);
      return data;
    },
    deleteAppointment: async function (id: string) {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      if (error) throw error;
      dataSyncService.notifyAdminAction('delete', 'appointments', { id });
      return true;
    },
    getAppointmentsByStatus: async function (status: string) {
      const { data, error } = await supabase
        .from('appointments')
        .select(`*, responded_by_profile:profiles!appointments_responded_by_fkey(email)`)
        .eq('status', status)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  },

  // Site Settings API
  siteSettings: {
    getSettings: async function () {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    updateSettings: async function (settings: Database['public']['Tables']['site_settings']['Update']) {
      const { data, error } = await supabase
        .from('site_settings')
        .upsert({ id: 1, ...settings, updated_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      dataSyncService.notifyAdminAction('update', 'site_settings', data);
      return data;
    },
  },

  // Stripe Settings API
  stripeSettings: {
    getSettings: async () => {
      const { data, error } = await supabase
        .from("stripe_settings")
        .select("*")
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    updateSettings: async (settings: any) => {
      const { data, error } = await supabase
        .from("stripe_settings")
        .upsert({ id: 1, ...settings, updated_at: new Date().toISOString() })
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("update", "stripe_settings", data);
      return data;
    },
  },

  // Email Settings API
  emailSettings: {
    getSettings: async () => {
      const { data, error } = await supabase
        .from("email_settings")
        .select("*")
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    updateSettings: async (settings: any) => {
      const { data, error } = await supabase
        .from("email_settings")
        .upsert({ id: 1, ...settings, updated_at: new Date().toISOString() })
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("update", "email_settings", data);
      return data;
    },
  },

  // Email Subscribers API
  emailSubscribers: {
    getSubscribers: async () => {
      const { data, error } = await supabase
        .from("email_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    getNewsletterSubscribers: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .eq("subscribed", true)
        .order("subscription_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    addSubscriber: async (subscriber: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from("email_subscribers")
        .insert([subscriber])
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("create", "email_subscribers", data);
      return data;
    },
    updateSubscriber: async (id: string, updates: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from("email_subscribers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("update", "email_subscribers", data);
      return data;
    },
    deleteSubscriber: async (id: string) => {
      const { error } = await supabase
        .from("email_subscribers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      dataSyncService.notifyAdminAction("delete", "email_subscribers", { id });
      return true;
    },
    unsubscribe: async (email: string) => {
      const { data, error } = await supabase
        .from("email_subscribers")
        .update({
          status: "unsubscribed",
          unsubscribed_at: new Date().toISOString(),
        })
        .eq("email", email)
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction(
        "unsubscribe",
        "email_subscribers",
        data,
      );
      return data;
    },
  },

  // Email Templates API
  emailTemplates: {
    getTemplates: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    getNewsletterTemplates: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("template_type", "newsletter")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    createTemplate: async (template: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from("email_templates")
        .insert([template])
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("create", "email_templates", data);
      return data;
    },
    updateTemplate: async (id: string, updates: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from("email_templates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("update", "email_templates", data);
      return data;
    },
    deleteTemplate: async (id: string) => {
      const { error } = await supabase
        .from("email_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      dataSyncService.notifyAdminAction("delete", "email_templates", { id });
      return true;
    },
  },

  // Email Campaigns API
  emailCampaigns: {
    getCampaigns: async () => {
      const { data, error } = await supabase
        .from("email_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    createCampaign: async (campaign: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from("email_campaigns")
        .insert([campaign])
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("create", "email_campaigns", data);
      return data;
    },
    updateCampaign: async (id: string, updates: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from("email_campaigns")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("update", "email_campaigns", data);
      return data;
    },
    deleteCampaign: async (id: string) => {
      const { error } = await supabase
        .from("email_campaigns")
        .delete()
        .eq("id", id);

      if (error) throw error;
      dataSyncService.notifyAdminAction("delete", "email_campaigns", { id });
      return true;
    },
  },

  // Analytics API
  analytics: {
    getDashboardStats: async () => {
      try {
        const [
          events,
          members,
          donations,
          testimonials,
          prayerRequests,
          sermons,
        ] = await Promise.all([
          supabase.from("events").select("*", { count: "exact", head: true }),
          supabase.from("members").select("*", { count: "exact", head: true }),
          supabase.from("donations").select("amount, created_at"),
          supabase
            .from("testimonials")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("prayer_requests")
            .select("*", { count: "exact", head: true }),
          supabase.from("sermons").select("*", { count: "exact", head: true }),
        ]);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentDonations = Array.isArray(donations.data)
          ? donations.data.filter(
              (d) => d?.created_at && new Date(d.created_at) >= thirtyDaysAgo,
            )
          : [];

        const recentDonationAmount = recentDonations.reduce(
          (sum, d) => sum + (d?.amount || 0),
          0,
        );

        return {
          totalEvents: events.count || 0,
          totalMembers: members.count || 0,
          totalDonations: Array.isArray(donations.data)
            ? donations.data.length
            : 0,
          totalTestimonials: testimonials.count || 0,
          totalPrayerRequests: prayerRequests.count || 0,
          totalSermons: sermons.count || 0,
          recentDonationAmount,
        };
      } catch (error) {
        console.error("Error getting dashboard stats:", error);
        throw error;
      }
    },
    getRecentActivity: async (limit = 6) => {
      try {
        const activities: Array<{
          id: string;
          type: string;
          title: string;
          description: string;
          created_at: string;
        }> = [];

        // Get recent events
        const { data: events } = await supabase
          .from("events")
          .select("id, title, description, created_at")
          .order("created_at", { ascending: false })
          .limit(3);

        if (Array.isArray(events)) {
          events.forEach((event) => {
            if (event?.id && event?.title && event?.created_at) {
              activities.push({
                id: event.id,
                type: "event",
                title: `New Event: ${event.title}`,
                description: event.description || "No description",
                created_at: event.created_at,
              });
            }
          });
        }

        // Get recent members
        const { data: members } = await supabase
          .from("members")
          .select("id, full_name, created_at")
          .order("created_at", { ascending: false })
          .limit(3);

        if (Array.isArray(members)) {
          members.forEach((member) => {
            if (member?.id && member?.full_name && member?.created_at) {
              activities.push({
                id: member.id,
                type: "member",
                title: `New Member: ${member.full_name}`,
                description: "Joined the church community",
                created_at: member.created_at,
              });
            }
          });
        }

        // Sort by creation date and take the most recent
        activities.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        return activities.slice(0, limit);
      } catch (error) {
        console.error("Error getting recent activity:", error);
        return [];
      }
    },
  },
};
