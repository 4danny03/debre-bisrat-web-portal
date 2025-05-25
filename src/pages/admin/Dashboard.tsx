import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Image,
  Users,
  DollarSign,
  MessageSquare,
  Heart,
  TrendingUp,
  Activity,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

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
  const { toast } = useToast();

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

      {/* Recent Activity and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
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
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Create New Event
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Add New Member
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Image className="h-4 w-4 mr-2" />
                Upload Gallery Image
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Add New Sermon
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Review Testimonials
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Heart className="h-4 w-4 mr-2" />
                View Prayer Requests
              </Button>
            </div>
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
