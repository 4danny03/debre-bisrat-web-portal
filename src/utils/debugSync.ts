import { supabase } from "@/integrations/supabase/client";
import { DataSyncService } from "@/services/DataSyncService";

export interface DebugInfo {
  timestamp: string;
  component: string;
  action: string;
  data?: any;
  error?: string;
}

class DebugSyncClass {
  private logs: DebugInfo[] = [];
  private maxLogs = 100;

  log(component: string, action: string, data?: any, error?: string): void {
    const logEntry: DebugInfo = {
      timestamp: new Date().toISOString(),
      component,
      action,
      data,
      error,
    };

    this.logs.unshift(logEntry);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    console.log(`[DebugSync] ${component}: ${action}`, data);

    if (error) {
      console.error(`[DebugSync] ${component} Error:`, error);
    }
  }

  getLogs(): DebugInfo[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
    console.log("[DebugSync] Logs cleared");
  }

  async testConnection(): Promise<boolean> {
    try {
      this.log("DebugSync", "Testing database connection");

      const { data, error } = await supabase
        .from("profiles")
        .select("count", { count: "exact", head: true });

      if (error) {
        this.log("DebugSync", "Connection test failed", null, error.message);
        return false;
      }

      this.log("DebugSync", "Connection test successful", { count: data });
      return true;
    } catch (err) {
      this.log("DebugSync", "Connection test error", null, String(err));
      return false;
    }
  }

  async testTableAccess(): Promise<{ [key: string]: boolean }> {
    const tables = [
      "events",
      "gallery",
      "sermons",
      "testimonials",
      "prayer_requests",
      "donations",
      "members",
      "profiles",
    ] as const;

    const results: { [key: string]: boolean } = {};

    for (const table of tables) {
      try {
        this.log("DebugSync", `Testing table access: ${table}`);

        const { error } = await supabase
          .from(table)
          .select("count", { count: "exact", head: true });

        results[table] = !error;

        if (error) {
          this.log(
            "DebugSync",
            `Table access failed: ${table}`,
            null,
            error.message,
          );
        } else {
          this.log("DebugSync", `Table access successful: ${table}`);
        }
      } catch (err) {
        results[table] = false;
        this.log(
          "DebugSync",
          `Table access error: ${table}`,
          null,
          String(err),
        );
      }
    }

    return results;
  }

  triggerForceRefresh(): void {
    this.log("DebugSync", "Triggering force refresh");
    DataSyncService.forceRefresh();
  }

  getSystemInfo(): any {
    return {
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      environment: import.meta.env.MODE,
    };
  }
}

export const debugSync = new DebugSyncClass();

// Make it available globally for debugging
if (typeof window !== "undefined") {
  (window as any).debugSync = debugSync;
}
