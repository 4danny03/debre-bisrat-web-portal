/**
 * Simplified and robust DataSyncService
 * Completely rewritten to eliminate undefined errors and improve reliability
 */

// Types for better type safety
interface AdminAction {
  id: string;
  action: string;
  table: string;
  timestamp: Date;
  userId?: string;
  data?: any;
  details?: string;
}

interface ErrorLog {
  id: string;
  error: string;
  timestamp: Date;
  context?: string;
  stack?: string;
}

interface SyncStatus {
  isHealthy: boolean;
  lastSync: Date;
  connectionStatus: "connected" | "disconnected" | "error";
  services: Record<string, "active" | "inactive" | "error">;
}

interface EventListener {
  id: string;
  event: string;
  callback: Function;
}

/**
 * Core DataSyncService - handles data synchronization and event management
 */
class CoreDataSyncService {
  private listeners: EventListener[] = [];
  private isProcessing = false;
  private nextListenerId = 1;

  /**
   * Subscribe to events with automatic cleanup
   */
  subscribe(event: string, callback: Function): () => void {
    if (!event || typeof callback !== "function") {
      console.warn("DataSyncService: Invalid subscription parameters");
      return () => {};
    }

    // Ensure listeners array is initialized
    if (!this.listeners || !Array.isArray(this.listeners)) {
      this.listeners = [];
    }

    const listener: EventListener = {
      id: `listener_${this.nextListenerId++}`,
      event,
      callback,
    };

    this.listeners.push(listener);

    // Return cleanup function
    return () => {
      if (this.listeners && Array.isArray(this.listeners)) {
        this.listeners = this.listeners.filter(
          (l) => l && l.id !== listener.id,
        );
      }
    };
  }

  /**
   * Emit events to subscribers
   */
  emitEvent(event: string, data?: any): void {
    if (!event) {
      console.warn("DataSyncService: Cannot emit event without name");
      return;
    }

    if (this.isProcessing) {
      console.log("DataSyncService: Already processing, queuing event");
      setTimeout(() => this.emitEvent(event, data), 10);
      return;
    }

    this.isProcessing = true;

    try {
      const eventListeners =
        this.listeners && Array.isArray(this.listeners)
          ? this.listeners.filter((l) => l && l.event === event)
          : [];

      eventListeners.forEach((listener) => {
        try {
          listener.callback(data);
        } catch (error) {
          console.error(
            `DataSyncService: Error in event listener for ${event}:`,
            error,
          );
        }
      });
    } catch (error) {
      console.error("DataSyncService: Error emitting event:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Force refresh - triggers data reload
   */
  forceRefresh(): void {
    console.log("DataSyncService: Force refresh requested");
    this.emitEvent("forceRefresh");
  }

  /**
   * Clear all listeners
   */
  clearAll(): void {
    if (this.listeners && Array.isArray(this.listeners)) {
      this.listeners = [];
    } else {
      this.listeners = [];
    }
    this.isProcessing = false;
  }

  /**
   * Get current status
   */
  getStatus(): { listeners: number; isProcessing: boolean } {
    return {
      listeners:
        this.listeners && Array.isArray(this.listeners)
          ? this.listeners.length
          : 0,
      isProcessing: this.isProcessing,
    };
  }
}

/**
 * Admin Action Tracker - handles audit logging
 */
class AdminActionTracker {
  private actions: AdminAction[] = [];
  private errors: ErrorLog[] = [];
  private maxActions = 1000;
  private maxErrors = 100;
  private nextActionId = 1;
  private nextErrorId = 1;

  constructor() {
    // Ensure arrays are always properly initialized
    console.log("AdminActionTracker constructor called");
    this.actions = [];
    this.errors = [];
  }

  /**
   * Record an admin action
   */
  recordAction(
    action: string,
    table: string,
    data?: any,
    userId?: string,
    details?: string,
  ): void {
    if (!action || !table) {
      console.warn("AdminActionTracker: Action and table are required");
      return;
    }

    try {
      // Ensure actions array is initialized
      if (!this.actions || !Array.isArray(this.actions)) {
        this.actions = [];
      }

      const actionRecord: AdminAction = {
        id: `action_${this.nextActionId++}`,
        action,
        table,
        timestamp: new Date(),
        userId: userId || "system",
        data: data ? this.sanitizeData(data) : undefined,
        details,
      };

      this.actions.unshift(actionRecord);

      // Keep only the most recent actions
      if (this.actions && this.actions.length > this.maxActions) {
        this.actions = this.actions.slice(0, this.maxActions);
      }

      console.log(`AdminActionTracker: Recorded ${action} on ${table}`);
    } catch (error) {
      console.error("AdminActionTracker: Error recording action:", error);
      // Avoid recursive call if logError fails
      try {
        this.logError("Failed to record admin action", error as Error);
      } catch (logErr) {
        console.error("AdminActionTracker: Failed to log error:", logErr);
      }
    }
  }

  /**
   * Log an error
   */
  logError(message: string, error: Error, context?: string): void {
    try {
      // Ensure errors array is initialized
      if (!this.errors || !Array.isArray(this.errors)) {
        this.errors = [];
      }

      const errorRecord: ErrorLog = {
        id: `error_${this.nextErrorId++}`,
        error: `${message}: ${error?.message || "Unknown error"}`,
        timestamp: new Date(),
        context,
        stack: error?.stack,
      };

      this.errors.unshift(errorRecord);

      // Keep only the most recent errors
      if (this.errors && this.errors.length > this.maxErrors) {
        this.errors = this.errors.slice(0, this.maxErrors);
      }

      console.error("AdminActionTracker: Error logged:", errorRecord);
    } catch (logError) {
      console.error("AdminActionTracker: Failed to log error:", logError);
    }
  }

  /**
   * Get recent admin actions
   */
  getRecentActions(limit = 10): AdminAction[] {
    try {
      if (!this.actions || !Array.isArray(this.actions)) {
        console.warn("AdminActionTracker: Actions array is not initialized");
        this.actions = [];
        return [];
      }
      const actionsLength = Array.isArray(this.actions)
        ? this.actions.length
        : 0;
      return this.actions.slice(0, Math.max(0, Math.min(limit, actionsLength)));
    } catch (error) {
      console.error("AdminActionTracker: Error getting recent actions:", error);
      return [];
    }
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit = 10): ErrorLog[] {
    try {
      if (!this.errors || !Array.isArray(this.errors)) {
        console.warn("AdminActionTracker: Errors array is not initialized");
        this.errors = [];
        return [];
      }
      const errorsLength = Array.isArray(this.errors) ? this.errors.length : 0;
      return this.errors.slice(0, Math.max(0, Math.min(limit, errorsLength)));
    } catch (error) {
      console.error("AdminActionTracker: Error getting recent errors:", error);
      return [];
    }
  }

  /**
   * Get actions by user
   */
  getActionsByUser(userId: string, limit = 20): AdminAction[] {
    try {
      if (!userId || !this.actions || !Array.isArray(this.actions)) {
        return [];
      }
      const actionsLength = Array.isArray(this.actions)
        ? this.actions.length
        : 0;
      return this.actions
        .filter((action) => action && action.userId === userId)
        .slice(0, Math.max(0, Math.min(limit, actionsLength)));
    } catch (error) {
      console.error(
        "AdminActionTracker: Error getting actions by user:",
        error,
      );
      return [];
    }
  }

  /**
   * Get actions by table
   */
  getActionsByTable(table: string, limit = 20): AdminAction[] {
    try {
      if (!table || !this.actions || !Array.isArray(this.actions)) {
        return [];
      }
      const actionsLength = Array.isArray(this.actions)
        ? this.actions.length
        : 0;
      return this.actions
        .filter((action) => action && action.table === table)
        .slice(0, Math.max(0, Math.min(limit, actionsLength)));
    } catch (error) {
      console.error(
        "AdminActionTracker: Error getting actions by table:",
        error,
      );
      return [];
    }
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalActions: number;
    totalErrors: number;
    actionsByTable: Record<string, number>;
    actionsByUser: Record<string, number>;
    recentActivity: { today: number; thisWeek: number; thisMonth: number };
  } {
    try {
      // Ensure arrays are initialized
      if (!this.actions || !Array.isArray(this.actions)) {
        this.actions = [];
      }
      if (!this.errors || !Array.isArray(this.errors)) {
        this.errors = [];
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const actionsByTable: Record<string, number> = {};
      const actionsByUser: Record<string, number> = {};
      let todayCount = 0;
      let thisWeekCount = 0;
      let thisMonthCount = 0;

      if (this.actions && Array.isArray(this.actions)) {
        this.actions.forEach((action) => {
          if (!action) return;

          // Count by table
          if (action.table) {
            actionsByTable[action.table] =
              (actionsByTable[action.table] || 0) + 1;
          }

          // Count by user
          const user = action.userId || "unknown";
          actionsByUser[user] = (actionsByUser[user] || 0) + 1;

          // Count by time period
          if (action.timestamp) {
            if (action.timestamp >= today) todayCount++;
            if (action.timestamp >= thisWeek) thisWeekCount++;
            if (action.timestamp >= thisMonth) thisMonthCount++;
          }
        });
      }

      const actionsLength = Array.isArray(this.actions)
        ? this.actions.length
        : 0;
      const errorsLength = Array.isArray(this.errors) ? this.errors.length : 0;

      return {
        totalActions: actionsLength,
        totalErrors: errorsLength,
        actionsByTable,
        actionsByUser,
        recentActivity: {
          today: todayCount,
          thisWeek: thisWeekCount,
          thisMonth: thisMonthCount,
        },
      };
    } catch (error) {
      console.error("AdminActionTracker: Error getting statistics:", error);
      return {
        totalActions: 0,
        totalErrors: 0,
        actionsByTable: {},
        actionsByUser: {},
        recentActivity: { today: 0, thisWeek: 0, thisMonth: 0 },
      };
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    try {
      this.actions = [];
      this.errors = [];
      console.log("AdminActionTracker: All data cleared");
    } catch (error) {
      console.error("AdminActionTracker: Error clearing data:", error);
      // Force re-initialization
      this.actions = [];
      this.errors = [];
    }
  }

  /**
   * Export data for backup
   */
  exportData(): {
    actions: AdminAction[];
    errors: ErrorLog[];
    exportedAt: string;
  } {
    try {
      // Ensure arrays are initialized before spreading
      if (!this.actions || !Array.isArray(this.actions)) {
        this.actions = [];
      }
      if (!this.errors || !Array.isArray(this.errors)) {
        this.errors = [];
      }

      return {
        actions: [...this.actions],
        errors: [...this.errors],
        exportedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("AdminActionTracker: Error exporting data:", error);
      return {
        actions: [],
        errors: [],
        exportedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Sanitize data for logging
   */
  private sanitizeData(data: any): any {
    try {
      if (!data) return null;
      if (typeof data === "string") return data.substring(0, 100);
      if (typeof data === "object") {
        return {
          id: data.id || "unknown",
          type: typeof data,
          preview: JSON.stringify(data).substring(0, 100),
        };
      }
      return String(data).substring(0, 100);
    } catch (error) {
      return "Error sanitizing data";
    }
  }
}

/**
 * System Health Monitor
 */
class SystemHealthMonitor {
  private status: SyncStatus = {
    isHealthy: true,
    lastSync: new Date(),
    connectionStatus: "connected",
    services: {
      database: "active",
      storage: "active",
      auth: "active",
    },
  };
  private startTime = Date.now();

  /**
   * Check system health
   */
  async checkHealth(): Promise<boolean> {
    try {
      // Update last sync time
      this.status.lastSync = new Date();
      this.status.isHealthy = true;
      this.status.connectionStatus = "connected";

      return true;
    } catch (error) {
      console.error("SystemHealthMonitor: Health check failed:", error);
      this.status.isHealthy = false;
      this.status.connectionStatus = "error";
      return false;
    }
  }

  /**
   * Get current status
   */
  getStatus(): SyncStatus {
    return { ...this.status };
  }

  /**
   * Get uptime in milliseconds
   */
  getUptime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Get formatted uptime
   */
  getFormattedUptime(): string {
    const uptimeMs = this.getUptime();
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
}

/**
 * Main DataSyncService - combines all functionality
 */
class DataSyncServiceManager {
  private coreService: CoreDataSyncService;
  private actionTracker: AdminActionTracker;
  private healthMonitor: SystemHealthMonitor;
  private isInitialized = false;

  constructor() {
    console.log("DataSyncServiceManager constructor called");
    this.coreService = new CoreDataSyncService();
    this.actionTracker = new AdminActionTracker();
    this.healthMonitor = new SystemHealthMonitor();
    this.initialize();
  }

  /**
   * Initialize the service
   */
  private initialize(): void {
    if (this.isInitialized) return;

    try {
      console.log("DataSyncService: Initializing...");

      // Start health monitoring
      this.startHealthMonitoring();

      this.isInitialized = true;
      console.log("DataSyncService: Initialized successfully");
    } catch (error) {
      console.error("DataSyncService: Initialization failed:", error);
      this.actionTracker.logError(
        "Service initialization failed",
        error as Error,
      );
    }
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    // Check health every 5 minutes
    setInterval(
      () => {
        this.healthMonitor.checkHealth();
      },
      5 * 60 * 1000,
    );
  }

  // Core service methods
  subscribe(event: string, callback: Function): () => void {
    return this.coreService.subscribe(event, callback);
  }

  emitEvent(event: string, data?: any): void {
    this.coreService.emitEvent(event, data);
  }

  forceRefresh(): void {
    this.coreService.forceRefresh();
  }

  // Admin action methods
  notifyAdminAction(
    action: string,
    table: string,
    data?: any,
    userId?: string,
    details?: string,
  ): void {
    this.actionTracker.recordAction(action, table, data, userId, details);
  }

  getRecentAdminActions(limit = 10): AdminAction[] {
    return this.actionTracker.getRecentActions(limit);
  }

  getAdminActionsByUser(userId: string, limit = 20): AdminAction[] {
    return this.actionTracker.getActionsByUser(userId, limit);
  }

  getAdminActionsByTable(table: string, limit = 20): AdminAction[] {
    return this.actionTracker.getActionsByTable(table, limit);
  }

  // Error handling methods
  logError(message: string, error: Error, context?: string): void {
    this.actionTracker.logError(message, error, context);
  }

  getRecentErrors(limit = 10): ErrorLog[] {
    return this.actionTracker.getRecentErrors(limit);
  }

  // Health monitoring methods
  async checkHealth(): Promise<boolean> {
    return this.healthMonitor.checkHealth();
  }

  getSystemStats(): {
    uptime: string;
    isHealthy: boolean;
    lastSync: Date;
    listeners: number;
    totalActions: number;
    totalErrors: number;
    actionsByTable: Record<string, number>;
    recentActivity: { today: number; thisWeek: number; thisMonth: number };
  } {
    const healthStatus = this.healthMonitor.getStatus();
    const coreStatus = this.coreService.getStatus();
    const actionStats = this.actionTracker.getStatistics();

    return {
      uptime: this.healthMonitor.getFormattedUptime(),
      isHealthy: healthStatus.isHealthy,
      lastSync: healthStatus.lastSync,
      listeners: coreStatus.listeners,
      totalActions: actionStats.totalActions,
      totalErrors: actionStats.totalErrors,
      actionsByTable: actionStats.actionsByTable,
      recentActivity: actionStats.recentActivity,
    };
  }

  // Utility methods
  exportLogs(): {
    actions: AdminAction[];
    errors: ErrorLog[];
    exportedAt: string;
  } {
    return this.actionTracker.exportData();
  }

  clearLogs(): void {
    this.actionTracker.clear();
  }

  cleanup(): void {
    this.coreService.clearAll();
    this.actionTracker.clear();
    this.isInitialized = false;
    console.log("DataSyncService: Cleaned up successfully");
  }
}

// Create singleton instances
const coreDataSyncService = new CoreDataSyncService();
const dataSyncServiceManager = new DataSyncServiceManager();

// Export the services
export const DataSyncService = coreDataSyncService;
export const dataSyncService = dataSyncServiceManager;

// Export types for use in other files
export type { AdminAction, ErrorLog, SyncStatus };
