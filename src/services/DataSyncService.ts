/**
 * Enhanced data synchronization service with admin action tracking
 */
interface SyncData {
  id?: string;
  type?: string;
  preview?: string;
  timestamp?: string | number | Date;
  database?: boolean;
  authentication?: boolean;
  startTime?: number;
  [key: string]: any;
}
class DataSyncService {
  private static instance: DataSyncService;
  private isInitialized = false;
  private startTime: number = Date.now();
  private adminActions: Array<{
    action: string;
    table: string;
    timestamp: Date;
    data?: SyncData;
    userId?: string;
    details?: string;
  }> = [];
  private syncStatus: Record<string, SyncData> = {};
  private errorLog: Array<{
    error: string;
    timestamp: Date;
    context?: string;
  }> = [];

  private constructor() {}

  static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }

  initialize() {
    if (this.isInitialized) return;
    console.log("DataSyncService initialized with enhanced admin tracking");
    this.isInitialized = true;
    this.startHealthMonitoring();
  }

  async checkHealth(): Promise<boolean> {
    try {
      // Simulate health check
      const healthStatus = {
        database: true,
        authentication: true,
        storage: true,
        realtime: true,
        timestamp: new Date().toISOString(),
      };

      this.syncStatus = {
        ...this.syncStatus,
        lastHealthCheck: healthStatus,
      };

      return true;
    } catch (error) {
      this.logError("Health check failed", error as Error);
      return false;
    }
  }

  getSubscriptionStatus(): Record<string, string> {
    return {
      status: "active",
      lastSync: new Date().toISOString(),
      adminActions: this.adminActions.length.toString(),
      errors: this.errorLog.length.toString(),
      uptime: this.calculateUptime(),
    };
  }

  notifyAdminAction(
    action: string,
    table: string,
    data?: SyncData,
    userId?: string,
    details?: string,
  ) {
    const actionRecord = {
      action,
      table,
      timestamp: new Date(),
      data: data
        ? {
            id: data.id,
            type: typeof data,
            preview: this.getDataPreview(data),
          }
        : undefined,
      userId: userId || "system",
      details,
      sessionId: this.getCurrentSessionId(),
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "server",
      ipAddress: this.getCurrentIP(),
    };

    this.adminActions.unshift(actionRecord);

    // Keep only last 1000 actions (increased for better audit trail)
    if (this.adminActions.length > 1000) {
      this.adminActions = this.adminActions.slice(0, 1000);
    }

    console.log(`Admin action recorded: ${action} on ${table}`, {
      userId: actionRecord.userId,
      details,
      timestamp: actionRecord.timestamp,
      sessionId: actionRecord.sessionId,
    });

    // Update sync status
    this.syncStatus.lastAdminAction = actionRecord;

    // Store critical actions in localStorage for persistence
    if (this.isCriticalAction(action)) {
      this.persistCriticalAction(actionRecord);
    }
  }

  sync(data?: SyncData) {
    // ...existing code...
  }

  getRecentAdminActions(limit = 10) {
    return this.adminActions.slice(0, limit);
  }

  getAdminActionsByUser(userId: string, limit = 20) {
    return this.adminActions
      .filter((action) => action.userId === userId)
      .slice(0, limit);
  }

  getAdminActionsByTable(table: string, limit = 20) {
    return this.adminActions
      .filter((action) => action.table === table)
      .slice(0, limit);
  }

  logError(message: string, error: Error, context?: string) {
    const errorRecord = {
      error: `${message}: ${error.message}`,
      timestamp: new Date(),
      context,
    };

    this.errorLog.unshift(errorRecord);

    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(0, 100);
    }

    console.error("DataSyncService Error:", errorRecord);
  }

  getRecentErrors(limit = 10) {
    return this.errorLog.slice(0, limit);
  }

  getSystemStats() {
    return {
      totalAdminActions: this.adminActions.length,
      totalErrors: this.errorLog.length,
      uptime: this.calculateUptime(),
      lastHealthCheck: this.syncStatus.lastHealthCheck?.timestamp,
      isHealthy:
        this.syncStatus.lastHealthCheck?.database &&
        this.syncStatus.lastHealthCheck?.authentication,
      actionsByTable: this.getActionStatsByTable(),
      errorRate: this.calculateErrorRate(),
    };
  }

  private calculateUptime(): string {
    // Simple uptime calculation (would be more sophisticated in production)
    const uptimeMs = Date.now() - this.startTime;
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  private getActionStatsByTable() {
    const stats: Record<string, number> = {};
    if (Array.isArray(this.adminActions)) {
      this.adminActions.forEach((action) => {
        if (action && action.table) {
          stats[action.table] = (stats[action.table] || 0) + 1;
        }
      });
    }
    return stats;
  }

  private calculateErrorRate(): number {
    const totalOperations = this.adminActions.length;
    const totalErrors = this.errorLog.length;
    return totalOperations > 0 ? (totalErrors / totalOperations) * 100 : 0;
  }

  private startHealthMonitoring() {
    this.startTime = Date.now();

    // Run health check every 10 minutes to reduce frequency
    setInterval(
      () => {
        this.checkHealth();
      },
      10 * 60 * 1000,
    );
  }

  exportLogs() {
    return {
      adminActions: this.adminActions,
      errors: this.errorLog,
      syncStatus: this.syncStatus,
      exportedAt: new Date().toISOString(),
    };
  }

  clearLogs() {
    this.adminActions = [];
    this.errorLog = [];
    console.log("DataSyncService logs cleared");
  }

  private getDataPreview(data: unknown): string {
    if (!data) return "N/A";
    if (typeof data === "string") return data.substring(0, 50);
    if ((data as any).title) return (data as any).title.substring(0, 50);
    if ((data as any).name) return (data as any).name.substring(0, 50);
    if ((data as any).email) return (data as any).email;
    return JSON.stringify(data).substring(0, 50);
  }

  private getCurrentSessionId(): string {
    if (typeof window !== "undefined") {
      let sessionId = sessionStorage.getItem("admin_session_id");
      if (!sessionId) {
        sessionId =
          Date.now().toString() + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem("admin_session_id", sessionId);
      }
      return sessionId;
    }
    return "server-session";
  }

  private getCurrentIP(): string {
    // In a real app, this would be obtained from the server
    return "client-ip";
  }

  private isCriticalAction(action: string): boolean {
    const criticalActions = [
      "delete",
      "update_role",
      "create_admin",
      "bulk_delete",
      "system_config",
    ];
    return criticalActions.some((critical) =>
      action.toLowerCase().includes(critical),
    );
  }

  private persistCriticalAction(actionRecord: unknown) {
    try {
      if (
        typeof window === "undefined" ||
        !window.localStorage ||
        !actionRecord
      ) {
        return;
      }

      const stored = localStorage.getItem("critical_admin_actions");
      let criticalActions: unknown[] = [];

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            criticalActions = parsed;
          }
        } catch {
          // If parsing fails, start with empty array
        }
      }

      criticalActions.unshift(actionRecord);
      // Keep only last 100 critical actions
      const trimmed = criticalActions.slice(0, 100);
      localStorage.setItem("critical_admin_actions", JSON.stringify(trimmed));
    } catch (error) {
      console.error("Failed to persist critical action:", error);
    }
  }

  getCriticalActions(limit = 20) {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return [];
      }

      const stored = localStorage.getItem("critical_admin_actions");
      if (!stored) {
        return [];
      }

      const criticalActions = JSON.parse(stored);
      if (!Array.isArray(criticalActions)) {
        return [];
      }

      return criticalActions
        .slice(0, limit)
        .map((action: unknown) => {
          if (!action || typeof action !== 'object' || action === null) return null;
          const act = action as { [key: string]: any };
          return {
            ...act,
            timestamp: act.timestamp
              ? new Date(act.timestamp)
              : new Date(),
          };
        })
        .filter(Boolean);
    } catch (error) {
      console.error("Failed to get critical actions:", error);
      return [];
    }
  }

  getActionsByDateRange(startDate: Date, endDate: Date) {
    return this.adminActions.filter((action) => {
      const actionDate = new Date(action.timestamp);
      return actionDate >= startDate && actionDate <= endDate;
    });
  }

  getActionStatistics() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      today: this.adminActions.filter((a) => new Date(a.timestamp) >= today)
        .length,
      thisWeek: this.adminActions.filter(
        (a) => new Date(a.timestamp) >= thisWeek,
      ).length,
      thisMonth: this.adminActions.filter(
        (a) => new Date(a.timestamp) >= thisMonth,
      ).length,
      total: this.adminActions.length,
      byAction: this.getActionStatsByType(),
      byUser: this.getActionStatsByUser(),
      criticalCount: this.getCriticalActions().length,
    };
  }

  private getActionStatsByType() {
    const stats: Record<string, number> = {};
    if (Array.isArray(this.adminActions)) {
      this.adminActions.forEach((action) => {
        if (action && action.action) {
          stats[action.action] = (stats[action.action] || 0) + 1;
        }
      });
    }
    return stats;
  }

  private getActionStatsByUser() {
    const stats: Record<string, number> = {};
    if (Array.isArray(this.adminActions)) {
      this.adminActions.forEach((action) => {
        if (action) {
          const user = action.userId || "unknown";
          stats[user] = (stats[user] || 0) + 1;
        }
      });
    }
    return stats;
  }

  cleanup() {
    this.isInitialized = false;
    this.adminActions = [];
    this.errorLog = [];
    this.syncStatus = {};
    console.log("DataSyncService cleaned up");
  }
}

export const dataSyncService = DataSyncService.getInstance();
export default DataSyncService;
