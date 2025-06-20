import { corsHeaders } from "@shared/cors.ts";
import {
  handleCorsOptions,
  formatErrorResponse,
  formatSuccessResponse,
} from "@shared/utils.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

Deno.serve(async (req) => {
  const corsResponse = handleCorsOptions(req);
  if (corsResponse) return corsResponse;

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_KEY") ?? "",
    );

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "dashboard";

    // Verify admin authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization required");
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Verify admin role
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      throw new Error("Admin access required");
    }

    switch (action) {
      case "dashboard":
        // Enhanced dashboard with comprehensive statistics
        const [
          membersRes,
          donationsRes,
          eventsRes,
          sermonsRes,
          prayerRequestsRes,
          testimonialsRes,
          galleryRes,
          subscribersRes,
        ] = await Promise.all([
          supabaseClient.from("members").select("*"),
          supabaseClient.from("donations").select("*"),
          supabaseClient.from("events").select("*"),
          supabaseClient.from("sermons").select("*"),
          supabaseClient.from("prayer_requests").select("*"),
          supabaseClient.from("testimonials").select("*"),
          supabaseClient.from("gallery").select("*"),
          supabaseClient.from("email_subscribers").select("*"),
        ]);

        const now = new Date();
        const thirtyDaysAgo = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000,
        );
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Calculate comprehensive statistics
        const members = membersRes.data || [];
        const donations = donationsRes.data || [];
        const events = eventsRes.data || [];
        const sermons = sermonsRes.data || [];
        const prayerRequests = prayerRequestsRes.data || [];
        const testimonials = testimonialsRes.data || [];
        const gallery = galleryRes.data || [];
        const subscribers = subscribersRes.data || [];

        const recentDonations = donations.filter(
          (d) => new Date(d.created_at) >= thirtyDaysAgo,
        );
        const totalDonationAmount = recentDonations.reduce(
          (sum, d) => sum + (d.amount || 0),
          0,
        );

        const upcomingEvents = events.filter(
          (e) => new Date(e.event_date) > now,
        );

        const recentMembers = members.filter(
          (m) => new Date(m.created_at) >= sevenDaysAgo,
        );

        const pendingTestimonials = testimonials.filter((t) => !t.is_approved);

        const unansweredPrayerRequests = prayerRequests.filter(
          (p) => !p.is_answered,
        );

        const activeSubscribers = subscribers.filter(
          (s) => s.status === "active",
        );

        const dashboardData = {
          overview: {
            totalMembers: members.length,
            newMembersThisWeek: recentMembers.length,
            totalDonations: totalDonationAmount,
            donationCount: recentDonations.length,
            upcomingEvents: upcomingEvents.length,
            totalEvents: events.length,
            totalSermons: sermons.length,
            pendingTestimonials: pendingTestimonials.length,
            unansweredPrayerRequests: unansweredPrayerRequests.length,
            galleryImages: gallery.length,
            activeSubscribers: activeSubscribers.length,
          },
          recentActivity: {
            newMembers: recentMembers.slice(0, 5).map((m) => ({
              id: m.id,
              name: m.full_name,
              date: m.created_at,
              type: "member",
            })),
            recentDonations: recentDonations.slice(0, 5).map((d) => ({
              id: d.id,
              amount: d.amount,
              donor: d.donor_name || "Anonymous",
              date: d.created_at,
              type: "donation",
            })),
            upcomingEvents: upcomingEvents.slice(0, 5).map((e) => ({
              id: e.id,
              title: e.title,
              date: e.event_date,
              type: "event",
            })),
          },
          trends: {
            memberGrowth: this.calculateGrowthTrend(members, "created_at"),
            donationTrend: this.calculateGrowthTrend(donations, "created_at"),
            eventActivity: this.calculateGrowthTrend(events, "created_at"),
          },
        };

        return formatSuccessResponse({ dashboard: dashboardData });

      case "system_health":
        // Enhanced system health check
        const healthChecks = [];

        // Database health
        try {
          const start = Date.now();
          await supabaseClient
            .from("profiles")
            .select("count", { count: "exact", head: true });
          const responseTime = Date.now() - start;

          healthChecks.push({
            component: "Database",
            status: "healthy",
            message: "Database connection successful",
            responseTime,
            details: { responseTime: `${responseTime}ms` },
          });
        } catch (error) {
          healthChecks.push({
            component: "Database",
            status: "error",
            message: "Database connection failed",
            error: error.message,
          });
        }

        // Storage health
        try {
          const start = Date.now();
          const { data } = await supabaseClient.storage
            .from("images")
            .list("", { limit: 1 });
          const responseTime = Date.now() - start;

          healthChecks.push({
            component: "Storage",
            status: "healthy",
            message: "Storage accessible",
            responseTime,
            details: { files: data?.length || 0 },
          });
        } catch (error) {
          healthChecks.push({
            component: "Storage",
            status: "error",
            message: "Storage access failed",
            error: error.message,
          });
        }

        // Table integrity checks
        const tables = [
          "members",
          "events",
          "donations",
          "sermons",
          "testimonials",
          "prayer_requests",
          "gallery",
        ];

        for (const table of tables) {
          try {
            const { count, error } = await supabaseClient
              .from(table)
              .select("*", { count: "exact", head: true });

            if (error) throw error;

            healthChecks.push({
              component: `Table: ${table}`,
              status: "healthy",
              message: `${count || 0} records`,
              details: { recordCount: count || 0 },
            });
          } catch (error) {
            healthChecks.push({
              component: `Table: ${table}`,
              status: "error",
              message: "Table access failed",
              error: error.message,
            });
          }
        }

        return formatSuccessResponse({ health: healthChecks });

      case "analytics":
        // Enhanced analytics data
        const timeRange = url.searchParams.get("timeRange") || "30";
        const days = parseInt(timeRange);
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        const [analyticsMembers, analyticsDonations, analyticsEvents] =
          await Promise.all([
            supabaseClient
              .from("members")
              .select("*")
              .gte("created_at", startDate.toISOString()),
            supabaseClient
              .from("donations")
              .select("*")
              .gte("created_at", startDate.toISOString()),
            supabaseClient
              .from("events")
              .select("*")
              .gte("created_at", startDate.toISOString()),
          ]);

        const analyticsData = {
          timeRange: `${days} days`,
          members: {
            total: analyticsMembers.data?.length || 0,
            byType: this.groupByField(
              analyticsMembers.data || [],
              "membership_type",
            ),
            byStatus: this.groupByField(
              analyticsMembers.data || [],
              "membership_status",
            ),
            timeline: this.createTimeline(
              analyticsMembers.data || [],
              "created_at",
              days,
            ),
          },
          donations: {
            total:
              analyticsDonations.data?.reduce(
                (sum, d) => sum + (d.amount || 0),
                0,
              ) || 0,
            count: analyticsDonations.data?.length || 0,
            byPurpose: this.groupByField(
              analyticsDonations.data || [],
              "purpose",
            ),
            timeline: this.createTimeline(
              analyticsDonations.data || [],
              "created_at",
              days,
            ),
          },
          events: {
            total: analyticsEvents.data?.length || 0,
            upcoming:
              analyticsEvents.data?.filter((e) => new Date(e.event_date) > now)
                .length || 0,
            timeline: this.createTimeline(
              analyticsEvents.data || [],
              "created_at",
              days,
            ),
          },
        };

        return formatSuccessResponse({ analytics: analyticsData });

      case "export":
        // Data export functionality
        const exportType = url.searchParams.get("type") || "all";
        const exportData: any = {
          exportedAt: new Date().toISOString(),
          exportType,
        };

        if (exportType === "all" || exportType === "members") {
          const { data: exportMembers } = await supabaseClient
            .from("members")
            .select("*");
          exportData.members = exportMembers;
        }

        if (exportType === "all" || exportType === "donations") {
          const { data: exportDonations } = await supabaseClient
            .from("donations")
            .select("*");
          exportData.donations = exportDonations;
        }

        if (exportType === "all" || exportType === "events") {
          const { data: exportEvents } = await supabaseClient
            .from("events")
            .select("*");
          exportData.events = exportEvents;
        }

        return formatSuccessResponse({ export: exportData });

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    return formatErrorResponse(error as Error);
  }

  // Helper methods
  function calculateGrowthTrend(data: any[], dateField: string) {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthCount = data.filter(
      (item) => new Date(item[dateField]) >= thisMonth,
    ).length;
    const lastMonthCount = data.filter((item) => {
      const date = new Date(item[dateField]);
      return date >= lastMonth && date <= lastMonthEnd;
    }).length;

    const growth =
      lastMonthCount > 0
        ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
        : 0;

    return {
      thisMonth: thisMonthCount,
      lastMonth: lastMonthCount,
      growth,
    };
  }

  function groupByField(data: any[], field: string) {
    const groups: Record<string, number> = {};
    data.forEach((item) => {
      const value = item[field] || "Unknown";
      groups[value] = (groups[value] || 0) + 1;
    });
    return groups;
  }

  function createTimeline(data: any[], dateField: string, days: number) {
    const timeline: Record<string, number> = {};
    const now = new Date();

    // Initialize timeline with zeros
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split("T")[0];
      timeline[dateKey] = 0;
    }

    // Count items by date
    data.forEach((item) => {
      const dateKey = new Date(item[dateField]).toISOString().split("T")[0];
      if (timeline.hasOwnProperty(dateKey)) {
        timeline[dateKey]++;
      }
    });

    return Object.entries(timeline)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }
});
