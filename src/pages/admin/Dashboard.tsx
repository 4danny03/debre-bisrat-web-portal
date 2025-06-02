import { useState, useEffect } from "react";
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
  UserPlus,
  Shield,
  Plus,
  Upload,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import AdminSyncStatus from "@/components/AdminSyncStatus";
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
  const { toast } = useToast();
  const navigate = useNavigate();
  const { forceSync } = useDataContext();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load statistics from all tables
      const [
        eventsRes,
        membersRes,
        donationsRes,
        testimonialsRes,
        prayerRequestsRes,
        sermonsRes,
      ] = await Promise.all([
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

      // Calculate recent donation amount (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentDonations =
        donationsRes.data?.filter(
          (d) => new Date(d.created_at) >= thirtyDaysAgo,
        ) || [];

      const recentDonationAmount = recentDonations.reduce(
        (sum, d) => sum + d.amount,
        0,
      );

      setStats({
        totalEvents: eventsRes.count || 0,
        totalMembers: membersRes.count || 0,
        totalDonations: donationsRes.data?.length || 0,
        totalTestimonials: testimonialsRes.count || 0,
        totalPrayerRequests: prayerRequestsRes.count || 0,
        totalSermons: sermonsRes.count || 0,
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

      // Get recent events
      const { data: events } = await supabase
        .from("events")
        .select("id, title, description, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      events?.forEach((event) => {
        activities.push({
          id: event.id,
          type: "event",
          title: `New Event: ${event.title}`,
          description: event.description || "No description",
          created_at: event.created_at,
        });
      });

      // Get recent members
      const { data: members } = await supabase
        .from("members")
        .select("id, full_name, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      members?.forEach((member) => {
        activities.push({
          id: member.id,
          type: "member",
          title: `New Member: ${member.full_name}`,
          description: "Joined the church community",
          created_at: member.created_at,
        });
      });

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
      dataSyncService.notifyAdminAction("create", "events");
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
      dataSyncService.notifyAdminAction("create", "members");
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
      dataSyncService.notifyAdminAction("create", "profiles");
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
      });
      setDialogLoading(false);
      return;
    }

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
      dataSyncService.notifyAdminAction("create", "gallery");
      await forceSync();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setDialogLoading(false);
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
      dataSyncService.notifyAdminAction("create", "sermons");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-church-burgundy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-church-burgundy">
          Admin Dashboard
        </h1>
        <Button onClick={loadDashboardData} variant="outline">
          Refresh Data
        </Button>
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
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
                          <SelectValue />
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
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Real-time sync and git status</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminSyncStatus />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({
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
}
