import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import express from "express";
import {
  handleCorsOptions,
  formatErrorResponse,
  formatSuccessResponse,
  verifyAdminAccess,
} from "../_shared/utils.ts";

// Load environment variables
dotenv.config();

const supabaseClient = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || "",
);

// Replace Deno.serve with Node.js-compatible server setup
const app = express();
app.use(express.json());

app.post("/admin-dashboard", async (req, res) => {
  const corsResponse = handleCorsOptions(req);
  if (corsResponse) return corsResponse;

  try {
    const { action } = req.body;

    // Verify admin authentication and role
    await verifyAdminAccess(supabaseClient, req.headers.get("Authorization"));

    switch (action) {
      case "dashboard":
        // Get dashboard statistics
        const [
          membersRes,
          donationsRes,
          eventsRes,
          sermonsRes,
          prayerRequestsRes,
          testimonialsRes,
          appointmentsRes,
        ] = await Promise.all([
          supabaseClient
            .from("members")
            .select("membership_status", { count: "exact", head: true }),
          supabaseClient
            .from("donations")
            .select("amount, created_at, status")
            .gte(
              "created_at",
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            ),
          supabaseClient
            .from("events")
            .select("*", { count: "exact", head: true })
            .gte("event_date", new Date().toISOString().split("T")[0]),
          supabaseClient
            .from("sermons")
            .select("*", { count: "exact", head: true }),
          supabaseClient
            .from("prayer_requests")
            .select("*", { count: "exact", head: true })
            .eq("is_answered", false),
          supabaseClient
            .from("testimonials")
            .select("*", { count: "exact", head: true })
            .eq("is_approved", false),
          supabaseClient
            .from("appointments")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
        ]);

        // Calculate donation statistics
        const completedDonations =
          donationsRes.data?.filter((d) => d.status === "completed") || [];
        const totalDonations = completedDonations.reduce(
          (sum, d) => sum + d.amount,
          0,
        );
        const donationCount = completedDonations.length;

        // Calculate monthly donations
        const currentMonth = new Date().getMonth();
        const monthlyDonations = completedDonations.filter(
          (d) => new Date(d.created_at).getMonth() === currentMonth,
        );
        const monthlyTotal = monthlyDonations.reduce(
          (sum, d) => sum + d.amount,
          0,
        );

        // Get member statistics
        const memberStats = await supabaseClient
          .from("members")
          .select("membership_status");

        const membersByStatus =
          memberStats.data?.reduce(
            (acc, member) => {
              acc[member.membership_status] =
                (acc[member.membership_status] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ) || {};

        const dashboardData = {
          members: {
            total: membersRes.count || 0,
            active: membersByStatus.active || 0,
            pending: membersByStatus.pending || 0,
            inactive: membersByStatus.inactive || 0,
          },
          donations: {
            total: totalDonations,
            count: donationCount,
            thisMonth: monthlyTotal,
            monthlyCount: monthlyDonations.length,
            average: donationCount > 0 ? totalDonations / donationCount : 0,
          },
          upcomingEvents: eventsRes.count || 0,
          totalSermons: sermonsRes.count || 0,
          pendingPrayerRequests: prayerRequestsRes.count || 0,
          pendingTestimonials: testimonialsRes.count || 0,
          pendingAppointments: appointmentsRes.count || 0,
        };

        return res.status(200).send(formatSuccessResponse({ dashboard: dashboardData }));

      case "recent_activity":
        // Get recent activity across all tables
        const [
          recentMembers,
          recentDonations,
          recentEvents,
          recentPrayerRequests,
        ] = await Promise.all([
          supabaseClient
            .from("members")
            .select("id, full_name, created_at, membership_status")
            .order("created_at", { ascending: false })
            .limit(5),
          supabaseClient
            .from("donations")
            .select("id, amount, donor_name, created_at")
            .order("created_at", { ascending: false })
            .limit(5),
          supabaseClient
            .from("events")
            .select("id, title, event_date, created_at")
            .order("created_at", { ascending: false })
            .limit(5),
          supabaseClient
            .from("prayer_requests")
            .select("id, name, created_at")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        const recentActivity = {
          members: recentMembers.data || [],
          donations: recentDonations.data || [],
          events: recentEvents.data || [],
          prayerRequests: recentPrayerRequests.data || [],
        };

        return res.status(200).send(formatSuccessResponse({ activity: recentActivity }));

      case "system_health":
        // Check system health
        const healthChecks = [];

        try {
          await supabaseClient
            .from("profiles")
            .select("count", { count: "exact", head: true });
          healthChecks.push({
            component: "Database",
            status: "healthy",
            message: "Database connection successful",
          });
        } catch (error) {
          healthChecks.push({
            component: "Database",
            status: "error",
            message: "Database connection failed",
          });
        }

        try {
          const { data: settings } = await supabaseClient
            .from("site_settings")
            .select("*")
            .single();
          healthChecks.push({
            component: "Site Settings",
            status: "healthy",
            message: "Site settings loaded",
          });
        } catch (error) {
          healthChecks.push({
            component: "Site Settings",
            status: "warning",
            message: "Site settings not configured",
          });
        }

        try {
          const { data: stripeSettings } = await supabaseClient
            .from("stripe_settings")
            .select("*")
            .single();
          const stripeStatus = stripeSettings?.enable_stripe
            ? "configured"
            : "disabled";
          healthChecks.push({
            component: "Stripe",
            status: "healthy",
            message: `Stripe is ${stripeStatus}`,
          });
        } catch (error) {
          healthChecks.push({
            component: "Stripe",
            status: "warning",
            message: "Stripe settings not configured",
          });
        }

        return res.status(200).send(formatSuccessResponse({ health: healthChecks }));

      case "export_data":
        // Export data for backup
        const exportType = url.searchParams.get("type") || "all";
        const exportData: any = {};

        if (exportType === "all" || exportType === "members") {
          const { data: members } = await supabaseClient
            .from("members")
            .select("*");
          exportData.members = members;
        }

        if (exportType === "all" || exportType === "donations") {
          const { data: donations } = await supabaseClient
            .from("donations")
            .select("*");
          exportData.donations = donations;
        }

        if (exportType === "all" || exportType === "events") {
          const { data: events } = await supabaseClient
            .from("events")
            .select("*");
          exportData.events = events;
        }

        if (exportType === "all" || exportType === "sermons") {
          const { data: sermons } = await supabaseClient
            .from("sermons")
            .select("*");
          exportData.sermons = sermons;
        }

        return res.status(200).send(
          formatSuccessResponse({
            export: {
              type: exportType,
              timestamp: new Date().toISOString(),
              data: exportData,
            },
          }),
        );

      case "cleanup":
        // Cleanup old data
        const cleanupType = url.searchParams.get("type");
        const daysOld = parseInt(url.searchParams.get("days") || "90");
        const cutoffDate = new Date(
          Date.now() - daysOld * 24 * 60 * 60 * 1000,
        ).toISOString();

        let cleanupResult: any = {};

        if (cleanupType === "logs" || cleanupType === "all") {
          // Clean up old audit logs if they exist
          cleanupResult.logs = "No audit logs table found";
        }

        if (cleanupType === "inactive_members" || cleanupType === "all") {
          const { count } = await supabaseClient
            .from("members")
            .delete()
            .eq("membership_status", "inactive")
            .lt("created_at", cutoffDate);
          cleanupResult.inactive_members = `Cleaned up ${count || 0} inactive members`;
        }

        return res.status(200).send(formatSuccessResponse({ cleanup: cleanupResult }));

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    return res.status(500).send(formatErrorResponse(error as Error));
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
