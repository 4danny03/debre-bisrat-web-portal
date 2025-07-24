import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Heart,
  Download,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { Member } from "@/types/member";
import { Database } from "@/types/supabase";

interface AnalyticsData {
  donations: {
    total: number;
    monthly: Array<{ month: string; amount: number; count: number }>;
    byPurpose: Array<{ purpose: string; amount: number; percentage: number }>;
    trends: {
      thisMonth: number;
      lastMonth: number;
      growth: number;
    };
  };
  members: {
    total: number;
    monthly: Array<{ month: string; count: number }>;
    byType: Array<{ type: string; count: number; percentage: number }>;
    trends: {
      thisMonth: number;
      lastMonth: number;
      growth: number;
    };
  };
  events: {
    total: number;
    upcoming: number;
    monthly: Array<{ month: string; count: number }>;
    attendance: Array<{ event: string; attendance: number }>;
  };
  engagement: {
    prayerRequests: number;
    testimonials: number;
    galleryViews: number;
  };
}

const COLORS = ["#7d2224", "#d4af37", "#228b22", "#4169e1", "#ff6347"];

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6months");
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);

      // Calculate date ranges
      const now = new Date();
      const monthsBack =
        timeRange === "3months" ? 3 : timeRange === "6months" ? 6 : 12;
      const startDate = subDays(now, monthsBack * 30);

      // Fetch all data in parallel
      const [
        donationsRes,
        membersRes,
        eventsRes,
        prayerRequestsRes,
        testimonialsRes,
      ] = await Promise.all([
        supabase
          .from("donations")
          .select("*")
          .gte("created_at", startDate.toISOString()),
        supabase
          .from("members")
          .select("*")
          .gte("created_at", startDate.toISOString()),
        supabase
          .from("events")
          .select("*")
          .gte("created_at", startDate.toISOString()),
        supabase
          .from("prayer_requests")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("testimonials")
          .select("*", { count: "exact", head: true }),
      ]);

      // Process donations data with safe array handling
      const donations = Array.isArray(donationsRes.data)
        ? donationsRes.data
        : [];
      const donationsByMonth = processMonthlyData(
        donations,
        "created_at",
        "amount",
      );
      const donationsByPurpose = processPurposeData(donations);
      const donationTrends = calculateTrends(donations, "amount");

      // Process members data with safe array handling
      const members = Array.isArray(membersRes.data) ? membersRes.data : [];
      const membersByMonth = processMonthlyData(members, "created_at");
      const membersByType = processTypeData(members, "membership_type");
      const memberTrends = calculateTrends(members);

      // Process events data with safe array handling
      const events = Array.isArray(eventsRes.data) ? eventsRes.data : [];
      const eventsByMonth = processMonthlyData(events, "created_at");
      const upcomingEvents = events.filter((e) => {
        if (!e?.event_date) return false;
        try {
          return new Date(e.event_date) > now;
        } catch {
          return false;
        }
      }).length;

      setData({
        donations: {
          total: donations.reduce(
            (sum, d) => sum + (Number(d?.amount) || 0),
            0,
          ),
          monthly: donationsByMonth,
          byPurpose: donationsByPurpose,
          trends: donationTrends,
        },
        members: {
          total: members.length,
          monthly: membersByMonth,
          byType: membersByType,
          trends: memberTrends,
        },
        events: {
          total: events.length,
          upcoming: upcomingEvents,
          monthly: eventsByMonth,
          attendance: [], // Would need additional tracking
        },
        engagement: {
          prayerRequests: prayerRequestsRes.count || 0,
          testimonials: testimonialsRes.count || 0,
          galleryViews: 0, // Would need view tracking
        },
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [timeRange, toast]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const processMonthlyData = (
    items: Database["public"]["Tables"]["donations"]["Row"][],
    dateField: keyof Database["public"]["Tables"]["donations"]["Row"],
    valueField?: keyof Database["public"]["Tables"]["donations"]["Row"],
  ) => {
    if (!Array.isArray(items)) {
      console.warn("processMonthlyData: items is not an array");
      return [];
    }

    const monthlyData: Record<string, { count: number; amount: number }> = {};

    items.forEach((item) => {
      if (!item || !item[dateField]) return;

      try {
        const month = format(new Date(item[dateField]), "MMM yyyy");
        if (!monthlyData[month]) {
          monthlyData[month] = { count: 0, amount: 0 };
        }
        monthlyData[month].count += 1;
        if (valueField && item[valueField]) {
          monthlyData[month].amount += Number(item[valueField]) || 0;
        }
      } catch (error) {
        console.warn("Error processing date:", item[dateField], error);
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      count: data.count,
      amount: data.amount,
    }));
  };

  const processPurposeData = (donations: any[]) => {
    if (!Array.isArray(donations)) {
      console.warn("processPurposeData: donations is not an array");
      return [];
    }

    const purposeData: Record<string, number> = {};
    const total = donations.reduce(
      (sum, d) => sum + (Number(d?.amount) || 0),
      0,
    );

    donations.forEach((donation) => {
      if (!donation) return;
      const purpose = donation.purpose || "General Fund";
      const amount = Number(donation.amount) || 0;
      purposeData[purpose] = (purposeData[purpose] || 0) + amount;
    });

    return Object.entries(purposeData).map(([purpose, amount]) => ({
      purpose,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    }));
  };

  const processTypeData = (members: any[], typeField: string) => {
    if (!Array.isArray(members)) {
      console.warn("processTypeData: members is not an array");
      return [];
    }

    const typeData: Record<string, number> = {};
    const total = members.length;

    members.forEach((member) => {
      if (!member) return;
      const type = member[typeField] || "Regular";
      typeData[type] = (typeData[type] || 0) + 1;
    });

    return Object.entries(typeData).map(([type, count]) => ({
      type,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  };

  const calculateTrends = (items: any[], valueField?: string) => {
    if (!Array.isArray(items)) {
      console.warn("calculateTrends: items is not an array");
      return { thisMonth: 0, lastMonth: 0, growth: 0 };
    }

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subDays(now, 30));
    const lastMonthEnd = endOfMonth(subDays(now, 30));

    const thisMonth = items.filter((item) => {
      if (!item?.created_at) return false;
      try {
        return new Date(item.created_at) >= thisMonthStart;
      } catch {
        return false;
      }
    });

    const lastMonth = items.filter((item) => {
      if (!item?.created_at) return false;
      try {
        const date = new Date(item.created_at);
        return date >= lastMonthStart && date <= lastMonthEnd;
      } catch {
        return false;
      }
    });

    const thisMonthValue = valueField
      ? thisMonth.reduce(
          (sum, item) => sum + (Number(item[valueField]) || 0),
          0,
        )
      : thisMonth.length;
    const lastMonthValue = valueField
      ? lastMonth.reduce(
          (sum, item) => sum + (Number(item[valueField]) || 0),
          0,
        )
      : lastMonth.length;

    const growth =
      lastMonthValue > 0
        ? Math.round(((thisMonthValue - lastMonthValue) / lastMonthValue) * 100)
        : 0;

    return {
      thisMonth:
        valueField
          ? thisMonth.reduce((sum, item) => sum + ((typeof item[valueField] === "number" ? item[valueField] as number : 0)), 0)
          : thisMonth.length,
      lastMonth:
        valueField
          ? lastMonth.reduce((sum, item) => sum + ((typeof item[valueField] === "number" ? item[valueField] as number : 0)), 0)
          : lastMonth.length,
      growth:
        valueField
          ? thisMonth.length > 0
            ? Math.round(
                ((
                  thisMonth.reduce((sum, item) => sum + ((typeof item[valueField] === "number" ? item[valueField] as number : 0)), 0) -
                  lastMonth.reduce((sum, item) => sum + ((typeof item[valueField] === "number" ? item[valueField] as number : 0)), 0)) /
                  lastMonth.reduce((sum, item) => sum + ((typeof item[valueField] === "number" ? item[valueField] as number : 0)), 0)
                ) * 100,
              )
            : 0
          : 0,
    };
  };

  const exportData = () => {
    if (!data) return;

    const exportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      summary: {
        totalDonations: data.donations.total,
        totalMembers: data.members.total,
        totalEvents: data.events.total,
        upcomingEvents: data.events.upcoming,
      },
      donations: data.donations,
      members: data.members,
      events: data.events,
      engagement: data.engagement,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `church-analytics-${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Analytics data exported successfully",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-church-burgundy"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No analytics data available</p>
        <Button onClick={loadAnalyticsData} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-church-burgundy">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into church operations
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex space-x-2">
            <Button
              onClick={exportData}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export Data</span>
              <span className="sm:hidden">Export</span>
            </Button>
            <Button
              onClick={loadAnalyticsData}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Donations"
          value={`$${data.donations.total.toLocaleString()}`}
          trend={data.donations.trends.growth}
          icon={<DollarSign className="h-6 w-6" />}
          description="This month vs last month"
        />
        <MetricCard
          title="Active Members"
          value={data.members.total.toString()}
          trend={data.members.trends.growth}
          icon={<Users className="h-6 w-6" />}
          description="New registrations"
        />
        <MetricCard
          title="Upcoming Events"
          value={data.events.upcoming.toString()}
          trend={0}
          icon={<Calendar className="h-6 w-6" />}
          description="Scheduled events"
        />
        <MetricCard
          title="Prayer Requests"
          value={data.engagement.prayerRequests.toString()}
          trend={0}
          icon={<Heart className="h-6 w-6" />}
          description="Community engagement"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Donations Trend</CardTitle>
                <CardDescription>Donation amounts over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.donations.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#7d2224"
                      fill="#7d2224"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Member Growth</CardTitle>
                <CardDescription>New member registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.members.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#d4af37"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="donations" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Donations by Purpose</CardTitle>
                <CardDescription>How donations are allocated</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.donations.byPurpose}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ purpose, percentage }) =>
                        `${purpose} (${percentage}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {data.donations.byPurpose.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Donation Trends</CardTitle>
                <CardDescription>
                  Amount and frequency over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.donations.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#7d2224" />
                    <Bar dataKey="count" fill="#d4af37" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Membership Types</CardTitle>
                <CardDescription>
                  Distribution of membership categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.members.byType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percentage }) =>
                        `${type} (${percentage}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.members.byType.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Member Registration Trends</CardTitle>
                <CardDescription>New members over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.members.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#228b22"
                      fill="#228b22"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Prayer Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-church-burgundy">
                  {data.engagement.prayerRequests}
                </div>
                <p className="text-xs text-gray-500 mt-1">Total submitted</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Testimonials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-church-burgundy">
                  {data.engagement.testimonials}
                </div>
                <p className="text-xs text-gray-500 mt-1">Community stories</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-church-burgundy">
                  {data.events.total}
                </div>
                <p className="text-xs text-gray-500 mt-1">Total organized</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({
  title,
  value,
  trend,
  icon,
  description,
}: {
  title: string;
  value: string;
  trend: number;
  icon: React.ReactNode;
  description: string;
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
        <div className="flex items-center mt-2">
          {trend !== 0 && (
            <div
              className={`flex items-center text-xs ${
                trend > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(trend)}%
            </div>
          )}
          <p className="text-xs text-gray-500 ml-2">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
