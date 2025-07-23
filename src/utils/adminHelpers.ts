import { supabase } from "@/integrations/supabase/client";
import { dataSyncService } from "@/services/DataSyncService";
import { api } from "@/integrations/supabase/api";

/**
 * Safe data loader with error handling and logging
 */
export const safeDataLoader = async <T>(
  loader: () => Promise<{ data: T; error?: unknown }>,
  context: string,
): Promise<{ data: T | null; error: unknown }> => {
  try {
    console.log(`Loading data for: ${context}`);
    const result = await loader();

    if (result.error) {
      console.error(`Data loading error for ${context}:`, result.error);
      dataSyncService.logError(
        `Data loading failed for ${context}`,
        new Error(result.error.message || "Unknown error"),
        context,
      );
      return { data: null, error: result.error };
    }

    console.log(
      `Successfully loaded data for: ${context}`,
      result.data?.length || "N/A",
      "items",
    );
    return { data: result.data, error: null };
  } catch (error) {
    console.error(`Exception in data loader for ${context}:`, error);
    dataSyncService.logError(
      `Exception in data loader for ${context}`,
      error as Error,
      context,
    );
    return { data: null, error };
  }
};

/**
 * Log admin actions with context
 */
export const logAdminAction = (
  action: string,
  table: string,
  data?: Record<string, unknown>,
  userId?: string,
  details?: string,
): void => {
  try {
    dataSyncService.notifyAdminAction(action, table, data, userId, details);
    console.log(`Admin action logged: ${action} on ${table}`);
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
};

/**
 * Format error messages for user display
 */
export const formatErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (!error) return fallback;

  // Handle Supabase errors
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Handle PostgreSQL errors
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    switch (error.code) {
      case "23505":
        return "This record already exists";
      case "23503":
        return "Cannot delete this record because it is referenced by other data";
      case "42P01":
        return "Database table not found";
      default:
        const details =
          "details" in error && typeof error.details === "string"
            ? error.details
            : "";
        const hint =
          "hint" in error && typeof error.hint === "string" ? error.hint : "";
        return details || hint || fallback;
    }
  }

  return fallback;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
};

/**
 * Generate a safe filename for exports
 */
export const generateExportFilename = (
  prefix: string,
  extension = "csv",
): string => {
  const timestamp = new Date().toISOString().split("T")[0];
  const safePrefix = prefix.replace(/[^a-zA-Z0-9]/g, "_");
  return `${safePrefix}_${timestamp}.${extension}`;
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Safe JSON parse with fallback
 */
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn("Failed to parse JSON:", error);
    return fallback;
  }
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

/**
 * Format date for display
 */
export const formatDate = (date: string | Date, format = "short"): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (format === "short") {
    return dateObj.toLocaleDateString();
  } else if (format === "long") {
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } else if (format === "datetime") {
    return dateObj.toLocaleString();
  }

  return dateObj.toLocaleDateString();
};

/**
 * Check if user has admin permissions
 */
export const checkAdminPermissions = async (): Promise<boolean> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return false;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    return profile?.role === "admin";
  } catch (error) {
    console.error("Error checking admin permissions:", error);
    return false;
  }
};

/**
 * Get current user profile
 */
export const getCurrentUserProfile = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    return profile;
  } catch (error) {
    console.error("Error getting current user profile:", error);
    return null;
  }
};

/**
 * Bulk operations helper
 */
export const performBulkOperation = async (
  operation: "delete" | "update" | "export",
  table: string,
  data: Record<string, unknown>,
) => {
  try {
    const result = await dataSyncService.callAdminFunction(
      `bulk${operation.charAt(0).toUpperCase() + operation.slice(1)}`,
      {
        table,
        ...data,
      },
    );

    logAdminAction(`bulk_${operation}`, table, {
      count: data.ids?.length || data.updates?.length || 0,
    });
    return result;
  } catch (error) {
    console.error(`Bulk ${operation} failed:`, error);
    throw error;
  }
};

/**
 * Enhanced dashboard stats loader
 */
export const loadDashboardStats = async () => {
  try {
    const stats = await api.analytics.getDashboardStats();
    logAdminAction("load", "dashboard_stats", stats);
    return stats;
  } catch (error) {
    console.error("Failed to load dashboard stats:", error);
    // Fallback to direct API calls
    return await loadDashboardStatsFallback();
  }
};

/**
 * Fallback dashboard stats loader
 */
const loadDashboardStatsFallback = async () => {
  try {
    const results = await Promise.allSettled([
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("members").select("*", { count: "exact", head: true }),
      supabase
        .from("donations")
        .select("amount, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("testimonials").select("*", { count: "exact", head: true }),
      supabase
        .from("prayer_requests")
        .select("*", { count: "exact", head: true }),
      supabase.from("sermons").select("*", { count: "exact", head: true }),
    ]);

    const [
      eventsRes,
      membersRes,
      donationsRes,
      testimonialsRes,
      prayerRequestsRes,
      sermonsRes,
    ] = results.map((result) => {
      if (result.status === "rejected") {
        console.error("Dashboard data load failed:", result.reason);
        return { data: null, count: 0, error: result.reason };
      }
      return result.value;
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const validDonationsData = Array.isArray(donationsRes?.data)
      ? donationsRes.data
      : [];
    const recentDonations = validDonationsData.filter(
      (d: any) => d?.created_at && new Date(d.created_at) >= thirtyDaysAgo,
    );

    const recentDonationAmount = recentDonations.reduce(
      (sum: number, d: any) => sum + (Number(d?.amount) || 0),
      0,
    );

    return {
      totalEvents: eventsRes?.count || 0,
      totalMembers: membersRes?.count || 0,
      totalDonations: Array.isArray(donationsRes?.data)
        ? donationsRes.data.length
        : 0,
      totalTestimonials: testimonialsRes?.count || 0,
      totalPrayerRequests: prayerRequestsRes?.count || 0,
      totalSermons: sermonsRes?.count || 0,
      recentDonationAmount,
    };
  } catch (error) {
    console.error("Fallback dashboard stats failed:", error);
    return {
      totalEvents: 0,
      totalMembers: 0,
      totalDonations: 0,
      totalTestimonials: 0,
      totalPrayerRequests: 0,
      totalSermons: 0,
      recentDonationAmount: 0,
    };
  }
};

/**
 * Enhanced recent activity loader
 */
export const loadRecentActivity = async (limit = 6) => {
  try {
    const activity = await api.analytics.getRecentActivity(limit);
    const safeActivity = Array.isArray(activity) ? activity : [];
    logAdminAction("load", "recent_activity", { count: safeActivity.length });
    return safeActivity;
  } catch (error) {
    console.error("Failed to load recent activity:", error);
    return [];
  }
};

/**
 * Email marketing helper functions
 */
export const validateEmailTemplate = (template: any): boolean => {
  if (!template.subject || !template.content) {
    return false;
  }
  if (template.template_type === "newsletter" && !template.title) {
    return false;
  }
  return true;
};

export const formatEmailCampaignStats = (stats: Record<string, unknown>) => {
  return {
    sent: stats.sent || 0,
    delivered: stats.delivered || 0,
    opened: stats.opened || 0,
    clicked: stats.clicked || 0,
    bounced: stats.bounced || 0,
    unsubscribed: stats.unsubscribed || 0,
    deliveryRate:
      stats.sent > 0 ? ((stats.delivered / stats.sent) * 100).toFixed(2) : "0",
    openRate:
      stats.delivered > 0
        ? ((stats.opened / stats.delivered) * 100).toFixed(2)
        : "0",
    clickRate:
      stats.opened > 0
        ? ((stats.clicked / stats.opened) * 100).toFixed(2)
        : "0",
  };
};

export const validateMemberData = (
  memberData: Record<string, unknown>,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!memberData.full_name || memberData.full_name.trim().length < 2) {
    errors.push("Full name is required and must be at least 2 characters");
  }

  if (memberData.email && !isValidEmail(memberData.email)) {
    errors.push("Invalid email format");
  }

  if (memberData.phone && !isValidPhone(memberData.phone)) {
    errors.push("Invalid phone number format");
  }

  const validMembershipTypes = ["regular", "student", "senior", "family"];
  if (
    memberData.membership_type &&
    !validMembershipTypes.includes(memberData.membership_type)
  ) {
    errors.push("Invalid membership type");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateAppointmentData = (
  appointmentData: Record<string, unknown>,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!appointmentData.name || appointmentData.name.trim().length < 2) {
    errors.push("Name is required and must be at least 2 characters");
  }

  if (!appointmentData.email || !isValidEmail(appointmentData.email)) {
    errors.push("Valid email is required");
  }

  if (!appointmentData.phone || !isValidPhone(appointmentData.phone)) {
    errors.push("Valid phone number is required");
  }

  if (!appointmentData.service_title) {
    errors.push("Service selection is required");
  }

  if (!appointmentData.requested_date) {
    errors.push("Requested date is required");
  }

  if (!appointmentData.requested_time) {
    errors.push("Requested time is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Admin panel health check
 */
export const performHealthCheck = async () => {
  const results = {
    database: false,
    api: false,
    auth: false,
    sync: false,
  };

  try {
    // Test database connection
    const { error: dbError } = await supabase
      .from("profiles")
      .select("count", { count: "exact", head: true });
    results.database = !dbError;

    // Test API endpoints
    try {
      await api.analytics.getDashboardStats();
      results.api = true;
    } catch (error) {
      results.api = false;
    }

    // Test authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    results.auth = !!session;

    // Test sync service
    const syncStatus = dataSyncService.getStatus();
    results.sync = syncStatus.isActive;
  } catch (error) {
    console.error("Health check failed:", error);
  }

  return results;
};

/**
 * Export data to CSV format
 */
export const exportToCSV = (
  data: Record<string, unknown>[],
  filename: string,
) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("No data to export");
  }

  const headers = Object.keys(data[0] || {});
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle values that might contain commas or quotes
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || "";
        })
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", generateExportFilename(filename));
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  logAdminAction("export", "csv_export", {
    filename,
    recordCount: data.length,
  });
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(
        `Attempt ${attempt + 1} failed, retrying in ${delay}ms:`,
        error,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};
