import { corsHeaders } from "@shared/cors.ts";
import {
  handleCorsOptions,
  formatErrorResponse,
  formatSuccessResponse,
} from "@shared/utils.ts";
import {
  validateAdminAccess,
  processMonthlyData,
  processPurposeData,
  processTypeData,
  calculateTrends,
  createTimeline,
} from "@shared/admin-utils.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

Deno.serve(async (req) => {
  const corsResponse = handleCorsOptions(req);
  if (corsResponse) return corsResponse;

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_KEY") ?? "",
    );

    // Verify admin authentication
    const user = await validateAdminAccess(
      supabaseClient,
      req.headers.get("Authorization"),
    );

    // Parse request parameters
    const { reportType, timeRange, filters } = await req.json();

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "7days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30days":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90days":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "6months":
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case "12months":
      default:
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    // Apply filters to query
    const applyFilters = (query: any, tableFilters: any) => {
      if (!tableFilters) return query;

      Object.entries(tableFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (typeof value === "object") {
            const { operator, value: filterValue } = value as {
              operator: string;
              value: any;
            };
            switch (operator) {
              case "eq":
                query = query.eq(key, filterValue);
                break;
              case "neq":
                query = query.neq(key, filterValue);
                break;
              case "gt":
                query = query.gt(key, filterValue);
                break;
              case "gte":
                query = query.gte(key, filterValue);
                break;
              case "lt":
                query = query.lt(key, filterValue);
                break;
              case "lte":
                query = query.lte(key, filterValue);
                break;
              case "like":
                query = query.like(key, `%${filterValue}%`);
                break;
              case "ilike":
                query = query.ilike(key, `%${filterValue}%`);
                break;
            }
          } else {
            query = query.eq(key, value);
          }
        }
      });

      return query;
    };

    let reportData: any = {};

    switch (reportType) {
      case "donations": {
        // Fetch donations data with filters
        let query = supabaseClient
          .from("donations")
          .select("*")
          .gte("created_at", startDate.toISOString());

        query = applyFilters(query, filters?.donations);
        const { data: donations, error } = await query;

        if (error)
          throw new Error(`Failed to fetch donations: ${error.message}`);

        // Process donations data
        const totalAmount =
          donations?.reduce((sum, d) => sum + (Number(d.amount) || 0), 0) || 0;
        const monthlyData = processMonthlyData(
          donations || [],
          "created_at",
          "amount",
        );
        const purposeData = processPurposeData(donations || []);
        const trends = calculateTrends(donations || [], "amount");

        reportData = {
          total: totalAmount,
          count: donations?.length || 0,
          monthly: monthlyData,
          byPurpose: purposeData,
          trends,
          timeline: createTimeline(
            donations || [],
            "created_at",
            timeRange === "7days" ? 7 : 30,
          ),
        };
        break;
      }

      case "members": {
        // Fetch members data with filters
        let query = supabaseClient
          .from("members")
          .select("*")
          .gte("created_at", startDate.toISOString());

        query = applyFilters(query, filters?.members);
        const { data: members, error } = await query;

        if (error) throw new Error(`Failed to fetch members: ${error.message}`);

        // Process members data
        const membersByMonth = processMonthlyData(members || [], "created_at");
        const membersByType = processTypeData(members || [], "membership_type");
        const membersByStatus = processTypeData(
          members || [],
          "membership_status",
        );
        const trends = calculateTrends(members || []);

        reportData = {
          total: members?.length || 0,
          monthly: membersByMonth,
          byType: membersByType,
          byStatus: membersByStatus,
          trends,
          timeline: createTimeline(
            members || [],
            "created_at",
            timeRange === "7days" ? 7 : 30,
          ),
          demographics: await getMemberDemographics(
            supabaseClient,
            members || [],
          ),
        };
        break;
      }

      case "events": {
        // Fetch events data with filters
        let query = supabaseClient
          .from("events")
          .select("*")
          .gte("created_at", startDate.toISOString());

        query = applyFilters(query, filters?.events);
        const { data: events, error } = await query;

        if (error) throw new Error(`Failed to fetch events: ${error.message}`);

        // Process events data
        const eventsByMonth = processMonthlyData(events || [], "created_at");
        const upcomingEvents =
          events?.filter((e) => new Date(e.event_date) > now).length || 0;
        const pastEvents =
          events?.filter((e) => new Date(e.event_date) <= now).length || 0;

        reportData = {
          total: events?.length || 0,
          upcoming: upcomingEvents,
          past: pastEvents,
          monthly: eventsByMonth,
          timeline: createTimeline(
            events || [],
            "event_date",
            timeRange === "7days" ? 7 : 30,
          ),
        };
        break;
      }

      case "engagement": {
        // Fetch engagement data
        const [prayerRequestsRes, testimonialsRes, galleryViewsRes] =
          await Promise.all([
            supabaseClient
              .from("prayer_requests")
              .select("*")
              .gte("created_at", startDate.toISOString()),
            supabaseClient
              .from("testimonials")
              .select("*")
              .gte("created_at", startDate.toISOString()),
            supabaseClient
              .from("gallery")
              .select("*")
              .gte("created_at", startDate.toISOString()),
          ]);

        reportData = {
          prayerRequests: {
            total: prayerRequestsRes.data?.length || 0,
            timeline: createTimeline(
              prayerRequestsRes.data || [],
              "created_at",
              timeRange === "7days" ? 7 : 30,
            ),
          },
          testimonials: {
            total: testimonialsRes.data?.length || 0,
            timeline: createTimeline(
              testimonialsRes.data || [],
              "created_at",
              timeRange === "7days" ? 7 : 30,
            ),
          },
          gallery: {
            total: galleryViewsRes.data?.length || 0,
            timeline: createTimeline(
              galleryViewsRes.data || [],
              "created_at",
              timeRange === "7days" ? 7 : 30,
            ),
          },
        };
        break;
      }

      case "overview":
      default: {
        // Fetch overview data
        const [
          donationsRes,
          membersRes,
          eventsRes,
          prayerRequestsRes,
          testimonialsRes,
        ] = await Promise.all([
          supabaseClient
            .from("donations")
            .select("*")
            .gte("created_at", startDate.toISOString()),
          supabaseClient
            .from("members")
            .select("*")
            .gte("created_at", startDate.toISOString()),
          supabaseClient
            .from("events")
            .select("*")
            .gte("created_at", startDate.toISOString()),
          supabaseClient
            .from("prayer_requests")
            .select("*", { count: "exact", head: true }),
          supabaseClient
            .from("testimonials")
            .select("*", { count: "exact", head: true }),
        ]);

        const donations = donationsRes.data || [];
        const members = membersRes.data || [];
        const events = eventsRes.data || [];

        reportData = {
          donations: {
            total: donations.reduce(
              (sum, d) => sum + (Number(d.amount) || 0),
              0,
            ),
            count: donations.length,
            trends: calculateTrends(donations, "amount"),
          },
          members: {
            total: members.length,
            trends: calculateTrends(members),
          },
          events: {
            total: events.length,
            upcoming: events.filter((e) => new Date(e.event_date) > now).length,
          },
          engagement: {
            prayerRequests: prayerRequestsRes.count || 0,
            testimonials: testimonialsRes.count || 0,
          },
        };
      }
    }

    // Log report generation
    await supabaseClient.from("admin_audit_log").insert({
      action: "report_generation",
      table_name: reportType,
      user_id: user.id,
      details: `Generated ${reportType} report for ${timeRange}`,
    });

    return formatSuccessResponse({
      reportType,
      timeRange,
      generatedAt: new Date().toISOString(),
      data: reportData,
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return formatErrorResponse(error as Error);
  }
});

/**
 * Get member demographics data
 */
async function getMemberDemographics(supabaseClient: any, members: any[]) {
  if (!Array.isArray(members) || members.length === 0) {
    return {
      ageGroups: [],
      genderDistribution: [],
      familySize: [],
    };
  }

  // Process age groups
  const ageGroups: Record<string, number> = {
    "Under 18": 0,
    "18-24": 0,
    "25-34": 0,
    "35-44": 0,
    "45-54": 0,
    "55-64": 0,
    "65+": 0,
  };

  // Process gender distribution
  const genderDistribution: Record<string, number> = {};

  // Process family size
  const familySize: Record<string, number> = {
    Single: 0,
    Couple: 0,
    "Small Family (3-4)": 0,
    "Large Family (5+)": 0,
  };

  members.forEach((member) => {
    // Age groups
    if (member.age) {
      const age = Number(member.age);
      if (age < 18) ageGroups["Under 18"]++;
      else if (age < 25) ageGroups["18-24"]++;
      else if (age < 35) ageGroups["25-34"]++;
      else if (age < 45) ageGroups["35-44"]++;
      else if (age < 55) ageGroups["45-54"]++;
      else if (age < 65) ageGroups["55-64"]++;
      else ageGroups["65+"]++;
    }

    // Gender distribution
    if (member.gender) {
      const gender = member.gender;
      genderDistribution[gender] = (genderDistribution[gender] || 0) + 1;
    }

    // Family size
    const familyMembers = (member.family_members || 0) + 1; // +1 for the member themselves
    if (familyMembers === 1) familySize["Single"]++;
    else if (familyMembers === 2) familySize["Couple"]++;
    else if (familyMembers <= 4) familySize["Small Family (3-4)"]++;
    else familySize["Large Family (5+)"]++;
  });

  return {
    ageGroups: Object.entries(ageGroups).map(([group, count]) => ({
      group,
      count,
    })),
    genderDistribution: Object.entries(genderDistribution).map(
      ([gender, count]) => ({ gender, count }),
    ),
    familySize: Object.entries(familySize).map(([size, count]) => ({
      size,
      count,
    })),
  };
}
