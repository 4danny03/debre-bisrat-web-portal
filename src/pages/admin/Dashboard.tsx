
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  Heart,
  Mail,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalMembers: number;
  pendingMembers: number;
  totalDonations: number;
  monthlyDonations: number;
  upcomingEvents: number;
  prayerRequests: number;
  recentRegistrations: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    pendingMembers: 0,
    totalDonations: 0,
    monthlyDonations: 0,
    upcomingEvents: 0,
    prayerRequests: 0,
    recentRegistrations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check authentication first
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session) {
        throw new Error("Authentication required");
      }

      // Load all data in parallel
      const [
        membersResponse,
        donationsResponse,
        eventsResponse,
        prayerResponse,
      ] = await Promise.allSettled([
        supabase.from("members").select("id, membership_status, created_at"),
        supabase.from("donations").select("amount, created_at"),
        supabase.from("events").select("id, event_date"),
        supabase.from("prayer_requests").select("id, is_answered"),
      ]);

      // Process members data
      if (membersResponse.status === "fulfilled" && membersResponse.value.data) {
        const members = membersResponse.value.data;
        const totalMembers = members.length;
        const pendingMembers = members.filter(m => m.membership_status === "pending").length;
        
        // Recent registrations (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentRegistrations = members.filter(m => 
          new Date(m.created_at) >= weekAgo
        ).length;

        setStats(prev => ({ 
          ...prev, 
          totalMembers, 
          pendingMembers, 
          recentRegistrations 
        }));
      }

      // Process donations data
      if (donationsResponse.status === "fulfilled" && donationsResponse.value.data) {
        const donations = donationsResponse.value.data;
        const totalDonations = donations.reduce((sum, d) => sum + Number(d.amount), 0);
        
        // Monthly donations (current month)
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const monthlyDonations = donations
          .filter(d => new Date(d.created_at) >= thisMonth)
          .reduce((sum, d) => sum + Number(d.amount), 0);

        setStats(prev => ({ ...prev, totalDonations, monthlyDonations }));
      }

      // Process events data
      if (eventsResponse.status === "fulfilled" && eventsResponse.value.data) {
        const events = eventsResponse.value.data;
        const today = new Date();
        const upcomingEvents = events.filter(e => new Date(e.event_date) >= today).length;
        
        setStats(prev => ({ ...prev, upcomingEvents }));
      }

      // Process prayer requests data
      if (prayerResponse.status === "fulfilled" && prayerResponse.value.data) {
        const prayers = prayerResponse.value.data;
        const prayerRequests = prayers.filter(p => !p.is_answered).length;
        
        setStats(prev => ({ ...prev, prayerRequests }));
      }

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError(error instanceof Error ? error.message : "Failed to load dashboard data");
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-church-burgundy">Dashboard</h1>
        </div>
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Error loading dashboard: {error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-church-burgundy">Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      {/* Stats Grid */}
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
              {stats.recentRegistrations} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Members</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingMembers}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalDonations.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              ${stats.monthlyDonations.toFixed(2)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.upcomingEvents}
            </div>
            <p className="text-xs text-muted-foreground">
              Scheduled events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-500" />
              Prayer Requests
            </CardTitle>
            <CardDescription>
              Active prayer requests needing attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {stats.prayerRequests}
            </div>
            <p className="text-sm text-muted-foreground">
              Unanswered requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Growth Metrics
            </CardTitle>
            <CardDescription>
              Recent activity and growth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">New Members (7 days)</span>
                <span className="font-semibold">{stats.recentRegistrations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Monthly Donations</span>
                <span className="font-semibold">${stats.monthlyDonations.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            <button className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-church-burgundy" />
                <span>Manage Members</span>
              </div>
            </button>
            <button className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>View Donations</span>
              </div>
            </button>
            <button className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Manage Events</span>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
