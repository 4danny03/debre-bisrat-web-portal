import { useEffect, useRef, useCallback, useState } from "react";
import { dataSyncService } from "@/services/DataSyncService";
import { useDataContext } from "@/contexts/DataContext";

/**
 * Simplified data refresh hook without complex event listeners
 * @param refreshFunction - Function to call for refreshing data
 * @param intervalMs - Refresh interval in milliseconds (default: 5 minutes)
 * @param dependencies - Dependencies array to restart the interval
 * @param tableName - Optional table name for logging
 */
export const useDataRefresh = (
  refreshFunction: () => void | Promise<void>,
  intervalMs: number = 30 * 60 * 1000, // Increased to 30 minutes to reduce frequency
  dependencies: unknown[] = [],
  tableName?: string,
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const isRefreshingRef = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshFunctionRef = useRef(refreshFunction);
  const { connectionHealth, forceSync } = useDataContext();

  useEffect(() => {
    refreshFunctionRef.current = refreshFunction;
  }, [refreshFunction]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Simple refresh function with debouncing
    const enhancedRefreshFunction = async () => {
      if (!isActiveRef.current || isRefreshingRef.current) {
        console.log(
          `Skipping refresh for ${tableName || "component"} - already refreshing or inactive`,
        );
        return;
      }

      isRefreshingRef.current = true;
      const maxRetries = 3;
      let retryCount = 0;

      while (retryCount < maxRetries) {
        try {
          await refreshFunctionRef.current();
          const now = new Date();
          setLastRefresh(now);
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

      isRefreshingRef.current = false;
      setIsRefreshing(false);
    };

    intervalRef.current = setInterval(async () => {
      if (isActiveRef.current && connectionHealth) {
        await enhancedRefreshFunction();
      } else if (!connectionHealth) {
        console.warn("Skipping refresh due to connection health issues");
      }
    }, intervalMs);

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

    if (tableName) {
      dataSyncService.addSubscription(tableName, handleDataChange);
      window.addEventListener(`${tableName}Changed`, handleDataChange);
    }

    window.addEventListener("dataChanged", handleDataChange);
    window.addEventListener("forceRefresh", handleForceRefresh);
    window.addEventListener("adminActionCompleted", handleAdminAction);

    window.addEventListener("dataChanged", handleDataChange);
    window.addEventListener("forceRefresh", handleForceRefresh);
    window.addEventListener("adminActionCompleted", handleAdminAction);
    window.addEventListener("dataRefresh", handleDataChange);

    enhancedRefreshFunction();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (tableName) {
        dataSyncService.removeSubscription(tableName);
        window.removeEventListener(`${tableName}Changed`, handleDataChange);
      }

      window.removeEventListener("dataChanged", handleDataChange);
      window.removeEventListener("forceRefresh", handleForceRefresh);
      window.removeEventListener("adminActionCompleted", handleAdminAction);
      window.removeEventListener("dataRefresh", handleDataChange);
    };
  }, [tableName, connectionHealth, intervalMs, ...dependencies]);

  const pauseRefresh = useCallback(() => {
    isActiveRef.current = false;
    console.log(`Paused refresh for ${tableName || "component"}`);
  }, [tableName]);

  const resumeRefresh = useCallback(() => {
    isActiveRef.current = true;
    console.log(`Resumed refresh for ${tableName || "component"}`);
  }, [tableName]);

  const manualRefresh = useCallback(async () => {
    if (!isRefreshingRef.current) {
      console.log(`Manual refresh triggered for ${tableName || "component"}`);
      isRefreshingRef.current = true;
      setIsRefreshing(true);
      try {
        await refreshFunction();
        const now = new Date();
        setLastRefresh(now);
      } catch (error) {
        console.error(
          `Manual refresh error for ${tableName || "component"}:`,
          error,
        );
      } finally {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
      }
    }
  }, [refreshFunction, tableName]);

  const forceSyncData = useCallback(async () => {
    console.log(`Force sync triggered for ${tableName || "component"}`);
    await manualRefresh();
  }, [manualRefresh, tableName]);

  return {
    manualRefresh,
    forceSyncData,
    lastRefresh,
    isActive: isActiveRef.current,
    isRefreshing,
  };
};
