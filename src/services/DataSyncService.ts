import { supabase } from "@/integrations/supabase/client";

// Types for admin actions and error logging
interface AdminAction {
  id: string;
  action: string;
  table: string;
  data?: Record<string, unknown>;
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
  private syncQueue: Array<{
    table: string;
    action: string;
    data: Record<string, unknown>;
  }> = [];
  private isProcessingQueue = false;
  private maxRetries = 3;
  private retryDelay = 2000; // 2 seconds

  initialize(): void {
    try {
      this.syncStatus.isActive = true;
      this.syncStatus.lastSync = new Date().toISOString();
      console.log("CoreDataSyncService: Initialized successfully");
    } catch (error) {
      console.error("CoreDataSyncService: Failed to initialize", error);
      this.syncStatus.errors++;
    }
  }

  getStatus(): DataSyncStatus {
    // Ensure we're returning a valid status object even if this.syncStatus is corrupted
    try {
      if (!this.syncStatus || typeof this.syncStatus !== "object") {
        console.warn(
          "DataSyncService: syncStatus was invalid, resetting to defaults",
        );
        this.syncStatus = {
          isActive: false,
          listeners: 0,
          lastSync: null,
          errors: 0,
        };
      }
      return { ...this.syncStatus };
    } catch (error) {
      console.error("Error getting sync status:", error);
      return {
        isActive: false,
        listeners: 0,
        lastSync: null,
        errors: 0,
      };
    }
  }

  addSubscription(table: string, callback: () => void): void {
    try {
      if (!table || typeof table !== "string") {
        console.error("Invalid table name provided to addSubscription");
        return;
      }

      if (this.subscriptions.has(table)) {
        console.warn(`Subscription for table ${table} already exists`);
        return;
      }

      const subscription = supabase
        .channel(`${table}_changes`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          callback,
        )
        .subscribe();

      this.subscriptions.set(table, subscription);
      this.syncStatus.listeners++;
      console.log(`Added subscription for table: ${table}`);
    } catch (error) {
      console.error(`Error adding subscription for table ${table}:`, error);
      this.syncStatus.errors++;
    }
  }

  removeSubscription(table: string): void {
    try {
      if (!table || typeof table !== "string") {
        console.error("Invalid table name provided to removeSubscription");
        return;
      }

      const subscription = this.subscriptions.get(table);
      if (subscription) {
        subscription.unsubscribe();
        this.subscriptions.delete(table);
        this.syncStatus.listeners = Math.max(0, this.syncStatus.listeners - 1); // Prevent negative values
        console.log(`Removed subscription for table: ${table}`);
      }
    } catch (error) {
      console.error(`Error removing subscription for table ${table}:`, error);
      this.syncStatus.errors++;
    }
  }

  queueSync(
    table: string,
    action: string,
    data: Record<string, unknown>,
  ): void {
    try {
      if (!table || !action) {
        console.error("Invalid parameters provided to queueSync");
        return;
      }

      if (!Array.isArray(this.syncQueue)) {
        this.syncQueue = [];
      }

      this.syncQueue.push({ table, action, data: data || {} });

      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    } catch (error) {
      console.error("Error queueing sync operation:", error);
      this.syncStatus.errors++;
    }
  }

  private async processQueue(): Promise<void> {
    if (
      this.isProcessingQueue ||
      !Array.isArray(this.syncQueue) ||
      this.syncQueue.length === 0
    ) {
      return;
    }

    this.isProcessingQueue = true;

    while (Array.isArray(this.syncQueue) && this.syncQueue.length > 0) {
      const item = this.syncQueue.shift();
      if (item) {
        let retries = 0;
        let success = false;

        while (retries < this.maxRetries && !success) {
          try {
            await this.processSyncItem(item);
            this.syncStatus.lastSync = new Date().toISOString();
            success = true;
          } catch (error) {
            console.error("Error processing sync item:", error);
            this.syncStatus.errors++;
            retries++;

            if (retries < this.maxRetries) {
              console.log(
                `Retrying sync operation (${retries}/${this.maxRetries})...`,
              );
              await new Promise((resolve) =>
                setTimeout(resolve, this.retryDelay),
              );
            }
          }
        }

        if (!success) {
          console.error(
            `Failed to process sync item after ${this.maxRetries} attempts:`,
            item,
          );
        }
      }
    }

    this.isProcessingQueue = false;
  }

  private async processSyncItem(item: {
    table: string;
    action: string;
    data: Record<string, unknown>;
  }): Promise<void> {
    // Process the sync item - this could involve API calls, cache updates, etc.
    console.log(`Processing sync: ${item.action} on ${item.table}`);
    // Implementation would depend on specific sync requirements
  }

  clearAll(): void {
    try {
      // Unsubscribe from all channels
      this.subscriptions.forEach((subscription) => {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error("Error unsubscribing:", error);
        }
      });

      this.subscriptions.clear();

      if (Array.isArray(this.syncQueue)) {
        this.syncQueue.length = 0;
      } else {
        this.syncQueue = [];
      }

      this.syncStatus = {
        isActive: false,
        listeners: 0,
        lastSync: null,
        errors: 0,
      };

      console.log("CoreDataSyncService: Cleared all subscriptions and data");
    } catch (error) {
      console.error("Error clearing data sync service:", error);
    }
  }
}

// Admin action tracking service
class AdminActionTracker {
  private actions: AdminAction[] = [];
  private errors: ErrorLog[] = [];
  private maxActions = 1000;
  private maxErrors = 500;

  private ensureArraysInitialized(): void {
    if (!Array.isArray(this.actions)) {
      this.actions = [];
      console.warn(
        "AdminActionTracker: actions array was not initialized, creating new array",
      );
    }
    if (!Array.isArray(this.errors)) {
      this.errors = [];
      console.warn(
        "AdminActionTracker: errors array was not initialized, creating new array",
      );
    }
  }

  logAction(
    action: string,
    table: string,
    data?: Record<string, unknown>,
    userId?: string,
    details?: string,
  ): void {
    try {
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

      if (!Array.isArray(this.actions)) {
        this.actions = [];
      }
      this.actions.unshift(actionLog);

      // Keep only the most recent actions
      if (this.actions.length > this.maxActions) {
        this.actions = this.actions.slice(0, this.maxActions);
      }

      console.log(`Admin action logged: ${action} on ${table}`);
    } catch (error) {
      console.error("Error logging admin action:", error);
    }
  }

  logError(
    message: string,
    error: Error,
    context?: string,
    userId?: string,
  ): void {
    try {
      this.ensureArraysInitialized();

      const errorLog: ErrorLog = {
        id: crypto.randomUUID(),
        message,
        error,
        context,
        timestamp: new Date().toISOString(),
        userId,
      };

      if (!Array.isArray(this.errors)) {
        this.errors = [];
      }
      this.errors.unshift(errorLog);

      // Keep only the most recent errors
      if (this.errors.length > this.maxErrors) {
        this.errors = this.errors.slice(0, this.maxErrors);
      }

      console.error(`Admin error logged: ${message}`, error);
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }
  }

  getRecentActions(limit = 10): AdminAction[] {
    this.ensureArraysInitialized();
    const safeActions = Array.isArray(this.actions) ? this.actions : [];
    const validLimit = Math.max(0, Math.min(limit, safeActions.length));
    return safeActions.slice(0, validLimit);
  }

  getRecentErrors(limit = 10): ErrorLog[] {
    this.ensureArraysInitialized();
    const safeErrors = Array.isArray(this.errors) ? this.errors : [];
    const validLimit = Math.max(0, Math.min(limit, safeErrors.length));
    return safeErrors.slice(0, validLimit);
  }

  getActionsByTable(table: string, limit = 10): AdminAction[] {
    this.ensureArraysInitialized();
    const safeActions = Array.isArray(this.actions) ? this.actions : [];
    const filteredActions = safeActions.filter(
      (action) => action && action.table === table,
    );
    return filteredActions.slice(0, Math.min(limit, filteredActions.length));
  }

  getActionsByUser(userId: string, limit = 10): AdminAction[] {
    this.ensureArraysInitialized();
    const safeActions = Array.isArray(this.actions) ? this.actions : [];
    const filteredActions = safeActions.filter(
      (action) => action && action.userId === userId,
    );
    return filteredActions.slice(0, Math.min(limit, filteredActions.length));
  }

  getStats() {
    this.ensureArraysInitialized();
    const actionsByTable: Record<string, number> = {};
    const errorsByContext: Record<string, number> = {};

    const safeActions = Array.isArray(this.actions) ? this.actions : [];
    const safeErrors = Array.isArray(this.errors) ? this.errors : [];

    safeActions.forEach((action) => {
      if (action && action.table) {
        actionsByTable[action.table] = (actionsByTable[action.table] || 0) + 1;
      }
    });

    safeErrors.forEach((error) => {
      if (error) {
        const context = error.context || "unknown";
        errorsByContext[context] = (errorsByContext[context] || 0) + 1;
      }
    });

    return {
      totalActions: safeActions.length,
      totalErrors: safeErrors.length,
      actionsByTable,
      errorsByContext,
    };
  }

  exportData() {
    this.ensureArraysInitialized();
    const safeActions = Array.isArray(this.actions) ? this.actions : [];
    const safeErrors = Array.isArray(this.errors) ? this.errors : [];
    return {
      actions: [...safeActions],
      errors: [...safeErrors],
      exportedAt: new Date().toISOString(),
    };
  }

  clear(): void {
    try {
      this.actions = [];
      this.errors = [];
      console.log("AdminActionTracker: Cleared all actions and errors");
    } catch (error) {
      console.error("Error clearing admin action tracker:", error);
    }
  }
}

// Main DataSyncService class
class DataSyncService {
  private coreService: CoreDataSyncService;
  private actionTracker: AdminActionTracker;
  private isInitialized = false;

  constructor() {
    this.coreService = new CoreDataSyncService();
    this.actionTracker = new AdminActionTracker();
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

  addSubscription(table: string, callback: () => void): void {
    if (!table || typeof table !== "string") {
      console.error(
        "Invalid table name provided to DataSyncService.addSubscription",
      );
      return;
    }
    this.coreService.addSubscription(table, callback);
  }

  removeSubscription(table: string): void {
    if (!table || typeof table !== "string") {
      console.error(
        "Invalid table name provided to DataSyncService.removeSubscription",
      );
      return;
    }
    this.coreService.removeSubscription(table);
  }

  queueSync(
    table: string,
    action: string,
    data: Record<string, unknown>,
  ): void {
    if (!table || !action) {
      console.error("Invalid parameters provided to DataSyncService.queueSync");
      return;
    }
    this.coreService.queueSync(table, action, data || {});
  }

  // Admin action methods
  notifyAdminAction(
    action: string,
    table: string,
    data?: Record<string, unknown>,
    userId?: string,
    details?: string,
  ): void {
    try {
      this.actionTracker.logAction(action, table, data, userId, details);
      this.logActionToDb(action, table, data, userId, details).catch(
        (error) => {
          console.error("Failed to log admin action to DB:", error);
        },
      );
    } catch (error) {
      console.error("Error in notifyAdminAction:", error);
    }
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

  getAdminStats() {
    return this.actionTracker.getStats();
  }

  // Utility methods
  exportLogs() {
    return this.actionTracker.exportData();
  }

  clearLogs(): void {
    this.actionTracker.clear();
  }

  cleanup(): void {
    try {
      this.coreService.clearAll();
      this.actionTracker.clear();
      this.isInitialized = false;
      console.log("DataSyncService: Cleaned up successfully");
    } catch (error) {
      console.error("Error during DataSyncService cleanup:", error);
    }
  }

  // Admin-specific methods
  async callAdminFunction(
    operation: string,
    data?: Record<string, unknown>,
  ): Promise<unknown> {
    try {
      if (!operation) {
        throw new Error("Operation name is required");
      }

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
      this.logError(
        `Admin function call failed: ${operation}`,
        error as Error,
        "admin_function",
      );
      throw error;
    }
  }

  async getDashboardStats(): Promise<unknown> {
    return this.callAdminFunction("getDashboardStats");
  }

  async getRecentActivity(limit = 6): Promise<unknown> {
    return this.callAdminFunction("getRecentActivity", { limit });
  }

  async bulkDelete(table: string, ids: string[]): Promise<unknown> {
    if (!table || !Array.isArray(ids) || ids.length === 0) {
      throw new Error("Invalid parameters for bulkDelete");
    }
    return this.callAdminFunction("bulkDelete", { table, ids });
  }

  async bulkUpdate(
    table: string,
    updates: Record<string, unknown>[],
  ): Promise<unknown> {
    if (!table || !Array.isArray(updates) || updates.length === 0) {
      throw new Error("Invalid parameters for bulkUpdate");
    }
    return this.callAdminFunction("bulkUpdate", { table, updates });
  }

  async exportData(
    table: string,
    filters?: Record<string, unknown>,
  ): Promise<unknown> {
    if (!table) {
      throw new Error("Table name is required for exportData");
    }
    return this.callAdminFunction("exportData", { table, filters });
  }

  // Email Marketing specific methods
  async sendEmailCampaign(
    campaignId: string,
    recipientIds: string[],
  ): Promise<unknown> {
    if (
      !campaignId ||
      !Array.isArray(recipientIds) ||
      recipientIds.length === 0
    ) {
      throw new Error("Invalid parameters for sendEmailCampaign");
    }
    return this.callAdminFunction("sendEmailCampaign", {
      campaignId,
      recipientIds,
    });
  }

  async getEmailCampaignStats(campaignId: string): Promise<unknown> {
    if (!campaignId) {
      throw new Error("Campaign ID is required");
    }
    return this.callAdminFunction("getEmailCampaignStats", { campaignId });
  }

  async syncNewsletterSubscribers(): Promise<unknown> {
    return this.callAdminFunction("syncNewsletterSubscribers");
  }

  async logActionToDb(
    action: string,
    table: string,
    data?: Record<string, unknown>,
    userId?: string,
    details?: string,
  ) {
    try {
      const { error } = await supabase.from("admin_audit_log").insert({
        action,
        table_name: table,
        data,
        user_id: userId,
        details,
      });

      if (error) {
        console.error("Error logging to admin_audit_log:", error);
      }
    } catch (error) {
      console.error("Failed to log admin action to DB:", error);
    }
  }

  async getRecentAdminActionsFromDb(limit = 50) {
    try {
      const { data, error } = await supabase
        .from("admin_audit_log")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Failed to fetch audit log from DB:", error);
        return [];
      }

      return data;
    } catch (error) {
      console.error("Error retrieving admin actions from DB:", error);
      return [];
    }
  }
}

// Export singleton instance
export const dataSyncService = new DataSyncService();

dataSyncService.initialize();

export type { AdminAction, ErrorLog, DataSyncStatus };
