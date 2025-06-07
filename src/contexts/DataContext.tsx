
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

  const refreshAllData = useCallback(async () => {
    // Prevent multiple simultaneous refreshes
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
        supabase.from('events').select('*').order('date', { ascending: false }),
        supabase.from('gallery').select('*').order('created_at', { ascending: false }),
        supabase.from('sermons').select('*').order('date', { ascending: false }),
        supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
        supabase.from('prayer_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('donations').select('*').order('created_at', { ascending: false }),
        supabase.from('members').select('*').order('created_at', { ascending: false })
      ]);

      // Update state with successful results
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

  useEffect(() => {
    // Initial data load
    refreshAllData();

    // Subscribe to DataSyncService events
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
