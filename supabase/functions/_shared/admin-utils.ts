/**
 * Utility functions for admin operations
 */

/**
 * Validates admin authentication and authorization
 */
export async function validateAdminAccess(
  supabaseClient: any,
  authHeader: string | null,
) {
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

  return user;
}

/**
 * Processes monthly data for analytics
 */
export function processMonthlyData(
  items: any[],
  dateField: string,
  valueField?: string,
) {
  if (!Array.isArray(items)) {
    console.warn("processMonthlyData: items is not an array");
    return [];
  }

  const monthlyData: Record<string, { count: number; amount: number }> = {};

  items.forEach((item) => {
    if (!item || !item[dateField]) return;

    try {
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
        monthlyData[month].amount += Number(item[valueField]) || 0;
      }
    } catch (error) {
      console.warn("Error processing date:", item[dateField], error);
    }
  });

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    count: data.count,
    amount: data.amount,
  }));
}

/**
 * Processes purpose data for donations
 */
export function processPurposeData(donations: any[]) {
  if (!Array.isArray(donations)) {
    console.warn("processPurposeData: donations is not an array");
    return [];
  }

  const purposeData: Record<string, number> = {};
  const total = donations.reduce((sum, d) => sum + (Number(d?.amount) || 0), 0);

  donations.forEach((donation) => {
    if (!donation) return;
    const purpose = donation.purpose || "General Fund";
    const amount = Number(donation.amount) || 0;
    purposeData[purpose] = (purposeData[purpose] || 0) + amount;
  });

  return Object.entries(purposeData).map(([purpose, amount]) => ({
    purpose,
    amount,
    percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
  }));
}

/**
 * Processes type data for members
 */
export function processTypeData(members: any[], typeField: string) {
  if (!Array.isArray(members)) {
    console.warn("processTypeData: members is not an array");
    return [];
  }

  const typeData: Record<string, number> = {};
  const total = members.length;

  members.forEach((member) => {
    if (!member) return;
    const type = member[typeField] || "Regular";
    typeData[type] = (typeData[type] || 0) + 1;
  });

  return Object.entries(typeData).map(([type, count]) => ({
    type,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));
}

/**
 * Calculates trends for analytics
 */
export function calculateTrends(items: any[], valueField?: string) {
  if (!Array.isArray(items)) {
    console.warn("calculateTrends: items is not an array");
    return { thisMonth: 0, lastMonth: 0, growth: 0 };
  }

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonth = items.filter((item) => {
    if (!item?.created_at) return false;
    try {
      return new Date(item.created_at) >= thisMonthStart;
    } catch {
      return false;
    }
  });

  const lastMonth = items.filter((item) => {
    if (!item?.created_at) return false;
    try {
      const date = new Date(item.created_at);
      return date >= lastMonthStart && date <= lastMonthEnd;
    } catch {
      return false;
    }
  });

  const thisMonthValue = valueField
    ? thisMonth.reduce((sum, item) => sum + (Number(item[valueField]) || 0), 0)
    : thisMonth.length;

  const lastMonthValue = valueField
    ? lastMonth.reduce((sum, item) => sum + (Number(item[valueField]) || 0), 0)
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

/**
 * Creates a timeline for analytics
 */
export function createTimeline(data: any[], dateField: string, days: number) {
  if (!Array.isArray(data)) {
    console.warn("createTimeline: data is not an array");
    return [];
  }

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
    if (!item || !item[dateField]) return;

    try {
      const dateKey = new Date(item[dateField]).toISOString().split("T")[0];
      if (timeline.hasOwnProperty(dateKey)) {
        timeline[dateKey]++;
      }
    } catch (error) {
      console.warn("Error processing date:", item[dateField], error);
    }
  });

  return Object.entries(timeline)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}
