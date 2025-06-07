
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataSyncService } from '@/services/DataSyncService';

interface DataContextType {
  events: any[];
  gallery: any[];
  sermons: any[];
  testimonials: any[];
  prayerRequests: any[];
  donations: any[];
  members: any[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  forceRefresh: () => void;
  connectionHealth: boolean;
  syncStatus: { [key: string]: string };
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

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [sermons, setSermons] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionHealth, setConnectionHealth] = useState(true);
  const [syncStatus, setSyncStatus] = useState<{ [key: string]: string }>({});
  const [gitStatus, setGitStatus] = useState({
    branch: 'main',
    hasChanges: false,
    changedFiles: []
  });
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refreshAllData = useCallback(async () => {
    if (isRefreshing) {
      console.log('Refresh already in progress, skipping...');
      return;
    }

    setIsRefreshing(true);
    setLoading(true);
    setError(null);

    try {
      console.log('Starting data refresh...');
      
      const [
        eventsData,
        galleryData,
        sermonsData,
        testimonialsData,
        prayerRequestsData,
        donationsData,
        membersData
      ] = await Promise.allSettled([
        supabase.from('events').select('*').order('event_date', { ascending: false }),
        supabase.from('gallery').select('*').order('created_at', { ascending: false }),
        supabase.from('sermons').select('*').order('sermon_date', { ascending: false }),
        supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
        supabase.from('prayer_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('donations').select('*').order('created_at', { ascending: false }),
        supabase.from('members').select('*').order('created_at', { ascending: false })
      ]);

      if (eventsData.status === 'fulfilled' && eventsData.value.data) {
        setEvents(eventsData.value.data);
      }
      if (galleryData.status === 'fulfilled' && galleryData.value.data) {
        setGallery(galleryData.value.data);
      }
      if (sermonsData.status === 'fulfilled' && sermonsData.value.data) {
        setSermons(sermonsData.value.data);
      }
      if (testimonialsData.status === 'fulfilled' && testimonialsData.value.data) {
        setTestimonials(testimonialsData.value.data);
      }
      if (prayerRequestsData.status === 'fulfilled' && prayerRequestsData.value.data) {
        setPrayerRequests(prayerRequestsData.value.data);
      }
      if (donationsData.status === 'fulfilled' && donationsData.value.data) {
        setDonations(donationsData.value.data);
      }
      if (membersData.status === 'fulfilled' && membersData.value.data) {
        setMembers(membersData.value.data);
      }

      setLastRefresh(new Date());
      console.log('Data refresh completed successfully');
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while refreshing data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  const handleForceRefresh = useCallback(() => {
    console.log('Force refresh requested');
    if (!isRefreshing) {
      refreshAllData();
    }
  }, [refreshAllData, isRefreshing]);

  const forceSync = useCallback(async () => {
    console.log('Force sync requested');
    await refreshAllData();
    DataSyncService.forceRefresh();
  }, [refreshAllData]);

  const autoCommitAndPush = useCallback(async (message: string): Promise<boolean> => {
    console.log('Auto commit and push requested:', message);
    // Mock implementation for now
    return true;
  }, []);

  useEffect(() => {
    refreshAllData();

    const unsubscribe = DataSyncService.subscribe('forceRefresh', handleForceRefresh);

    return () => {
      unsubscribe();
    };
  }, [refreshAllData, handleForceRefresh]);

  const value: DataContextType = {
    events,
    gallery,
    sermons,
    testimonials,
    prayerRequests,
    donations,
    members,
    loading,
    error,
    refreshData: refreshAllData,
    forceRefresh: handleForceRefresh,
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

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

// Add the missing export
export function useDataContext() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
}
