import { useEffect, useRef, useCallback } from "react";
import { dataSyncService } from "@/services/DataSyncService";
import { useDataContext } from "@/contexts/DataContext";

/**
 * Enhanced custom hook to handle automatic data refresh with real-time sync
 * @param refreshFunction - Function to call for refreshing data
 * @param intervalMs - Refresh interval in milliseconds (default: 5 minutes)
 * @param dependencies - Dependencies array to restart the interval
 * @param tableName - Optional table name for specific subscriptions
 */
export const useDataRefresh = (
  refreshFunction: () => void | Promise<void>,
  intervalMs: number = 5 * 60 * 1000, // 5 minutes default
  dependencies: any[] = [],
  tableName?: string,
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);
  const lastRefreshRef = useRef<Date | null>(null);
  const refreshFunctionRef = useRef(refreshFunction);
  const { connectionHealth, forceSync } = useDataContext();

  // Update the ref when refreshFunction changes
  useEffect(() => {
    refreshFunctionRef.current = refreshFunction;
  }, [refreshFunction]);

  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Enhanced refresh function with error handling and retry logic
    const enhancedRefreshFunction = async () => {
      if (!isActiveRef.current) return;

      const maxRetries = 3;
      let retryCount = 0;

      while (retryCount < maxRetries) {
        try {
          await refreshFunctionRef.current();
          lastRefreshRef.current = new Date();
          console.log(
            `Data refresh successful for ${tableName || "component"}`,
          );
          break;
        } catch (error) {
          retryCount++;
          console.error(
            `Error during data refresh (attempt ${retryCount}/${maxRetries}):`,
            error,
          );

          if (retryCount < maxRetries) {
            // Wait before retrying (exponential backoff)
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)),
            );
          } else {
            console.error(
              `Max retry attempts reached for ${tableName || "component"} refresh`,
            );
          }
        }
      }
    };

    // Set up new interval with health check
    intervalRef.current = setInterval(async () => {
      if (isActiveRef.current && connectionHealth) {
        await enhancedRefreshFunction();
      } else if (!connectionHealth) {
        console.warn("Skipping refresh due to connection health issues");
      }
    }, intervalMs);

    // Set up real-time event listeners
    const handleDataChange = () => {
      console.log(
        `Real-time data change detected for ${tableName || "component"}`,
      );
      enhancedRefreshFunction();
    };

    const handleForceRefresh = () => {
      console.log(`Force refresh triggered for ${tableName || "component"}`);
      enhancedRefreshFunction();
    };

    const handleAdminAction = () => {
      console.log(
        `Admin action detected, refreshing ${tableName || "component"}`,
      );
      enhancedRefreshFunction();
    };

    // Add event listeners
    if (tableName) {
      dataSyncService.addEventListener(`${tableName}Changed`, handleDataChange);
      window.addEventListener(`${tableName}Changed`, handleDataChange);
    }

    dataSyncService.addEventListener("dataChanged", handleDataChange);
    dataSyncService.addEventListener("forceRefresh", handleForceRefresh);
    dataSyncService.addEventListener("adminActionCompleted", handleAdminAction);

    window.addEventListener("dataChanged", handleDataChange);
    window.addEventListener("forceRefresh", handleForceRefresh);
    window.addEventListener("adminActionCompleted", handleAdminAction);
    window.addEventListener("dataRefresh", handleDataChange);

    // Initial refresh
    enhancedRefreshFunction();

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Remove event listeners
      if (tableName) {
        dataSyncService.removeEventListener(
          `${tableName}Changed`,
          handleDataChange,
        );
        window.removeEventListener(`${tableName}Changed`, handleDataChange);
      }

      dataSyncService.removeEventListener("dataChanged", handleDataChange);
      dataSyncService.removeEventListener("forceRefresh", handleForceRefresh);
      dataSyncService.removeEventListener(
        "adminActionCompleted",
        handleAdminAction,
      );

      window.removeEventListener("dataChanged", handleDataChange);
      window.removeEventListener("forceRefresh", handleForceRefresh);
      window.removeEventListener("adminActionCompleted", handleAdminAction);
      window.removeEventListener("dataRefresh", handleDataChange);
    };
  }, [tableName, connectionHealth, intervalMs]);

  // Pause/resume functions
  const pauseRefresh = useCallback(() => {
    isActiveRef.current = false;
    console.log(`Paused refresh for ${tableName || "component"}`);
  }, [tableName]);

  const resumeRefresh = useCallback(() => {
    isActiveRef.current = true;
    console.log(`Resumed refresh for ${tableName || "component"}`);
  }, [tableName]);

  // Manual refresh function
  const manualRefresh = useCallback(async () => {
    console.log(`Manual refresh triggered for ${tableName || "component"}`);
    if (refreshFunctionRef.current) {
      await refreshFunctionRef.current();
    }
  }, [tableName]);

  // Force sync function
  const forceSyncData = useCallback(async () => {
    console.log(`Force sync triggered for ${tableName || "component"}`);
    if (forceSync) {
      await forceSync();
    }
    if (refreshFunctionRef.current) {
      await refreshFunctionRef.current();
    }
  }, [forceSync, tableName]);

  return {
    pauseRefresh,
    resumeRefresh,
    manualRefresh,
    forceSyncData,
    lastRefresh: lastRefreshRef.current,
    isActive: isActiveRef.current,
  };
};
