import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Image,
  Users,
  DollarSign,
  MessageSquare,
  Heart,
  TrendingUp,
  Activity,
  Shield,
  Upload,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import AdminSyncStatus from "@/components/AdminSyncStatus";
import AuditLog from "@/components/AuditLog";
import ErrorDiagnostics from "@/components/ErrorDiagnostics";
import { dataSyncService } from "@/services/DataSyncService";
import {
  AdminDiagnostics,
  type DiagnosticResult,
} from "@/utils/adminDiagnostics";

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
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalMembers: 0,
    totalDonations: 0,
    totalTestimonials: 0,
    totalPrayerRequests: 0,
    totalSermons: 0,
    recentDonationAmount: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  // Data context for sync operations
  // const { forceSync } = useDataContext(); // Commented to prevent infinite loops

  // Move useCallback hooks above useEffect to avoid use-before-assign
  const runDiagnostics = useCallback(async () => {
    setRunningDiagnostics(true);
    try {
      const results = await AdminDiagnostics.runFullDiagnostics();
      setDiagnostics(results);
    } catch (error) {
      console.error("Diagnostics failed:", error);
    } finally {
      setRunningDiagnostics(false);
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Loading dashboard data...");

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

// ...existing code...
      // Extract results with fallbacks
      const [
        eventsRes,
        membersRes,
        donationsRes,
        testimonialsRes,
        prayerRequestsRes,
        sermonsRes,
      ] = results.map((result, index) => {
        const tableNames = [
          "events",
          "members",
          "donations",
          "testimonials",
          "prayer_requests",
          "sermons",
        ];
        if (result.status === "rejected") {
          console.error(
            `Dashboard data load failed for ${tableNames[index]}:`,
            result.reason,
          );
          toast({
            title: "Warning",
            description: `Failed to load ${tableNames[index]} data`,
            variant: "destructive",
          });
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
// ...existing code...
      // Extract results with fallbacks
      const [
        eventsRes,
        membersRes,
        donationsRes,
        testimonialsRes,
        prayerRequestsRes,
        sermonsRes,
      ] = results.map((result, index) => {
        const tableNames = [
          "events",
          "members",
          "donations",
          "testimonials",
          "prayer_requests",
          "sermons",
        ];
        if (result.status === "rejected") {
          console.error(
            `Dashboard data load failed for ${tableNames[index]}:`,
            result.reason,
          );
          toast({
            title: "Warning",
            description: `Failed to load ${tableNames[index]} data`,
            variant: "destructive",
          });
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
>>>>>>> main
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
  }, [toast]);

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

  const handleCreateEvent = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setDialogLoading(true);
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      try {
        const eventData = {
          title: formData.get("title") as string,
          description: formData.get("description") as string,
          event_date: formData.get("event_date") as string,
          event_time: (formData.get("event_time") as string) || null,
          location: (formData.get("location") as string) || null,
          is_featured: false,
          image_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log("Creating event with data:", eventData);

        const { data, error } = await supabase
          .from("events")
          .insert([eventData])
          .select()
          .single();

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Event created successfully:", data);

        toast({
          title: "Success",
          description: "Event created successfully",
        });
        setOpenDialog(null);
        form.reset();
        loadDashboardData();

        // Notify data sync service
        dataSyncService.notifyAdminAction("create", "events", data);
      } catch (error) {
        console.error("Error creating event:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        toast({
          title: "Error",
          description: `Failed to create event: ${errorMessage}`,
          variant: "destructive",
        });
      } finally {
        setDialogLoading(false);
      }
    },
    [toast, loadDashboardData],
  );

  const handleCreateMember = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setDialogLoading(true);
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      try {
        const fullName = formData.get("full_name") as string;
        const nameParts = fullName.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const memberData = {
          full_name: fullName,
          email: (formData.get("email") as string) || null,
          phone: (formData.get("phone") as string) || null,
          address: (formData.get("address") as string) || null,
          membership_type:
            (formData.get("membership_type") as string) || "regular",
          membership_status: "active",
          join_date: new Date().toISOString(),
          membership_date: new Date().toISOString(),
          registration_date: new Date().toISOString().split("T")[0],
          first_name: firstName,
          last_name: lastName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log("Creating member with data:", memberData);

        const { data, error } = await supabase
          .from("members")
          .insert([memberData])
          .select()
          .single();

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Member created successfully:", data);

        toast({
          title: "Success",
          description: "Member added successfully",
        });
        setOpenDialog(null);
        form.reset();
        loadDashboardData();

        // Notify data sync service
        dataSyncService.notifyAdminAction("create", "members", data);
      } catch (error) {
        console.error("Error creating member:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        toast({
          title: "Error",
          description: `Failed to add member: ${errorMessage}`,
          variant: "destructive",
        });
      } finally {
        setDialogLoading(false);
      }
    },
    [toast, loadDashboardData],
  );

  const handleCreateAdmin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setDialogLoading(true);
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      try {
        const email = formData.get("email") as string;

        // Check if admin already exists
        const { data: existingAdmin } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .single();

        if (existingAdmin) {
          throw new Error("Admin with this email already exists");
        }

        const adminData = {
          id: crypto.randomUUID(),
          email: email,
          role: "admin",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log("Creating admin with data:", adminData);

        const { data, error } = await supabase
          .from("profiles")
          .insert([adminData])
          .select()
          .single();

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Admin created successfully:", data);

        toast({
          title: "Success",
          description:
            "Admin user created successfully. They can now register with this email.",
        });
        setOpenDialog(null);
        form.reset();
        loadDashboardData();

        // Notify data sync service
        dataSyncService.notifyAdminAction("create", "profiles", data);
      } catch (error) {
        console.error("Error creating admin:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        toast({
          title: "Error",
          description: `Failed to create admin user: ${errorMessage}`,
          variant: "destructive",
        });
      } finally {
        setDialogLoading(false);
      }
    },
    [toast, loadDashboardData],
  );

  const handleUploadImage = useCallback(
    async (e: React.FormEvent) => {
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
        });
        setDialogLoading(false);
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          variant: "destructive",
        });
        setDialogLoading(false);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        setDialogLoading(false);
        return;
      }

      try {
        console.log("Starting image upload:", file.name, file.size, file.type);

        // Upload file to storage bucket
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `gallery/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }

        console.log("File uploaded successfully:", uploadData);

        // Get the public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(filePath);

        console.log("Public URL:", publicUrl);

        // Create database entry
        const galleryData = {
          title: formData.get("title") as string,
          description: (formData.get("description") as string) || null,
          image_url: publicUrl,
          created_at: new Date().toISOString(),
        };

        console.log("Creating gallery entry:", galleryData);

        const { data, error: dbError } = await supabase
          .from("gallery")
          .insert([galleryData])
          .select()
          .single();

        if (dbError) {
          console.error("Database error:", dbError);
          throw dbError;
        }

        console.log("Gallery entry created successfully:", data);

        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
        setOpenDialog(null);
        form.reset();
        loadDashboardData();

        // Notify data sync service
        dataSyncService.notifyAdminAction("create", "gallery", data);
      } catch (error) {
        console.error("Error uploading image:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        toast({
          title: "Error",
          description: `Failed to upload image: ${errorMessage}`,
          variant: "destructive",
        });
      } finally {
        setDialogLoading(false);
      }
    },
    [toast, loadDashboardData],
  );

  const handleCreateSermon = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setDialogLoading(true);
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      try {
        const sermonData = {
          title: formData.get("title") as string,
          description: (formData.get("description") as string) || null,
          scripture_reference:
            (formData.get("scripture_reference") as string) || null,
          audio_url: (formData.get("audio_url") as string) || null,
          preacher: (formData.get("preacher") as string) || null,
          sermon_date: formData.get("sermon_date") as string,
          is_featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log("Creating sermon with data:", sermonData);

        const { data, error } = await supabase
          .from("sermons")
          .insert([sermonData])
          .select()
          .single();

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Sermon created successfully:", data);

        toast({
          title: "Success",
          description: "Sermon added successfully",
        });
        setOpenDialog(null);
        form.reset();
        loadDashboardData();

        // Notify data sync service
        dataSyncService.notifyAdminAction("create", "sermons", data);
      } catch (error) {
        console.error("Error creating sermon:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        toast({
          title: "Error",
          description: `Failed to add sermon: ${errorMessage}`,
          variant: "destructive",
        });
      } finally {
        setDialogLoading(false);
      }
    },
    [toast, loadDashboardData],
  );

  useEffect(() => {
    loadDashboardData();
    runDiagnostics();
  }, [loadDashboardData, runDiagnostics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-church-burgundy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-church-burgundy">
          Admin Dashboard
        </h1>
        <div className="flex gap-2">
          <Button
            onClick={loadDashboardData}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Refresh Data
          </Button>
          <Button
            onClick={runDiagnostics}
            variant="outline"
            disabled={runningDiagnostics}
            className="w-full sm:w-auto"
          >
            {runningDiagnostics ? "Running..." : "Run Diagnostics"}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Events"
          value={stats.totalEvents.toString()}
          description="Scheduled events"
          icon={<Calendar className="h-6 w-6" />}
          trend="+2 this month"
        />
        <StatsCard
          title="Church Members"
          value={stats.totalMembers.toString()}
          description="Registered members"
          icon={<Users className="h-6 w-6" />}
          trend="+5 this month"
        />
        <StatsCard
          title="Recent Donations"
          value={`$${stats.recentDonationAmount.toLocaleString()}`}
          description="Last 30 days"
          icon={<DollarSign className="h-6 w-6" />}
          trend="+12% from last month"
        />
        <StatsCard
          title="Prayer Requests"
          value={stats.totalPrayerRequests.toString()}
          description="Pending requests"
          icon={<Heart className="h-6 w-6" />}
          trend="3 new today"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Sermons"
          value={stats.totalSermons.toString()}
          description="Available sermons"
          icon={<Activity className="h-6 w-6" />}
          trend="1 new this week"
        />
        <StatsCard
          title="Testimonials"
          value={stats.totalTestimonials.toString()}
          description="Approved testimonials"
          icon={<MessageSquare className="h-6 w-6" />}
          trend="2 pending approval"
        />
        <StatsCard
          title="Total Donations"
          value={stats.totalDonations.toString()}
          description="All time donations"
          icon={<TrendingUp className="h-6 w-6" />}
          trend="Growing steadily"
        />
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {/* Create Event Dialog */}
              <Dialog
                open={openDialog === "event"}
                onOpenChange={(open) => setOpenDialog(open ? "event" : null)}
              >
                <DialogTrigger asChild>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Create New Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                    <DialogDescription>
                      Add a new church event
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateEvent} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Event Title</Label>
                      <Input id="title" name="title" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event_date">Date</Label>
                      <Input
                        id="event_date"
                        name="event_date"
                        type="date"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event_time">Time</Label>
                      <Input id="event_time" name="event_time" type="time" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" name="location" />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={dialogLoading}
                    >
                      {dialogLoading ? "Creating..." : "Create Event"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Add Member Dialog */}
              <Dialog
                open={openDialog === "member"}
                onOpenChange={(open) => setOpenDialog(open ? "member" : null)}
              >
                <DialogTrigger asChild>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Add New Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Member</DialogTitle>
                    <DialogDescription>
                      Register a new church member
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateMember} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input id="full_name" name="full_name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" type="tel" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" name="address" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="membership_type">Membership Type</Label>
                      <Select name="membership_type" defaultValue="regular">
                        <SelectTrigger>
                          <SelectValue placeholder="Select membership type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                          <SelectItem value="family">Family</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={dialogLoading}
                    >
                      {dialogLoading ? "Adding..." : "Add Member"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Add Admin Dialog */}
              <Dialog
                open={openDialog === "admin"}
                onOpenChange={(open) => setOpenDialog(open ? "admin" : null)}
              >
                <DialogTrigger asChild>
                  <Button className="w-full justify-start" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Add New Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Admin</DialogTitle>
                    <DialogDescription>
                      Create a new admin user
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateAdmin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin_email">Email</Label>
                      <Input
                        id="admin_email"
                        name="email"
                        type="email"
                        required
                      />
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> The admin will need to register
                        with this email address using the admin registration
                        process.
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={dialogLoading}
                    >
                      {dialogLoading ? "Creating..." : "Create Admin"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Upload Image Dialog */}
              <Dialog
                open={openDialog === "image"}
                onOpenChange={(open) => setOpenDialog(open ? "image" : null)}
              >
                <DialogTrigger asChild>
                  <Button className="w-full justify-start" variant="outline">
                    <Image className="h-4 w-4 mr-2" />
                    Upload Gallery Image
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Gallery Image</DialogTitle>
                    <DialogDescription>
                      Add a new image to the gallery
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUploadImage} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="file">Image File</Label>
                      <Input
                        id="file"
                        name="file"
                        type="file"
                        accept="image/*"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image_title">Title</Label>
                      <Input id="image_title" name="title" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image_description">Description</Label>
                      <Textarea id="image_description" name="description" />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={dialogLoading}
                    >
                      {dialogLoading ? "Uploading..." : "Upload Image"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Add Sermon Dialog */}
              <Dialog
                open={openDialog === "sermon"}
                onOpenChange={(open) => setOpenDialog(open ? "sermon" : null)}
              >
                <DialogTrigger asChild>
                  <Button className="w-full justify-start" variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    Add New Sermon
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Sermon</DialogTitle>
                    <DialogDescription>
                      Add a sermon to the collection
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateSermon} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sermon_title">Sermon Title</Label>
                      <Input id="sermon_title" name="title" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sermon_description">Description</Label>
                      <Textarea id="sermon_description" name="description" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scripture_reference">
                        Scripture Reference
                      </Label>
                      <Input
                        id="scripture_reference"
                        name="scripture_reference"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preacher">Preacher</Label>
                      <Input id="preacher" name="preacher" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sermon_date">Sermon Date</Label>
                      <Input
                        id="sermon_date"
                        name="sermon_date"
                        type="date"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="audio_url">Audio URL (optional)</Label>
                      <Input id="audio_url" name="audio_url" type="url" />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={dialogLoading}
                    >
                      {dialogLoading ? "Adding..." : "Add Sermon"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

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
          </CardContent>
        </Card>

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

          {/* System Diagnostics */}
          <Card>
            <CardHeader>
              <CardTitle>System Diagnostics</CardTitle>
              <CardDescription>Component health status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {diagnostics.length > 0 ? (
                  diagnostics.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded text-sm ${
                        result.status === "success"
                          ? "bg-green-50 text-green-800"
                          : result.status === "warning"
                            ? "bg-yellow-50 text-yellow-800"
                            : "bg-red-50 text-red-800"
                      }`}
                    >
                      <span className="font-medium">{result.component}</span>
                      <span className="text-xs">{result.message}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    {runningDiagnostics
                      ? "Running diagnostics..."
                      : "No diagnostics run yet"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Audit Log Section */}
      <div className="mt-8">
        <AuditLog />
      </div>
    </div>
  );
}

const StatsCard = React.memo(function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className="text-church-burgundy">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-church-burgundy">{value}</div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
        {trend && (
          <p className="text-xs text-green-600 mt-2 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
});
