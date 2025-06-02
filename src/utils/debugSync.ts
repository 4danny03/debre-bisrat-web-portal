/**
 * Debug utilities for data synchronization
 * Helps identify and troubleshoot sync issues between admin and public pages
 */

import { dataSyncService } from "@/services/DataSyncService";
import { gitSyncService } from "@/services/GitSyncService";
import { supabase } from "@/integrations/supabase/client";

interface DebugInfo {
  timestamp: string;
  connectionHealth: boolean;
  subscriptionStatus: Record<string, string>;
  gitStatus: any;
  recentEvents: any[];
  databaseCounts: Record<string, number>;
}

class DebugSyncService {
  private static instance: DebugSyncService;
  private debugLog: DebugInfo[] = [];
  private maxLogEntries = 50;

  private constructor() {}

  static getInstance(): DebugSyncService {
    if (!DebugSyncService.instance) {
      DebugSyncService.instance = new DebugSyncService();
    }
    return DebugSyncService.instance;
  }

  /**
   * Capture current system state for debugging
   */
  async captureDebugInfo(): Promise<DebugInfo> {
    const timestamp = new Date().toISOString();

    try {
      // Get connection health
      const connectionHealth = await dataSyncService.checkHealth();

      // Get subscription status
      const subscriptionStatus = dataSyncService.getSubscriptionStatus();

      // Get git status
      const gitStatus = await gitSyncService.getGitStatus();

      // Get recent events from database
      const { data: recentEvents } = await supabase
        .from("events")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      // Get database counts
      const tables = [
        "events",
        "gallery",
        "sermons",
        "testimonials",
        "members",
      ];
      const databaseCounts: Record<string, number> = {};

      for (const table of tables) {
        const { count } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });
        databaseCounts[table] = count || 0;
      }

      const debugInfo: DebugInfo = {
        timestamp,
        connectionHealth,
        subscriptionStatus,
        gitStatus,
        recentEvents: recentEvents || [],
        databaseCounts,
      };

      // Add to debug log
      this.debugLog.unshift(debugInfo);
      if (this.debugLog.length > this.maxLogEntries) {
        this.debugLog = this.debugLog.slice(0, this.maxLogEntries);
      }

      return debugInfo;
    } catch (error) {
      console.error("Failed to capture debug info:", error);
      const errorInfo: DebugInfo = {
        timestamp,
        connectionHealth: false,
        subscriptionStatus: {},
        gitStatus: { error: error.message },
        recentEvents: [],
        databaseCounts: {},
      };

      this.debugLog.unshift(errorInfo);
      return errorInfo;
    }
  }

  /**
   * Get debug log history
   */
  getDebugLog(): DebugInfo[] {
    return [...this.debugLog];
  }

  /**
   * Clear debug log
   */
  clearDebugLog(): void {
    this.debugLog = [];
  }

  /**
   * Export debug info as JSON
   */
  exportDebugInfo(): string {
    return JSON.stringify(
      {
        exportTime: new Date().toISOString(),
        debugLog: this.debugLog,
        systemInfo: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        },
      },
      null,
      2,
    );
  }

  /**
   * Test data synchronization
   */
  async testDataSync(): Promise<{
    success: boolean;
    results: Record<string, any>;
    errors: string[];
  }> {
    const results: Record<string, any> = {};
    const errors: string[] = [];

    try {
      console.log("Starting data sync test...");

      // Test 1: Database connection
      try {
        const { data, error } = await supabase
          .from("events")
          .select("id")
          .limit(1);
        results.databaseConnection = {
          success: !error,
          data: data?.length || 0,
        };
        if (error) errors.push(`Database connection failed: ${error.message}`);
      } catch (error) {
        results.databaseConnection = { success: false, error: error.message };
        errors.push(`Database connection test failed: ${error.message}`);
      }

      // Test 2: Real-time subscriptions
      const subscriptionStatus = dataSyncService.getSubscriptionStatus();
      results.subscriptions = subscriptionStatus;

      const failedSubscriptions = Object.entries(subscriptionStatus)
        .filter(([_, status]) => status !== "SUBSCRIBED")
        .map(([table, status]) => `${table}: ${status}`);

      if (failedSubscriptions.length > 0) {
        errors.push(`Failed subscriptions: ${failedSubscriptions.join(", ")}`);
      }

      // Test 3: Git status
      try {
        const gitStatus = await gitSyncService.getGitStatus();
        results.gitStatus = gitStatus;
      } catch (error) {
        results.gitStatus = { error: error.message };
        errors.push(`Git status check failed: ${error.message}`);
      }

      // Test 4: Force refresh
      try {
        dataSyncService.forceRefresh();
        results.forceRefresh = { success: true };
      } catch (error) {
        results.forceRefresh = { success: false, error: error.message };
        errors.push(`Force refresh failed: ${error.message}`);
      }

      console.log("Data sync test completed", { results, errors });

      return {
        success: errors.length === 0,
        results,
        errors,
      };
    } catch (error) {
      console.error("Data sync test failed:", error);
      return {
        success: false,
        results: {},
        errors: [`Test execution failed: ${error.message}`],
      };
    }
  }

  /**
   * Monitor data changes for a specific duration
   */
  async monitorChanges(durationMs: number = 30000): Promise<{
    changes: any[];
    duration: number;
  }> {
    const changes: any[] = [];
    const startTime = Date.now();

    const handleChange = (event: CustomEvent) => {
      changes.push({
        timestamp: new Date().toISOString(),
        type: event.type,
        detail: event.detail,
      });
    };

    // Listen for various change events
    const events = [
      "eventsChanged",
      "galleryChanged",
      "sermonsChanged",
      "testimonialsChanged",
      "membersChanged",
      "dataChanged",
      "adminActionCompleted",
      "forceRefresh",
    ];

    events.forEach((eventType) => {
      window.addEventListener(eventType, handleChange);
    });

    // Wait for the specified duration
    await new Promise((resolve) => setTimeout(resolve, durationMs));

    // Remove event listeners
    events.forEach((eventType) => {
      window.removeEventListener(eventType, handleChange);
    });

    const duration = Date.now() - startTime;

    console.log(
      `Monitoring completed. Captured ${changes.length} changes in ${duration}ms`,
    );

    return { changes, duration };
  }
}

export const debugSyncService = DebugSyncService.getInstance();
export default DebugSyncService;

// Global debug functions for console access
if (typeof window !== "undefined") {
  (window as any).debugSync = {
    capture: () => debugSyncService.captureDebugInfo(),
    log: () => debugSyncService.getDebugLog(),
    export: () => debugSyncService.exportDebugInfo(),
    test: () => debugSyncService.testDataSync(),
    monitor: (duration?: number) => debugSyncService.monitorChanges(duration),
    clear: () => debugSyncService.clearDebugLog(),
  };

  console.log("Debug sync utilities available at window.debugSync");
}
