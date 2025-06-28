import { supabase } from "@/integrations/supabase/client";

// Types for admin actions and error logging
interface AdminAction {
  id: string;
  action: string;
  table: string;
  data?: any;
  userId?: string;
  timestamp: string;
  details?: string;
}

interface ErrorLog {
  id: string;
  message: string;
  error: Error;
  context?: string;
  timestamp: string;
  userId?: string;
}

interface DataSyncStatus {
  isActive: boolean;
  listeners: number;
  lastSync: string | null;
  errors: number;
}

// Core data synchronization service
class CoreDataSyncService {
  private syncStatus: DataSyncStatus = {
    isActive: false,
    listeners: 0,
    lastSync: null,
    errors: 0,
  };

  private subscriptions: Map<string, any> = new Map();
  private syncQueue: Array<{ table: string; action: string; data: any }> = [];
  private isProcessingQueue = false;

  initialize(): void {
    this.syncStatus.isActive = true;
    this.syncStatus.lastSync = new Date().toISOString();
    console.log("CoreDataSyncService: Initialized successfully");
  }

  getStatus(): DataSyncStatus {
    return { ...this.syncStatus };
  }

  addSubscription(table: string, callback: (payload: any) => void): void {
    if (this.subscriptions.has(table)) {
      console.warn(`Subscription for table ${table} already exists`);
      return;
    }

    const subscription = supabase
      .channel(`${table}_changes`)
      .on("postgres_changes", { event: "*", schema: "public", table }, callback)
      .subscribe();

    this.subscriptions.set(table, subscription);
    this.syncStatus.listeners++;
    console.log(`Added subscription for table: ${table}`);
  }

  removeSubscription(table: string): void {
    const subscription = this.subscriptions.get(table);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(table);
      this.syncStatus.listeners--;
      console.log(`Removed subscription for table: ${table}`);
    }
  }

  queueSync(table: string, action: string, data: any): void {
    this.syncQueue.push({ table, action, data });
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.syncQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.syncQueue.length > 0) {
      const item = this.syncQueue.shift();
      if (item) {
        try {
          await this.processSyncItem(item);
          this.syncStatus.lastSync = new Date().toISOString();
        } catch (error) {
          console.error("Error processing sync item:", error);
          this.syncStatus.errors++;
        }
      }
    }

    this.isProcessingQueue = false;
  }

  private async processSyncItem(item: {
    table: string;
    action: string;
    data: any;
  }): Promise<void> {
    // Process the sync item - this could involve API calls, cache updates, etc.
    console.log(`Processing sync: ${item.action} on ${item.table}`);
    // Implementation would depend on specific sync requirements
  }

  clearAll(): void {
    // Unsubscribe from all channels
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
    this.syncQueue.length = 0;
    this.syncStatus = {
      isActive: false,
      listeners: 0,
      lastSync: null,
      errors: 0,
    };
    console.log("CoreDataSyncService: Cleared all subscriptions and data");
  }
}

// Admin action tracking service
class AdminActionTracker {
  private actions: AdminAction[] = [];
  private errors: ErrorLog[] = [];
  private maxActions = 1000;
  private maxErrors = 500;

  constructor() {
    this.ensureArraysInitialized();
  }

  private ensureArraysInitialized(): void {
    if (!Array.isArray(this.actions)) {
      this.actions = [];
    }
    if (!Array.isArray(this.errors)) {
      this.errors = [];
    }
  }

  logAction(
    action: string,
    table: string,
    data?: any,
    userId?: string,
    details?: string,
  ): void {
    this.ensureArraysInitialized();

    const actionLog: AdminAction = {
      id: crypto.randomUUID(),
      action,
      table,
      data,
      userId,
      timestamp: new Date().toISOString(),
      details,
    };

    this.actions.unshift(actionLog);

    // Keep only the most recent actions
    if (this.actions.length > this.maxActions) {
      this.actions = this.actions.slice(0, this.maxActions);
    }

    console.log(`Admin action logged: ${action} on ${table}`);
  }

  logError(
    message: string,
    error: Error,
    context?: string,
    userId?: string,
  ): void {
    this.ensureArraysInitialized();

    const errorLog: ErrorLog = {
      id: crypto.randomUUID(),
      message,
      error,
      context,
      timestamp: new Date().toISOString(),
      userId,
    };

    this.errors.unshift(errorLog);

    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    console.error(`Admin error logged: ${message}`, error);
  }

  getRecentActions(limit = 10): AdminAction[] {
    this.ensureArraysInitialized();
    return Array.isArray(this.actions) ? this.actions.slice(0, limit) : [];
  }

  getRecentErrors(limit = 10): ErrorLog[] {
    this.ensureArraysInitialized();
    return Array.isArray(this.errors) ? this.errors.slice(0, limit) : [];
  }

  getActionsByTable(table: string, limit = 10): AdminAction[] {
    this.ensureArraysInitialized();
    if (!Array.isArray(this.actions)) return [];

    return this.actions
      .filter((action) => action.table === table)
      .slice(0, limit);
  }

  getActionsByUser(userId: string, limit = 10): AdminAction[] {
    this.ensureArraysInitialized();
    if (!Array.isArray(this.actions)) return [];

    return this.actions
      .filter((action) => action.userId === userId)
      .slice(0, limit);
  }

  getStats(): {
    totalActions: number;
    totalErrors: number;
    actionsByTable: Record<string, number>;
    errorsByContext: Record<string, number>;
  } {
    this.ensureArraysInitialized();

    const actionsByTable: Record<string, number> = {};
    const errorsByContext: Record<string, number> = {};

    if (Array.isArray(this.actions)) {
      this.actions.forEach((action) => {
        actionsByTable[action.table] = (actionsByTable[action.table] || 0) + 1;
      });
    }

    if (Array.isArray(this.errors)) {
      this.errors.forEach((error) => {
        const context = error.context || "unknown";
        errorsByContext[context] = (errorsByContext[context] || 0) + 1;
      });
    }

    return {
      totalActions: Array.isArray(this.actions) ? this.actions.length : 0,
      totalErrors: Array.isArray(this.errors) ? this.errors.length : 0,
      actionsByTable,
      errorsByContext,
    };
  }

  exportData(): {
    actions: AdminAction[];
    errors: ErrorLog[];
    exportedAt: string;
  } {
    this.ensureArraysInitialized();

    return {
      actions: Array.isArray(this.actions) ? [...this.actions] : [],
      errors: Array.isArray(this.errors) ? [...this.errors] : [],
      exportedAt: new Date().toISOString(),
    };
  }

  clear(): void {
    this.actions = [];
    this.errors = [];
    console.log("AdminActionTracker: Cleared all actions and errors");
  }
}

// Main DataSyncService class
class DataSyncService {
  private coreService: CoreDataSyncService;
  private actionTracker: AdminActionTracker;
  private isInitialized = false;

  constructor() {
    try {
      this.coreService = new CoreDataSyncService();
      this.actionTracker = new AdminActionTracker();
    } catch (error) {
      console.error("Failed to initialize DataSyncService:", error);
      // Create fallback instances
      this.coreService = new CoreDataSyncService();
      this.actionTracker = new AdminActionTracker();
    }
  }

  initialize(): void {
    if (this.isInitialized) {
      console.warn("DataSyncService: Already initialized");
      return;
    }

    try {
      this.coreService.initialize();
      this.isInitialized = true;
      console.log("DataSyncService: Initialized successfully");
    } catch (error) {
      console.error("DataSyncService: Initialization failed", error);
      this.actionTracker.logError(
        "DataSyncService initialization failed",
        error as Error,
        "initialization",
      );
    }
  }

  // Core service methods
  getStatus(): DataSyncStatus {
    return this.coreService.getStatus();
  }

  addSubscription(table: string, callback: (payload: any) => void): void {
    this.coreService.addSubscription(table, callback);
  }

  removeSubscription(table: string): void {
    this.coreService.removeSubscription(table);
  }

  queueSync(table: string, action: string, data: any): void {
    this.coreService.queueSync(table, action, data);
  }

  // Admin action methods
  notifyAdminAction(
    action: string,
    table: string,
    data?: any,
    userId?: string,
    details?: string,
  ): void {
    this.actionTracker.logAction(action, table, data, userId, details);
  }

  logError(
    message: string,
    error: Error,
    context?: string,
    userId?: string,
  ): void {
    this.actionTracker.logError(message, error, context, userId);
  }

  getRecentAdminActions(limit = 10): AdminAction[] {
    return this.actionTracker.getRecentActions(limit);
  }

  getRecentErrors(limit = 10): ErrorLog[] {
    return this.actionTracker.getRecentErrors(limit);
  }

  getActionsByTable(table: string, limit = 10): AdminAction[] {
    return this.actionTracker.getActionsByTable(table, limit);
  }

  getActionsByUser(userId: string, limit = 10): AdminAction[] {
    return this.actionTracker.getActionsByUser(userId, limit);
  }

  getAdminStats(): {
    totalActions: number;
    totalErrors: number;
    actionsByTable: Record<string, number>;
    errorsByContext: Record<string, number>;
  } {
    return this.actionTracker.getStats();
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

  // Admin-specific methods
  async callAdminFunction(operation: string, data?: any): Promise<any> {
    try {
      const { supabase } = await import("@/integrations/supabase/client");

      const { data: result, error } = await supabase.functions.invoke(
        "supabase-functions-admin-operations",
        {
          body: { operation, data },
        },
      );

      if (error) throw error;

      this.notifyAdminAction("admin_function_call", operation, {
        operation,
        success: true,
      });
      return result;
    } catch (error) {
      this.logError(`Admin function call failed: ${operation}`, error as Error);
      throw error;
    }
  }

  async getDashboardStats(): Promise<any> {
    return this.callAdminFunction("getDashboardStats");
  }

  async getRecentActivity(limit = 6): Promise<any> {
    return this.callAdminFunction("getRecentActivity", { limit });
  }

  async bulkDelete(table: string, ids: string[]): Promise<any> {
    return this.callAdminFunction("bulkDelete", { table, ids });
  }

  async bulkUpdate(table: string, updates: any[]): Promise<any> {
    return this.callAdminFunction("bulkUpdate", { table, updates });
  }

  async exportData(table: string, filters?: any): Promise<any> {
    return this.callAdminFunction("exportData", { table, filters });
  }
}

// Export singleton instance
export const dataSyncService = new DataSyncService();

// Initialize on import
dataSyncService.initialize();

// Export types for use in other modules
export type { AdminAction, ErrorLog, DataSyncStatus };
