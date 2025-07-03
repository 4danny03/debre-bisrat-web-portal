import { supabase } from "./client";
import { dataSyncService } from "@/services/DataSyncService";

export const api = {
  // Events API
  events: {
    getEvents: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    createEvent: async (event: any) => {
      const { data, error } = await supabase
        .from("events")
        .insert([event])
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("create", "events", data);
      return data;
    },
    updateEvent: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from("events")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("update", "events", data);
      return data;
    },
    deleteEvent: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      dataSyncService.notifyAdminAction("delete", "events", { id });
      return true;
    },
  },

  // Members API
  members: {
    getMembers: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    createMember: async (member: any) => {
      const { data, error } = await supabase
        .from("members")
        .insert([member])
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("create", "members", data);
      return data;
    },
    updateMember: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from("members")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("update", "members", data);
      return data;
    },
    deleteMember: async (id: string) => {
      const { error } = await supabase.from("members").delete().eq("id", id);
      if (error) throw error;
      dataSyncService.notifyAdminAction("delete", "members", { id });
      return true;
    },
  },

  // Sermons API
  sermons: {
    getSermons: async () => {
      const { data, error } = await supabase
        .from("sermons")
        .select("*")
        .order("sermon_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    createSermon: async (sermon: any) => {
      const { data, error } = await supabase
        .from("sermons")
        .insert([sermon])
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("create", "sermons", data);
      return data;
    },
    updateSermon: async (id: string, updates: any) => {
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
    deleteSermon: async (id: string) => {
      const { error } = await supabase.from("sermons").delete().eq("id", id);
      if (error) throw error;
      dataSyncService.notifyAdminAction("delete", "sermons", { id });
      return true;
    },
  },

  // Testimonials API
  testimonials: {
    getTestimonials: async (approvedOnly = false) => {
      let query = supabase.from("testimonials").select("*");

      if (approvedOnly) {
        query = query.eq("is_approved", true);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });
      if (error) throw error;
      return data;
    },
    createTestimonial: async (testimonial: any) => {
      const { data, error } = await supabase
        .from("testimonials")
        .insert([testimonial])
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("create", "testimonials", data);
      return data;
    },
    updateTestimonial: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from("testimonials")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("update", "testimonials", data);
      return data;
    },
    deleteTestimonial: async (id: string) => {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", id);
      if (error) throw error;
      dataSyncService.notifyAdminAction("delete", "testimonials", { id });
      return true;
    },
  },

  // Prayer Requests API
  prayerRequests: {
    getPrayerRequests: async (approvedOnly = false) => {
      let query = supabase.from("prayer_requests").select("*");

      if (approvedOnly) {
        query = query.eq("is_approved", true);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });
      if (error) throw error;
      return data;
    },
    createPrayerRequest: async (request: any) => {
      const { data, error } = await supabase
        .from("prayer_requests")
        .insert([request])
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("create", "prayer_requests", data);
      return data;
    },
    updatePrayerRequest: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from("prayer_requests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("update", "prayer_requests", data);
      return data;
    },
    deletePrayerRequest: async (id: string) => {
      const { error } = await supabase
        .from("prayer_requests")
        .delete()
        .eq("id", id);
      if (error) throw error;
      dataSyncService.notifyAdminAction("delete", "prayer_requests", { id });
      return true;
    },
  },

  // Donations API
  donations: {
    getDonations: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    createDonation: async (donation: any) => {
      const { data, error } = await supabase
        .from("donations")
        .insert([donation])
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("create", "donations", data);
      return data;
    },
    updateDonation: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from("donations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("update", "donations", data);
      return data;
    },
  },

  // Gallery API
  gallery: {
    getGalleryImages: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    createGalleryImage: async (image: any) => {
      const { data, error } = await supabase
        .from("gallery")
        .insert([image])
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("create", "gallery", data);
      return data;
    },
    deleteGalleryImage: async (id: string) => {
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw error;
      dataSyncService.notifyAdminAction("delete", "gallery", { id });
      return true;
    },
  },

  // Users API
  users: {
    getUsers: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    createUser: async (user: any) => {
      const { data, error } = await supabase
        .from("profiles")
        .insert([user])
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("create", "profiles", data);
      return data;
    },
    updateUser: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("update", "profiles", data);
      return data;
    },
    deleteUser: async (id: string) => {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
      dataSyncService.notifyAdminAction("delete", "profiles", { id });
      return true;
    },
  },

  // Appointments API
  appointments: {
    getAppointments: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          *,
          responded_by_profile:profiles!appointments_responded_by_fkey(email)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    getAppointmentById: async (id: string) => {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          *,
          responded_by_profile:profiles!appointments_responded_by_fkey(email)
        `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    createAppointment: async (appointment: any) => {
      const { data, error } = await supabase
        .from("appointments")
        .insert([appointment])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    updateAppointment: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from("appointments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("update", "appointments", data);
      return data;
    },
    respondToAppointment: async (
      id: string,
      response: {
        status: string;
        admin_response: string;
        admin_notes?: string;
        confirmed_date?: string;
        confirmed_time?: string;
        responded_by: string;
      },
    ) => {
      const { data, error } = await supabase
        .from("appointments")
        .update({
          ...response,
          responded_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction(
        "respond_appointment",
        "appointments",
        data,
      );
      return data;
    },
    deleteAppointment: async (id: string) => {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);

      if (error) throw error;
      dataSyncService.notifyAdminAction("delete", "appointments", { id });
      return true;
    },
    getAppointmentsByStatus: async (status: string) => {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          *,
          responded_by_profile:profiles!appointments_responded_by_fkey(email)
        `,
        )
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  },

  // Site Settings API
  siteSettings: {
    getSettings: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    updateSettings: async (settings: any) => {
      const { data, error } = await supabase
        .from("site_settings")
        .upsert({ id: 1, ...settings, updated_at: new Date().toISOString() })
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("update", "site_settings", data);
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
    addSubscriber: async (subscriber: any) => {
      const { data, error } = await supabase
        .from("email_subscribers")
        .insert([subscriber])
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("create", "email_subscribers", data);
      return data;
    },
    updateSubscriber: async (id: string, updates: any) => {
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
    createTemplate: async (template: any) => {
      const { data, error } = await supabase
        .from("email_templates")
        .insert([template])
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("create", "email_templates", data);
      return data;
    },
    updateTemplate: async (id: string, updates: any) => {
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
    createCampaign: async (campaign: any) => {
      const { data, error } = await supabase
        .from("email_campaigns")
        .insert([campaign])
        .select()
        .single();

      if (error) throw error;
      dataSyncService.notifyAdminAction("create", "email_campaigns", data);
      return data;
    },
    updateCampaign: async (id: string, updates: any) => {
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

        const recentDonations =
          donations.data?.filter(
            (d) => d?.created_at && new Date(d.created_at) >= thirtyDaysAgo,
          ) || [];

        const recentDonationAmount = recentDonations.reduce(
          (sum, d) => sum + (d?.amount || 0),
          0,
        );

        return {
          totalEvents: events.count || 0,
          totalMembers: members.count || 0,
          totalDonations: donations.data?.length || 0,
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
        const activities: any[] = [];

        // Get recent events
        const { data: events } = await supabase
          .from("events")
          .select("id, title, description, created_at")
          .order("created_at", { ascending: false })
          .limit(3);

        events?.forEach((event) => {
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

        // Get recent members
        const { data: members } = await supabase
          .from("members")
          .select("id, full_name, created_at")
          .order("created_at", { ascending: false })
          .limit(3);

        members?.forEach((member) => {
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
