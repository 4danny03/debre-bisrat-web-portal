
import React, { useState, useEffect } from "react";
import { useDataContext } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Users,
  Calendar,
  BookOpen,
  Heart,
  DollarSign,
  Image,
  RefreshCw,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import AdminSyncStatus from "@/components/AdminSyncStatus";

export default function Dashboard() {
  const {
    events,
    gallery,
    sermons,
    testimonials,
    prayerRequests,
    donations,
    members,
    loading,
    error,
    lastRefresh,
    isRefreshing,
    forceSync,
  } = useDataContext();

  const [stats, setStats] = useState({
    totalMembers: 0,
    upcomingEvents: 0,
    totalSermons: 0,
    pendingTestimonials: 0,
    totalDonations: 0,
    galleryImages: 0,
    prayerRequests: 0,
    recentActivity: 0,
  });

  useEffect(() => {
    // Only calculate stats when data is available and not loading
    if (!loading && !isRefreshing) {
      const today = new Date();
      const upcomingEvents = events.filter(
        (event) => new Date(event.event_date) >= today,
      ).length;

      const pendingTestimonials = testimonials.filter(
        (t) => !t.is_approved,
      ).length;

      const totalDonationsAmount = donations.reduce(
        (sum, donation) => sum + donation.amount,
        0,
      );

      const unansweredPrayers = prayerRequests.filter(
        (p) => !p.is_answered,
      ).length;

      setStats({
        totalMembers: members.length,
        upcomingEvents,
        totalSermons: sermons.length,
        pendingTestimonials,
        totalDonations: totalDonationsAmount,
        galleryImages: gallery.length,
        prayerRequests: unansweredPrayers,
        recentActivity: events.length + testimonials.length + donations.length,
      });
    }
  }, [events, gallery, sermons, testimonials, prayerRequests, donations, members, loading, isRefreshing]);

  const handleForceRefresh = async () => {
    if (isRefreshing) return; // Prevent multiple refresh attempts
    
    try {
      await forceSync();
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error during force refresh:", error);
      toast.error("Failed to refresh data");
    }
  };

  if (loading && !lastRefresh) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-church-burgundy" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error && !lastRefresh) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleForceRefresh} variant="outline" disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-church-burgundy">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening with your church.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {lastRefresh && (
            <p className="text-sm text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
          <Button onClick={handleForceRefresh} disabled={isRefreshing}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Active church members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              Events this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sermons</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSermons}</div>
            <p className="text-xs text-muted-foreground">
              Available sermons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Donations
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalDonations.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              All-time donations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Testimonials
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.pendingTestimonials}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gallery Images</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.galleryImages}</div>
            <p className="text-xs text-muted-foreground">
              Total images
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Prayer Requests
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.prayerRequests}</div>
            <p className="text-xs text-muted-foreground">
              Unanswered prayers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                <span className="text-sm">
                  {stats.recentActivity} total records in database
                </span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                <span className="text-sm">
                  System running smoothly
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <AdminSyncStatus />
      </div>
    </div>
  );
}
