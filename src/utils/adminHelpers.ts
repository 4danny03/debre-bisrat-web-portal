import { supabase } from "@/integrations/supabase/client";

/**
 * Utility functions for admin operations with proper error handling
 */

export interface DatabaseHealthCheck {
  isHealthy: boolean;
  errors: string[];
  tables: Record<string, boolean>;
}

type TableName =
  | "profiles"
  | "events"
  | "members"
  | "donations"
  | "sermons"
  | "gallery"
  | "testimonials"
  | "prayer_requests"
  | "appointments";

/**
 * Check the health of all database tables used by the admin system
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealthCheck> {
  const result: DatabaseHealthCheck = {
    isHealthy: true,
    errors: [],
    tables: {},
  };

  const tables: TableName[] = [
    "profiles",
    "events",
    "members",
    "donations",
    "sermons",
    "gallery",
    "testimonials",
    "prayer_requests",
    "appointments",
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select("count").limit(1);

      if (error) {
        result.tables[table] = false;
        result.errors.push(`${table}: ${(error as Error).message ?? String(error)}`);
        result.isHealthy = false;
      } else {
        result.tables[table] = true;
      }
    } catch (err: unknown) {
      result.tables[table] = false;
      result.errors.push(
        `${table}: ${err instanceof Error ? err.message : String(err)}`,
      );
      result.isHealthy = false;
    }
  }

  return result;
}

/**
 * Safe data loader with error handling and retries
 */
export async function safeDataLoader<T>(
  operation: () => Promise<{ data: T[] | null; error: unknown }>,
  tableName: string,
  retries: number = 2,
): Promise<{ data: T[]; error: string | null }> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(
        `Loading ${tableName} data (attempt ${attempt + 1}/${retries + 1})`,
      );

      const result = await operation();

      if (result.error) {
        lastError = result.error;
        console.error(
          `${tableName} load error (attempt ${attempt + 1}):`,
          result.error,
        );

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000),
          );
          continue;
        }
      } else {
        console.log(
          `Successfully loaded ${tableName} data:`,
          result.data?.length || 0,
          "records",
        );
        return { data: result.data || [], error: null };
      }
    } catch (err) {
      lastError = err;
      console.error(
        `${tableName} load exception (attempt ${attempt + 1}):`,
        err,
      );

      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000),
        );
        continue;
      }
    }
  }

  const errorMessage =
    lastError instanceof Error
      ? lastError.message
      : typeof lastError === "string"
        ? lastError
        : `Failed to load ${tableName} after ${retries + 1} attempts`;

  return { data: [], error: errorMessage };
}

/**
 * Validate admin authentication and permissions
 */
export async function validateAdminAuth(): Promise<{
  isValid: boolean;
  user: unknown;
  error?: string;
}> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      return {
        isValid: false,
        user: null,
        error: `Session error: ${sessionError.message}`,
      };
    }

    if (!session) {
      return { isValid: false, user: null, error: "No active session" };
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, email")
      .eq("id", session.user.id)
      .single();

    if (profileError) {
      return {
        isValid: false,
        user: null,
        error: `Profile error: ${profileError.message}`,
      };
    }

    if (!profile || profile.role !== "admin") {
      return { isValid: false, user: null, error: "Insufficient permissions" };
    }

    return {
      isValid: true,
      user: {
        ...session.user,
        role: profile.role,
        email: profile.email || session.user.email,
      },
    };
  } catch (error) {
    return {
      isValid: false,
      user: null,
      error:
        error instanceof Error ? error.message : "Authentication check failed",
    };
  }
}

/**
 * Safe operation wrapper with error handling
 */
export async function safeOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    console.log(`Starting operation: ${operationName}`);
    const data = await operation();
    console.log(`Operation completed successfully: ${operationName}`);
    return { success: true, data };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`Operation failed: ${operationName}`, error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Format error messages for user display
 */
export function formatErrorMessage(error: unknown, context?: string): string {
  if (!error) return "Unknown error occurred";

  let message = "";

  if (typeof error === "string") {
    message = error;
  } else if ((error as Error).message) {
    message = (error as Error).message;
  } else if ((error as { error_description?: string }).error_description) {
    message = (error as { error_description?: string }).error_description;
  } else {
    message = "An unexpected error occurred";
  }

  // Add context if provided
  if (context) {
    message = `${context}: ${message}`;
  }

  // Make database errors more user-friendly
  if (message.includes("relation") && message.includes("does not exist")) {
    message = "Database table not found. Please contact support.";
  } else if (message.includes("permission denied")) {
    message = "Access denied. Please check your permissions.";
  } else if (message.includes("connection")) {
    message = "Database connection error. Please try again.";
  }

  return message;
}

/**
 * Debounce function to prevent rapid successive calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Log admin actions for audit trail
 */
export function logAdminAction(action: string, table: string, details?: unknown) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    table,
    details,
    url: window.location.pathname,
    userAgent: navigator.userAgent,
  };

  console.log("Admin Action:", logEntry);

  // Store in localStorage for debugging
  try {
    const logs = JSON.parse(localStorage.getItem("admin_action_logs") || "[]");
    logs.unshift(logEntry);
    // Keep only last 50 logs
    const recentLogs = logs.slice(0, 50);
    localStorage.setItem("admin_action_logs", JSON.stringify(recentLogs));
  } catch (error) {
    console.warn("Failed to store admin action log:", error);
  }
}
