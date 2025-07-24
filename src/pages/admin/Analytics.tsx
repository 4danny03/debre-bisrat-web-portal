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

      // Map timeRange to dateRange format expected by the API
      const dateRangeMap = {
        "3months": "last90days",
        "6months": "last180days",
        "12months": "last365days",
      };

      const dateRange = dateRangeMap[timeRange] || "last30days";

      // Use the new analytics-reports edge function
      const { data: reportData, error } = await supabase.functions.invoke(
        "supabase-functions-analytics-reports",
        {
          body: {
            reportType: activeTab === "overview" ? "overview" : activeTab,
            dateRange,
            filters: {},
          },
        },
      );

      if (error) throw error;

      if (!reportData || !reportData.data) {
        throw new Error("No data returned from analytics service");
      }

      // Set the data based on the report type
      if (
        activeTab === "overview" ||
        activeTab === "donations" ||
        activeTab === "members" ||
        activeTab === "events"
      ) {
        setData(reportData.data);
      } else {
        // For other tabs, we need to transform the data to match the expected format
        const transformedData = {
          donations: reportData.data.donations || {},
          members: reportData.data.members || {},
          events: reportData.data.events || {},
          engagement: reportData.data.engagement || {},
        };
        setData(transformedData);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast({
        title: "Error",
        description:
          "Failed to load analytics data: " +
          (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [timeRange, activeTab, toast]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  // These data processing functions have been moved to the edge function
  // We'll keep simplified versions for any client-side processing if needed

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value}%`;
  };

  const exportData = async () => {
    if (!data) return;

    try {
      setLoading(true);

      // Get full data for export using the edge function
      const dateRangeMap = {
        "3months": "last90days",
        "6months": "last180days",
        "12months": "last365days",
      };

      const dateRange = dateRangeMap[timeRange] || "last30days";

      // Request full data for export
      const { data: reportData, error } = await supabase.functions.invoke(
        "supabase-functions-analytics-reports",
        {
          body: {
            reportType: "overview",
            dateRange,
            filters: {},
            includeRawData: true,
          },
        },
      );

      if (error) throw error;

      const exportData = {
        generatedAt: new Date().toISOString(),
        timeRange,
        dateRange,
        summary: {
          totalDonations: data.donations.total,
          totalMembers: data.members.total,
          totalEvents: data.events.total,
          upcomingEvents: data.events.upcoming,
        },
        data: reportData.data,
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
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Error",
        description:
          "Failed to export analytics data: " +
          (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
          <Select
            value={timeRange}
            onValueChange={(value) => {
              setTimeRange(value);
              // Reload data when time range changes
              setTimeout(() => loadAnalyticsData(), 0);
            }}
          >
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

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          // Reload data when tab changes
          setTimeout(() => loadAnalyticsData(), 0);
        }}
      >
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
