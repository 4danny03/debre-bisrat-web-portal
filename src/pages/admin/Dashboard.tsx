
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
import AuditLog from "@/components/AuditLog";
import ErrorDiagnostics from "@/components/ErrorDiagnostics";
import { useDataContext } from "@/contexts/DataContext";
import { dataSyncService } from "@/services/DataSyncService";

interface DashboardStats {
  totalEvents: number;
  totalMembers: number;
  totalDonations: number;
  totalTestimonials: number;
  totalPrayerRequests: number;
  totalSermons: number;
  recentDonationAmount: number;
}

interface RecentActivity {
  id: string;
  type:
    | "event"
    | "member"
    | "donation"
    | "testimonial"
    | "prayer_request"
    | "sermon";
  title: string;
  description: string;
  created_at: string;
}

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
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load statistics from all tables with error handling for each
      const results = await Promise.allSettled([
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("members").select("*", { count: "exact", head: true }),
        supabase
          .from("donations")
          .select("amount, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("testimonials")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("prayer_requests")
          .select("*", { count: "exact", head: true }),
        supabase.from("sermons").select("*", { count: "exact", head: true }),
      ]);

      // Extract results with fallbacks
      const [
        eventsRes,
        membersRes,
        donationsRes,
        testimonialsRes,
        prayerRequestsRes,
        sermonsRes,
      ] = results.map((result, index) => {
        if (result.status === "rejected") {
          console.error(
            `Dashboard data load failed for query ${index}:`,
            result.reason,
          );
          return { data: null, count: 0, error: result.reason };
        }
        return result.value;
      });

      // Calculate recent donation amount (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentDonations =
        donationsRes?.data?.filter(
          (d) => d?.created_at && new Date(d.created_at) >= thirtyDaysAgo,
        ) || [];

      const recentDonationAmount = recentDonations.reduce(
        (sum, d) => sum + (d?.amount || 0),
        0,
      );

      setStats({
        totalEvents: eventsRes?.count || 0,
        totalMembers: membersRes?.count || 0,
        totalDonations: donationsRes?.data?.length || 0,
        totalTestimonials: testimonialsRes?.count || 0,
        totalPrayerRequests: prayerRequestsRes?.count || 0,
        totalSermons: sermonsRes?.count || 0,
        recentDonationAmount,
      });

      // Load recent activity
      await loadRecentActivity();
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const activities: RecentActivity[] = [];

      // Get recent events with error handling
      try {
        const { data: events, error: eventsError } = await supabase
          .from("events")
          .select("id, title, description, created_at")
          .order("created_at", { ascending: false })
          .limit(3);

        if (eventsError) {
          console.error("Error loading recent events:", eventsError);
        } else if (events && Array.isArray(events)) {
          events.forEach((event) => {
            if (event?.id && event?.title && event?.created_at) {
              activities.push({
                id: event.id,
                type: "event",
                title: `New Event: ${event.title}`,
                description: event.description || "No description",
                created_at: event.created_at,
              });
            }
          });
        }
      } catch (error) {
        console.error("Failed to load recent events:", error);
      }

      // Get recent members with error handling
      try {
        const { data: members, error: membersError } = await supabase
          .from("members")
          .select("id, full_name, created_at")
          .order("created_at", { ascending: false })
          .limit(3);

        if (membersError) {
          console.error("Error loading recent members:", membersError);
        } else if (members && Array.isArray(members)) {
          members.forEach((member) => {
            if (member?.id && member?.full_name && member?.created_at) {
              activities.push({
                id: member.id,
                type: "member",
                title: `New Member: ${member.full_name}`,
                description: "Joined the church community",
                created_at: member.created_at,
              });
            }
          });
        }
      } catch (error) {
        console.error("Failed to load recent members:", error);
      }

      // Sort by creation date and take the most recent 6
      activities.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setRecentActivity(activities.slice(0, 6));
    } catch (error) {
      console.error("Error loading recent activity:", error);
    }
  };

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "event":
        return <Calendar className="h-4 w-4" />;
      case "member":
        return <Users className="h-4 w-4" />;
      case "donation":
        return <DollarSign className="h-4 w-4" />;
      case "testimonial":
        return <MessageSquare className="h-4 w-4" />;
      case "prayer_request":
        return <Heart className="h-4 w-4" />;
      case "sermon":
        return <Activity className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setDialogLoading(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const { error } = await supabase.from("events").insert([
        {
          title: formData.get("title") as string,
          description: formData.get("description") as string,
          event_date: formData.get("event_date") as string,
          event_time: formData.get("event_time") as string,
          location: formData.get("location") as string,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event created successfully",
      });
      setOpenDialog(null);
      form.reset();
      loadDashboardData();

      // Notify data sync service
      dataSyncService.notifyAdminAction("create", "events", {
        title: formData.get("title"),
      });
      await forceSync();
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setDialogLoading(false);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setDialogLoading(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const { error } = await supabase.from("members").insert([
        {
          full_name: formData.get("full_name") as string,
          email: formData.get("email") as string,
          phone: formData.get("phone") as string,
          address: formData.get("address") as string,
          membership_type: formData.get("membership_type") as string,
          membership_status: "active",
          join_date: new Date().toISOString(),
          membership_date: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member added successfully",
      });
      setOpenDialog(null);
      form.reset();
      loadDashboardData();

      // Notify data sync service
      dataSyncService.notifyAdminAction("create", "members", {
        full_name: formData.get("full_name"),
      });
      await forceSync();
    } catch (error) {
      console.error("Error creating member:", error);
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive",
      });
    } finally {
      setDialogLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setDialogLoading(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const { error } = await supabase.from("profiles").insert([
        {
          email: formData.get("email") as string,
          role: "admin",
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin user created successfully",
      });
      setOpenDialog(null);
      form.reset();
      loadDashboardData();

      // Notify data sync service
      dataSyncService.notifyAdminAction("create", "profiles", {
        email: formData.get("email"),
      });
      await forceSync();
    } catch (error) {
      console.error("Error creating admin:", error);
      toast({
        title: "Error",
        description: "Failed to create admin user",
        variant: "destructive",
      });
    } finally {
      setDialogLoading(false);
    }
  };

  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setDialogLoading(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const file = formData.get("file") as File;

    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
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
      // Upload file to storage bucket
      const fileExt = file.name.split(".").pop();
      const filePath = `gallery/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath);

      // Create database entry
      const { error: dbError } = await supabase.from("gallery").insert([
        {
          title: formData.get("title") as string,
          description: formData.get("description") as string,
          image_url: publicUrl,
        },
      ]);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
      setOpenDialog(null);
      form.reset();
      loadDashboardData();

      // Notify data sync service
      dataSyncService.notifyAdminAction("create", "gallery", {
        title: formData.get("title"),
      });
      await forceSync();
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error during force refresh:", error);
      toast.error("Failed to refresh data");
    }
  };

  const handleCreateSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    setDialogLoading(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const { error } = await supabase.from("sermons").insert([
        {
          title: formData.get("title") as string,
          description: formData.get("description") as string,
          scripture_reference: formData.get("scripture_reference") as string,
          audio_url: formData.get("audio_url") as string,
          preacher: formData.get("preacher") as string,
          sermon_date: formData.get("sermon_date") as string,
          is_featured: false,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sermon added successfully",
      });
      setOpenDialog(null);
      form.reset();
      loadDashboardData();

      // Notify data sync service
      dataSyncService.notifyAdminAction("create", "sermons", {
        title: formData.get("title"),
      });
      await forceSync();
    } catch (error) {
      console.error("Error creating sermon:", error);
      toast({
        title: "Error",
        description: "Failed to add sermon",
        variant: "destructive",
      });
    } finally {
      setDialogLoading(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-church-burgundy">
          Admin Dashboard
        </h1>
        <Button
          onClick={loadDashboardData}
          variant="outline"
          className="w-full sm:w-auto"
        >
          Refresh Data
        </Button>
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

      {/* Recent Activity, Quick Actions, and Sync Status */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(
                          new Date(activity.created_at),
                          "MMM d, yyyy h:mm a",
                        )}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No recent activity
                </p>
              )}
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

              {/* Navigation Actions */}
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/admin/analytics")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/admin/bulk-operations")}
              >
                <Upload className="h-4 w-4 mr-2" />
                Bulk Operations
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/admin/testimonials")}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Review Testimonials
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/admin/prayer-requests")}
              >
                <Heart className="h-4 w-4 mr-2" />
                View Prayer Requests
              </Button>
            </div>
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

        {/* Sync Status Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Real-time sync and git status</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminSyncStatus />
            </CardContent>
          </Card>

          <ErrorDiagnostics />
        </div>
      </div>

      {/* Audit Log Section */}
      <div className="mt-8">
        <AuditLog />
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
