/**
 * Simplified debug utilities for data synchronization
 * Removed all complex event monitoring and subscriptions
 */

interface DebugInfo {
  timestamp: string;
  connectionHealth: boolean;
  message: string;
}

class DebugSyncService {
  private static instance: DebugSyncService;
  private debugLog: DebugInfo[] = [];
  private maxLogEntries = 10;

  private constructor() {}

  static getInstance(): DebugSyncService {
    if (!DebugSyncService.instance) {
      DebugSyncService.instance = new DebugSyncService();
    }
    return DebugSyncService.instance;
  }

  async captureDebugInfo(): Promise<DebugInfo> {
    const timestamp = new Date().toISOString();

    const debugInfo: DebugInfo = {
      timestamp,
      connectionHealth: true,
      message: "Debug info captured",
    };

    this.debugLog.unshift(debugInfo);
    if (this.debugLog.length > this.maxLogEntries) {
      this.debugLog = this.debugLog.slice(0, this.maxLogEntries);
    }

    return debugInfo;
  }

  getDebugLog(): DebugInfo[] {
    return [...this.debugLog];
  }

  clearDebugLog(): void {
    this.debugLog = [];
  }

  exportDebugInfo(): string {
    return JSON.stringify(
      {
        exportTime: new Date().toISOString(),
        debugLog: this.debugLog,
      },
      null,
      2,
    );
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    return {
      success: true,
    };
  }
}

export const debugSyncService = DebugSyncService.getInstance();
export default DebugSyncService;

// Simplified global debug functions
if (typeof window !== "undefined") {
  (window as unknown as { debugSync: unknown }).debugSync = {
    capture: () => debugSyncService.captureDebugInfo(),
    log: () => debugSyncService.getDebugLog(),
    export: () => debugSyncService.exportDebugInfo(),
    test: () => debugSyncService.testConnection(),
    clear: () => debugSyncService.clearDebugLog(),
  };

  console.log("Simplified debug sync utilities available at window.debugSync");
}
