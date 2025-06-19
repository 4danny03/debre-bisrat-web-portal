import { useEffect, createContext, useContext, useState, ReactNode } from "react";
import { supabase } from "../integrations/supabase/client";

interface DataContextType {
  connectionHealth: boolean;
  syncStatus: Record<string, string>;
  gitStatus: {
    branch: string;
    hasChanges: boolean;
    changedFiles: string[];
  };
  lastRefresh: Date | null;
  isRefreshing: boolean;
  forceSync: () => Promise<void>;
  autoCommitAndPush: (message: string) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [connectionHealth, setConnectionHealth] = useState(true);
  const [syncStatus, setSyncStatus] = useState<Record<string, string>>({
    events: "SUBSCRIBED",
    gallery: "SUBSCRIBED",
    sermons: "SUBSCRIBED",
    members: "SUBSCRIBED",
    testimonials: "SUBSCRIBED",
    prayer_requests: "SUBSCRIBED",
    donations: "SUBSCRIBED",
  });
  const [gitStatus, setGitStatus] = useState({
    branch: "main",
    hasChanges: false,
    changedFiles: [],
  });
  const [lastRefresh, setLastRefresh] = useState<Date | null>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshAllData = async () => {
    if (isRefreshing) {
      console.log("Refresh already in progress, skipping...");
      return;
    }

    setIsRefreshing(true);
    try {
      console.log("Starting data refresh...");

      // Test database connection first
      const { error: connectionError } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);

      if (connectionError) {
        throw new Error(
          `Database connection failed: ${connectionError.message}`,
        );
      }

      setConnectionHealth(true);
      setLastRefresh(new Date());

      // Update sync status for common tables
      setSyncStatus({
        events: "SUBSCRIBED",
        members: "SUBSCRIBED",
        sermons: "SUBSCRIBED",
        gallery: "SUBSCRIBED",
        testimonials: "SUBSCRIBED",
        prayer_requests: "SUBSCRIBED",
        donations: "SUBSCRIBED",
      });

      console.log("Data refresh completed successfully");
    } catch (error) {
      console.error("Force sync failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const forceSync = async () => {
    console.log("Force syncing data...");
    // Debounce force sync to prevent infinite loops
    if (isRefreshing) {
      console.log("Sync already in progress, skipping...");
      return;
    }
    await refreshAllData();
  };

  const autoCommitAndPush = async (message: string): Promise<boolean> => {
    try {
      console.log("Auto commit and push:", message);
      // Simulate git operations
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setGitStatus((prev) => ({
        ...prev,
        hasChanges: false,
        changedFiles: [],
      }));
      return true;
    } catch (error) {
      console.error("Auto commit and push failed:", error);
      return false;
    }
  };

  useEffect(() => {
    // Simulate periodic health checks
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const value: DataContextType = {
    connectionHealth,
    syncStatus,
    gitStatus,
    lastRefresh,
    isRefreshing,
    forceSync,
    autoCommitAndPush,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useDataContext() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
}
