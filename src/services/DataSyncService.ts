import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

/**
 * Centralized data synchronization service
 * Handles real-time updates and ensures admin changes are reflected on the main website
 */
class DataSyncService {
  private static instance: DataSyncService;
  private subscriptions: Map<string, any> = new Map();
  private eventListeners: Map<string, Set<() => void>> = new Map();
  private retryAttempts: Map<string, number> = new Map();
  private maxRetries = 3;
  private retryDelay = 1000;

  private constructor() {
    this.setupGlobalSubscriptions();
  }

  static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }

  /**
   * Set up global real-time subscriptions for all critical tables
   */
  private setupGlobalSubscriptions() {
    const tables = [
      "events",
      "gallery",
      "sermons",
      "testimonials",
      "prayer_requests",
      "members",
      "donations",
      "profiles",
    ];

    tables.forEach((table) => {
      this.subscribeToTable(table);
    });
  }

  /**
   * Subscribe to a specific table for real-time updates
   */
  private subscribeToTable(tableName: string) {
    const channelName = `${tableName}-sync`;

    const subscription = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: tableName,
        },
        (payload) => {
          console.log(`${tableName} table changed:`, payload);
          this.handleTableChange(tableName, payload);
        },
      )
      .subscribe((status) => {
        console.log(`Subscription status for ${tableName}:`, status);
        if (status === "SUBSCRIBED") {
          console.log(`Successfully subscribed to ${tableName} changes`);
        } else if (status === "CHANNEL_ERROR") {
          console.error(`Failed to subscribe to ${tableName}`);
          this.retrySubscription(tableName);
        }
      });

    this.subscriptions.set(tableName, subscription);
  }

  /**
   * Handle table changes and notify listeners
   */
  private handleTableChange(tableName: string, payload: any) {
    // Emit specific table change event
    this.emitEvent(`${tableName}Changed`);

    // Emit general data change event
    this.emitEvent("dataChanged");

    // Emit browser events for backward compatibility
    window.dispatchEvent(
      new CustomEvent(`${tableName}Changed`, { detail: payload }),
    );
    window.dispatchEvent(
      new CustomEvent("dataRefresh", { detail: { table: tableName, payload } }),
    );
  }

  /**
   * Retry subscription with exponential backoff
   */
  private retrySubscription(tableName: string) {
    const attempts = this.retryAttempts.get(tableName) || 0;

    if (attempts < this.maxRetries) {
      const delay = this.retryDelay * Math.pow(2, attempts);

      setTimeout(() => {
        console.log(
          `Retrying subscription for ${tableName} (attempt ${attempts + 1})`,
        );
        this.subscribeToTable(tableName);
        this.retryAttempts.set(tableName, attempts + 1);
      }, delay);
    } else {
      console.error(`Max retry attempts reached for ${tableName} subscription`);
    }
  }

  /**
   * Add event listener for data changes
   */
  addEventListener(event: string, callback: () => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event: string, callback: () => void) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * Emit event to all listeners
   */
  private emitEvent(event: string) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback();
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Force refresh all data
   */
  forceRefresh() {
    this.emitEvent("forceRefresh");
    window.dispatchEvent(new CustomEvent("forceRefresh"));
  }

  /**
   * Trigger admin action completed event
   */
  notifyAdminAction(action: string, table: string, data?: any) {
    console.log(`Admin action completed: ${action} on ${table}`, data);

    // Emit specific events
    this.emitEvent(`${table}Changed`);
    this.emitEvent("adminActionCompleted");

    // Emit browser events
    window.dispatchEvent(
      new CustomEvent(`${table}Changed`, { detail: { action, data } }),
    );
    window.dispatchEvent(
      new CustomEvent("adminActionCompleted", {
        detail: { action, table, data },
      }),
    );

    // Force a refresh after a short delay to ensure data consistency
    setTimeout(() => {
      this.forceRefresh();
    }, 500);
  }

  /**
   * Check connection health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id")
        .limit(1);
      return !error;
    } catch (error) {
      console.error("Health check failed:", error);
      return false;
    }
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup() {
    this.subscriptions.forEach((subscription, tableName) => {
      console.log(`Cleaning up subscription for ${tableName}`);
      supabase.removeChannel(subscription);
    });
    this.subscriptions.clear();
    this.eventListeners.clear();
  }

  /**
   * Get subscription status
   */
  getSubscriptionStatus(): Record<string, string> {
    const status: Record<string, string> = {};
    this.subscriptions.forEach((subscription, tableName) => {
      status[tableName] = subscription.state || "unknown";
    });
    return status;
  }
}

export const dataSyncService = DataSyncService.getInstance();
export default DataSyncService;
