
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    events: 'SUBSCRIBED',
    gallery: 'SUBSCRIBED',
    sermons: 'SUBSCRIBED',
    members: 'SUBSCRIBED',
    testimonials: 'SUBSCRIBED',
    prayer_requests: 'SUBSCRIBED',
    donations: 'SUBSCRIBED',
  });
  const [gitStatus, setGitStatus] = useState({
    branch: 'main',
    hasChanges: false,
    changedFiles: [],
  });
  const [lastRefresh, setLastRefresh] = useState<Date | null>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const forceSync = async () => {
    setIsRefreshing(true);
    try {
      // Simulate sync operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Force sync failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const autoCommitAndPush = async (message: string): Promise<boolean> => {
    try {
      console.log('Auto commit and push:', message);
      // Simulate git operations
      await new Promise(resolve => setTimeout(resolve, 2000));
      setGitStatus(prev => ({
        ...prev,
        hasChanges: false,
        changedFiles: [],
      }));
      return true;
    } catch (error) {
      console.error('Auto commit and push failed:', error);
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

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
}
