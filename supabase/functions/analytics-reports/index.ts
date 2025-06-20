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
    const reportType = url.searchParams.get("type") || "overview";
    const timeRange = url.searchParams.get("timeRange") || "6months";

    // Calculate date ranges
    const now = new Date();
    const monthsBack =
      timeRange === "3months" ? 3 : timeRange === "6months" ? 6 : 12;
    const startDate = new Date(
      now.getTime() - monthsBack * 30 * 24 * 60 * 60 * 1000,
    );

    let reportData: any = {};

    switch (reportType) {
      case "donations":
        const { data: donations } = await supabaseClient
          .from("donations")
          .select("*")
          .gte("created_at", startDate.toISOString());

        const totalAmount =
          donations?.reduce((sum, d) => sum + d.amount, 0) || 0;
        const monthlyData = processMonthlyData(
          donations || [],
          "created_at",
          "amount",
        );
        const purposeData = processPurposeData(donations || []);

        reportData = {
          total: totalAmount,
          count: donations?.length || 0,
          monthly: monthlyData,
          byPurpose: purposeData,
          trends: calculateTrends(donations || [], "amount"),
        };
        break;

      case "members":
        const { data: members } = await supabaseClient
          .from("members")
          .select("*")
          .gte("created_at", startDate.toISOString());

        const membersByMonth = processMonthlyData(members || [], "created_at");
        const membersByType = processTypeData(members || [], "membership_type");

        reportData = {
          total: members?.length || 0,
          monthly: membersByMonth,
          byType: membersByType,
          trends: calculateTrends(members || []),
        };
        break;

      case "engagement":
        const [prayerRequestsRes, testimonialsRes, sermonsRes, eventsRes] =
          await Promise.all([
            supabaseClient
              .from("prayer_requests")
              .select("*", { count: "exact", head: true }),
            supabaseClient
              .from("testimonials")
              .select("*", { count: "exact", head: true }),
            supabaseClient
              .from("sermons")
              .select("*", { count: "exact", head: true }),
            supabaseClient
              .from("events")
              .select("*", { count: "exact", head: true }),
          ]);

        reportData = {
          prayerRequests: prayerRequestsRes.count || 0,
          testimonials: testimonialsRes.count || 0,
          sermons: sermonsRes.count || 0,
          events: eventsRes.count || 0,
        };
        break;

      default:
        // Overview report
        const [donationsOverview, membersOverview, eventsOverview] =
          await Promise.all([
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
          ]);

        reportData = {
          donations: {
            total:
              donationsOverview.data?.reduce((sum, d) => sum + d.amount, 0) ||
              0,
            count: donationsOverview.data?.length || 0,
          },
          members: {
            total: membersOverview.data?.length || 0,
          },
          events: {
            total: eventsOverview.data?.length || 0,
            upcoming:
              eventsOverview.data?.filter((e) => new Date(e.event_date) > now)
                .length || 0,
          },
        };
    }

    return formatSuccessResponse({
      reportType,
      timeRange,
      generatedAt: new Date().toISOString(),
      data: reportData,
    });
  } catch (error) {
    return formatErrorResponse(error as Error);
  }
});

// Helper functions
function processMonthlyData(
  items: any[],
  dateField: string,
  valueField?: string,
) {
  const monthlyData: Record<string, { count: number; amount: number }> = {};

  items.forEach((item) => {
    const date = new Date(item[dateField]);
    const month = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
    if (!monthlyData[month]) {
      monthlyData[month] = { count: 0, amount: 0 };
    }
    monthlyData[month].count += 1;
    if (valueField && item[valueField]) {
      monthlyData[month].amount += item[valueField];
    }
  });

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    count: data.count,
    amount: data.amount,
  }));
}

function processPurposeData(donations: any[]) {
  const purposeData: Record<string, number> = {};
  const total = donations.reduce((sum, d) => sum + d.amount, 0);

  donations.forEach((donation) => {
    const purpose = donation.purpose || "General Fund";
    purposeData[purpose] = (purposeData[purpose] || 0) + donation.amount;
  });

  return Object.entries(purposeData).map(([purpose, amount]) => ({
    purpose,
    amount,
    percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
  }));
}

function processTypeData(members: any[], typeField: string) {
  const typeData: Record<string, number> = {};
  const total = members.length;

  members.forEach((member) => {
    const type = member[typeField] || "Regular";
    typeData[type] = (typeData[type] || 0) + 1;
  });

  return Object.entries(typeData).map(([type, count]) => ({
    type,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));
}

function calculateTrends(items: any[], valueField?: string) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonth = items.filter(
    (item) => new Date(item.created_at) >= thisMonthStart,
  );
  const lastMonth = items.filter((item) => {
    const date = new Date(item.created_at);
    return date >= lastMonthStart && date <= lastMonthEnd;
  });

  const thisMonthValue = valueField
    ? thisMonth.reduce((sum, item) => sum + (item[valueField] || 0), 0)
    : thisMonth.length;
  const lastMonthValue = valueField
    ? lastMonth.reduce((sum, item) => sum + (item[valueField] || 0), 0)
    : lastMonth.length;

  const growth =
    lastMonthValue > 0
      ? Math.round(((thisMonthValue - lastMonthValue) / lastMonthValue) * 100)
      : 0;

  return {
    thisMonth: thisMonthValue,
    lastMonth: lastMonthValue,
    growth,
  };
}
