import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/integrations/supabase/api";
import { supabase } from "@/integrations/supabase/client";
import { dataSyncService } from "@/services/DataSyncService";
import { gitSyncService } from "@/services/GitSyncService";

interface DataContextType {
  refreshAllData: () => Promise<void>;
  isRefreshing: boolean;
  lastRefresh: Date | null;
  connectionHealth: boolean;
  syncStatus: Record<string, string>;
  gitStatus: {
    hasChanges: boolean;
    changedFiles: string[];
    branch: string;
    lastCommit: string;
  };
  forceSync: () => Promise<void>;
  autoCommitAndPush: (message?: string) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [connectionHealth, setConnectionHealth] = useState(true);
  const [syncStatus, setSyncStatus] = useState<Record<string, string>>({});
  const [gitStatus, setGitStatus] = useState({
    hasChanges: false,
    changedFiles: [],
    branch: "main",
    lastCommit: "unknown",
  });

  const refreshAllData = async () => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes

    setIsRefreshing(true);
    try {
      // Trigger a custom event that components can listen to
      window.dispatchEvent(new CustomEvent("dataRefresh"));
      dataSyncService.forceRefresh();
      setLastRefresh(new Date());

      // Check connection health
      const health = await dataSyncService.checkHealth();
      setConnectionHealth(health);

      // Update sync status
      const status = dataSyncService.getSubscriptionStatus();
      setSyncStatus(status);

      console.log("Data refresh completed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      setConnectionHealth(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  const forceSync = async () => {
    console.log("Force syncing all data...");
    await refreshAllData();

    // Additional force sync logic
    dataSyncService.forceRefresh();

    // Emit force refresh events
    window.dispatchEvent(new CustomEvent("forceRefresh"));
    window.dispatchEvent(new CustomEvent("eventsChanged"));
    window.dispatchEvent(new CustomEvent("galleryChanged"));
    window.dispatchEvent(new CustomEvent("sermonsChanged"));
    window.dispatchEvent(new CustomEvent("testimonialsChanged"));
    window.dispatchEvent(new CustomEvent("membersChanged"));
    window.dispatchEvent(new CustomEvent("donationsChanged"));
  };

  const autoCommitAndPush = async (message?: string): Promise<boolean> => {
    try {
      const commitMessage =
        message || `Auto-sync: Admin changes ${new Date().toISOString()}`;
      const success = await gitSyncService.autoSync(commitMessage);

      if (success) {
        console.log("Successfully committed and pushed changes");
        // Update git status after successful sync
        const newGitStatus = await gitSyncService.getGitStatus();
        setGitStatus(newGitStatus);
      }

      return success;
    } catch (error) {
      console.error("Failed to auto-commit and push:", error);
      return false;
    }
  };

  // Set up enhanced real-time subscriptions and monitoring
  useEffect(() => {
    console.log("Setting up enhanced data synchronization...");

    // Set up periodic health checks
    const healthCheckInterval = setInterval(async () => {
      const health = await dataSyncService.checkHealth();
      setConnectionHealth(health);

      const status = dataSyncService.getSubscriptionStatus();
      setSyncStatus(status);

      // Update git status
      const newGitStatus = await gitSyncService.getGitStatus();
      setGitStatus(newGitStatus);
    }, 30000); // Check every 30 seconds

    // Set up data sync event listeners
    const handleDataChange = () => {
      console.log("Data change detected, refreshing...");
      refreshAllData();
    };

    const handleAdminAction = () => {
      console.log("Admin action detected, forcing refresh...");
      forceSync();
    };

    const handleForceRefresh = () => {
      console.log("Force refresh requested");
      refreshAllData();
    };

    // Add event listeners
    dataSyncService.addEventListener("dataChanged", handleDataChange);
    dataSyncService.addEventListener("adminActionCompleted", handleAdminAction);
    dataSyncService.addEventListener("forceRefresh", handleForceRefresh);

    // Browser event listeners for backward compatibility
    window.addEventListener("dataChanged", handleDataChange);
    window.addEventListener("adminActionCompleted", handleAdminAction);
    window.addEventListener("forceRefresh", handleForceRefresh);

    // Setup auto-git sync (every 30 minutes)
    const cleanupAutoSync = gitSyncService.setupAutoSync(30);

    // Initial health check
    refreshAllData();

    // Cleanup function
    return () => {
      clearInterval(healthCheckInterval);

      // Remove event listeners
      dataSyncService.removeEventListener("dataChanged", handleDataChange);
      dataSyncService.removeEventListener(
        "adminActionCompleted",
        handleAdminAction,
      );
      dataSyncService.removeEventListener("forceRefresh", handleForceRefresh);

      window.removeEventListener("dataChanged", handleDataChange);
      window.removeEventListener("adminActionCompleted", handleAdminAction);
      window.removeEventListener("forceRefresh", handleForceRefresh);

      // Cleanup auto-sync
      cleanupAutoSync();

      console.log("Data context cleanup completed");
    };
  }, []);

  return (
    <DataContext.Provider
      value={{
        refreshAllData,
        isRefreshing,
        lastRefresh,
        connectionHealth,
        syncStatus,
        gitStatus,
        forceSync,
        autoCommitAndPush,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
