import React, { createContext, useContext, useState, ReactNode } from "react";

interface GitStatus {
  branch: string;
  hasChanges: boolean;
  changedFiles: string[];
}

interface DataContextType {
  refreshAllData: () => Promise<void>;
  isRefreshing: boolean;
  lastRefresh: Date | null;
  connectionHealth: boolean;
  forceSync: () => Promise<void>;
  syncStatus: Record<string, string>;
  gitStatus: GitStatus;
  autoCommitAndPush: (message: string) => Promise<boolean>;
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
  const [gitStatus, setGitStatus] = useState<GitStatus>({
    branch: "main",
    hasChanges: false,
    changedFiles: [],
  });

  const refreshAllData = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
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

      console.log("Data refresh completed");
    } catch (error) {
      console.error("Error refreshing data:", error);
      setConnectionHealth(false);

      // Set error status for sync
      setSyncStatus({
        events: "CHANNEL_ERROR",
        members: "CHANNEL_ERROR",
        sermons: "CHANNEL_ERROR",
        gallery: "CHANNEL_ERROR",
        testimonials: "CHANNEL_ERROR",
        prayer_requests: "CHANNEL_ERROR",
        donations: "CHANNEL_ERROR",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const forceSync = async () => {
    console.log("Force syncing data...");
    await refreshAllData();
  };

  const autoCommitAndPush = async (message: string): Promise<boolean> => {
    try {
      console.log("Auto commit and push:", message);
      // Simulate git operations
      setGitStatus((prev) => ({
        ...prev,
        hasChanges: false,
        changedFiles: [],
      }));
      return true;
    } catch (error) {
      console.error("Failed to commit and push:", error);
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        refreshAllData,
        isRefreshing,
        lastRefresh,
        connectionHealth,
        forceSync,
        syncStatus,
        gitStatus,
        autoCommitAndPush,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
