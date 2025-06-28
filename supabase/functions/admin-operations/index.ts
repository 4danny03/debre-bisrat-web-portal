import { corsHeaders } from "@shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_KEY") ?? "",
    );

    const { operation, data } = await req.json();

    let result;

    switch (operation) {
      case "getDashboardStats":
        result = await getDashboardStats(supabaseClient);
        break;
      case "getRecentActivity":
        result = await getRecentActivity(supabaseClient, data?.limit || 6);
        break;
      case "bulkDelete":
        result = await bulkDelete(supabaseClient, data.table, data.ids);
        break;
      case "bulkUpdate":
        result = await bulkUpdate(supabaseClient, data.table, data.updates);
        break;
      case "exportData":
        result = await exportData(supabaseClient, data.table, data.filters);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Admin operations error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});

async function getDashboardStats(supabaseClient: any) {
  try {
    const [events, members, donations, testimonials, prayerRequests, sermons] =
      await Promise.all([
        supabaseClient
          .from("events")
          .select("*", { count: "exact", head: true }),
        supabaseClient
          .from("members")
          .select("*", { count: "exact", head: true }),
        supabaseClient.from("donations").select("amount, created_at"),
        supabaseClient
          .from("testimonials")
          .select("*", { count: "exact", head: true }),
        supabaseClient
          .from("prayer_requests")
          .select("*", { count: "exact", head: true }),
        supabaseClient
          .from("sermons")
          .select("*", { count: "exact", head: true }),
      ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentDonations =
      donations.data?.filter(
        (d: any) => d?.created_at && new Date(d.created_at) >= thirtyDaysAgo,
      ) || [];

    const recentDonationAmount = recentDonations.reduce(
      (sum: number, d: any) => sum + (d?.amount || 0),
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
}

async function getRecentActivity(supabaseClient: any, limit = 6) {
  try {
    const activities: any[] = [];

    // Get recent events
    const { data: events } = await supabaseClient
      .from("events")
      .select("id, title, description, created_at")
      .order("created_at", { ascending: false })
      .limit(3);

    events?.forEach((event: any) => {
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
    const { data: members } = await supabaseClient
      .from("members")
      .select("id, full_name, created_at")
      .order("created_at", { ascending: false })
      .limit(3);

    members?.forEach((member: any) => {
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
}

async function bulkDelete(supabaseClient: any, table: string, ids: string[]) {
  if (!ids || ids.length === 0) {
    throw new Error("No IDs provided for bulk delete");
  }

  const { error } = await supabaseClient.from(table).delete().in("id", ids);

  if (error) throw error;

  return { deletedCount: ids.length };
}

async function bulkUpdate(supabaseClient: any, table: string, updates: any[]) {
  if (!updates || updates.length === 0) {
    throw new Error("No updates provided for bulk update");
  }

  const results = [];
  for (const update of updates) {
    const { id, ...data } = update;
    const { data: result, error } = await supabaseClient
      .from(table)
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${table} with id ${id}:`, error);
      continue;
    }
    results.push(result);
  }

  return { updatedCount: results.length, results };
}

async function exportData(supabaseClient: any, table: string, filters?: any) {
  let query = supabaseClient.from(table).select("*");

  // Apply filters if provided
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        query = query.eq(key, value);
      }
    });
  }

  const { data, error } = await query;

  if (error) throw error;

  return {
    data,
    exportedAt: new Date().toISOString(),
    recordCount: data?.length || 0,
  };
}
