import { useEffect, useRef, useCallback } from "react";

/**
 * Simplified data refresh hook without complex event listeners
 * @param refreshFunction - Function to call for refreshing data
 * @param intervalMs - Refresh interval in milliseconds (default: 5 minutes)
 * @param dependencies - Dependencies array to restart the interval
 * @param tableName - Optional table name for logging
 */
export const useDataRefresh = (
  refreshFunction: () => void | Promise<void>,
  intervalMs: number = 5 * 60 * 1000,
  dependencies: any[] = [],
  tableName?: string,
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);
  const lastRefreshRef = useRef<Date | null>(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Simple refresh function with debouncing
    const safeRefreshFunction = async () => {
      if (!isActiveRef.current || isRefreshingRef.current) return;

      isRefreshingRef.current = true;
      try {
        await refreshFunction();
        lastRefreshRef.current = new Date();
        console.log(`Data refresh successful for ${tableName || "component"}`);
      } catch (error) {
        console.error(
          `Error during data refresh for ${tableName || "component"}:`,
          error,
        );
      } finally {
        isRefreshingRef.current = false;
      }
    };

    // Set up simple interval - no event listeners
    intervalRef.current = setInterval(() => {
      if (isActiveRef.current) {
        safeRefreshFunction();
      }
    }, intervalMs);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tableName, intervalMs, ...dependencies]);

  // Manual refresh function
  const manualRefresh = useCallback(async () => {
    if (!isRefreshingRef.current) {
      console.log(`Manual refresh triggered for ${tableName || "component"}`);
      isRefreshingRef.current = true;
      try {
        await refreshFunction();
        lastRefreshRef.current = new Date();
      } catch (error) {
        console.error(
          `Manual refresh error for ${tableName || "component"}:`,
          error,
        );
      } finally {
        isRefreshingRef.current = false;
      }
    }
  }, [tableName]);

  const forceSyncData = useCallback(async () => {
    console.log(`Force sync triggered for ${tableName || "component"}`);
    await manualRefresh();
  }, [manualRefresh, tableName]);

  return {
    manualRefresh,
    forceSyncData,
    lastRefresh: lastRefreshRef.current,
    isActive: isActiveRef.current,
  };
};
