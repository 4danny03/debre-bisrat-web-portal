
import React, { createContext, useContext, useState, ReactNode } from "react";

interface GitStatus {
  branch: string;
  hasChanges: boolean;
  changedFiles: string[];
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DataContextType {
  connectionHealth: boolean;
  forceSync: () => Promise<void>;
  syncStatus: Record<string, string>;
  gitStatus: GitStatus;
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
  const [syncStatus, setSyncStatus] = useState<Record<string, string>>({});
  const [gitStatus, setGitStatus] = useState<GitStatus>({
    branch: "main",
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

  const forceSync = async () => {
    console.log("Force syncing data...");
    await refreshAllData();
  };

  const autoCommitAndPush = async (message: string): Promise<boolean> => {
    try {
      console.log("Auto commit and push:", message);
      // Simulate git operations
      setGitStatus((prev) => ({
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
      console.error("Failed to commit and push:", error);
      console.error('Auto commit and push failed:', error);
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
