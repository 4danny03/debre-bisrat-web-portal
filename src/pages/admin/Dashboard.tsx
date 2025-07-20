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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  Calendar,
  DollarSign,
  MessageSquare,
  TrendingUp,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Heart,
  BookOpen,
  Camera,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  safeDataLoader,
  logAdminAction,
  formatErrorMessage,
  loadDashboardStats,
  loadRecentActivity,
  performHealthCheck,
} from "@/utils/adminHelpers";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
  type: string;
  title: string;
  description: string;
  created_at: string;
}

interface HealthStatus {
  database: boolean;
  api: boolean;
  auth: boolean;
  sync: boolean;
}

export default function AdminDashboard() {
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
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    database: false,
    api: false,
    auth: false,
    sync: false,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    checkSystemHealth();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log("Loading dashboard data...");

      // Use enhanced admin helpers
      const [statsData, activityData] = await Promise.all([
        loadDashboardStats(),
        loadRecentActivity(6),
      ]);

      setStats(
        statsData || {
          totalEvents: 0,
          totalMembers: 0,
          totalDonations: 0,
          totalTestimonials: 0,
          totalPrayerRequests: 0,
          totalSermons: 0,
          recentDonationAmount: 0,
        },
      );
      const safeActivityData = Array.isArray(activityData) ? activityData : [];
      setRecentActivity(safeActivityData);
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

  const checkSystemHealth = async () => {
    try {
      const health = await performHealthCheck();
      setHealthStatus(health);
    } catch (error) {
      console.error("Health check failed:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadDashboardData(), checkSystemHealth()]);
    setRefreshing(false);
    toast({
      title: "Success",
      description: "Dashboard data refreshed",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "event":
        return <Calendar className="w-4 h-4" />;
      case "member":
        return <Users className="w-4 h-4" />;
      case "donation":
        return <DollarSign className="w-4 h-4" />;
      case "testimonial":
        return <MessageSquare className="w-4 h-4" />;
      case "prayer_request":
        return <Heart className="w-4 h-4" />;
      case "sermon":
        return <BookOpen className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getHealthIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-600" />
    );
  };

  const chartData = [
    { name: "Events", value: stats.totalEvents, color: "#8884d8" },
    { name: "Members", value: stats.totalMembers, color: "#82ca9d" },
    { name: "Sermons", value: stats.totalSermons, color: "#ffc658" },
    { name: "Testimonials", value: stats.totalTestimonials, color: "#ff7300" },
  ];

  const overallHealth = Object.values(healthStatus).filter(Boolean).length;
  const healthPercentage = (overallHealth / 4) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-church-burgundy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-church-burgundy">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Overview of church management system</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </Button>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              System Health
            </span>
            <Badge
              variant={healthPercentage === 100 ? "default" : "destructive"}
              className={
                healthPercentage === 100
                  ? "bg-green-100 text-green-800"
                  : healthPercentage >= 75
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }
            >
              {healthPercentage}% Healthy
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress value={healthPercentage} className="h-2" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                {getHealthIcon(healthStatus.database)}
                <span className="text-sm">Database</span>
              </div>
              <div className="flex items-center space-x-2">
                {getHealthIcon(healthStatus.api)}
                <span className="text-sm">API</span>
              </div>
              <div className="flex items-center space-x-2">
                {getHealthIcon(healthStatus.auth)}
                <span className="text-sm">Authentication</span>
              </div>
              <div className="flex items-center space-x-2">
                {getHealthIcon(healthStatus.sync)}
                <span className="text-sm">Data Sync</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-church-burgundy">
              {stats.totalMembers}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered church members
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
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalEvents}
            </div>
            <p className="text-xs text-muted-foreground">
              Scheduled church events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Donations
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.recentDonationAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days ({stats.totalDonations} total)
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
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalPrayerRequests}
            </div>
            <p className="text-xs text-muted-foreground">
              Active prayer requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Overview Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Content Overview</CardTitle>
            <CardDescription>
              Distribution of church content and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates across the church management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(recentActivity) && recentActivity.length > 0 ? (
                recentActivity.map((activity) => {
                  if (!activity || !activity.id) {
                    console.warn("Invalid activity object:", activity);
                    return null;
                  }

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 rounded-lg border"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title || "No title"}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {activity.description || "No description"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.created_at
                            ? new Date(activity.created_at).toLocaleDateString()
                            : "No date"}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Activity will appear here as users interact with the system
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sermons</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {stats.totalSermons}
            </div>
            <p className="text-xs text-muted-foreground">
              Available sermon recordings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testimonials</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.totalTestimonials}
            </div>
            <p className="text-xs text-muted-foreground">
              Community testimonials
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {healthPercentage.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall system health
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
