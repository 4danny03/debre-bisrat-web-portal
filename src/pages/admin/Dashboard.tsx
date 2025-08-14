


import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  DollarSign,
  Calendar,
  ClipboardList,
  MessageSquare,
  Plus,
  Mail,
  Activity,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { api } from "@/integrations/supabase/api";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    members: 0,
    donations: 0,
    donationAmount: 0,
    events: 0,
    appointments: 0,
    testimonials: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadingLists, setLoadingLists] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [recentMembers, setRecentMembers] = useState<any[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      // Fetch counts in parallel
      const [
        { count: membersRaw },
        { count: donationsRaw },
        { data: donationRows = [] },
        { count: eventsRaw },
        { count: appointmentsRaw },
        { count: testimonialsRaw }
      ] = await Promise.all([
        supabase.from("members").select("id", { count: "exact", head: true }),
        supabase.from("donations").select("id", { count: "exact", head: true }),
        supabase.from("donations").select("amount"),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("appointments").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      const members = membersRaw ?? 0;
      const donations = donationsRaw ?? 0;
      const events = eventsRaw ?? 0;
      const appointments = appointmentsRaw ?? 0;
      const testimonials = testimonialsRaw ?? 0;
      const donationAmount = Array.isArray(donationRows)
        ? donationRows.reduce((sum, d) => sum + (d.amount || 0), 0)
        : 0;
      setStats({
        members,
        donations,
        donationAmount,
        events,
        appointments,
        testimonials,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        setLoadingLists(true);
        const [events, donations, members, pending] = await Promise.all([
          api.events.getUpcomingEvents(),
          api.donations.getDonations(),
          api.members.getMembers(),
          api.appointments.getAppointmentsByStatus("pending"),
        ]);

        setUpcomingEvents(Array.isArray(events) ? events.slice(0, 5) : []);
        setRecentDonations(
          Array.isArray(donations) ? donations.slice(0, 5) : [],
        );
        setRecentMembers(Array.isArray(members) ? members.slice(0, 5) : []);
        setPendingAppointments(Array.isArray(pending) ? pending.length : 0);
      } catch (error) {
        console.error("Error loading dashboard lists:", error);
        setUpcomingEvents([]);
        setRecentDonations([]);
        setRecentMembers([]);
        setPendingAppointments(0);
      } finally {
        setLoadingLists(false);
      }
    };
    fetchLists();
  }, []);

  return (
    <div className="space-y-6" role="main" aria-label="Admin Dashboard Main Content">
      <h1 className="text-2xl sm:text-3xl font-bold text-church-burgundy" tabIndex={-1} id="dashboard-title">
        Admin Dashboard
      </h1>
      <p className="text-gray-600 mb-6">Quick overview of your church management system</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/admin/members")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Users className="h-5 w-5 text-church-burgundy" /> Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "-" : stats.members}</div>
            <CardDescription>Total registered members</CardDescription>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/admin/donations")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" /> Donations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "-" : `$${stats.donationAmount.toLocaleString()}`}</div>
            <CardDescription>{loading ? "-" : `${stats.donations} donations received`}</CardDescription>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/admin/events")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" /> Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "-" : stats.events}</div>
            <CardDescription>Upcoming and past events</CardDescription>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/admin/appointments")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-yellow-600" /> Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "-" : stats.appointments}</div>
            <CardDescription>Service appointment requests</CardDescription>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/admin/users")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" /> Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "-" : stats.testimonials}</div>
            <CardDescription>Users</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Activity className="h-5 w-5 text-church-burgundy" /> Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="default" onClick={() => navigate("/admin/events")}> 
            <Plus className="h-4 w-4 mr-2" /> Create / Manage Events
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/appointments")}> 
            <ClipboardList className="h-4 w-4 mr-2" /> Review Appointments
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/donations")}> 
            <DollarSign className="h-4 w-4 mr-2" /> View Donations
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/email-marketing")}> 
            <Mail className="h-4 w-4 mr-2" /> Email Marketing
          </Button>
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" /> Upcoming Events
            </CardTitle>
            <CardDescription>Next scheduled church activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loadingLists ? (
                <p className="text-sm text-gray-500">Loading events…</p>
              ) : upcomingEvents.length === 0 ? (
                <p className="text-sm text-gray-500">No upcoming events</p>
              ) : (
                upcomingEvents.map((e, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b last:border-0 pb-2">
                    <div>
                      <p className="text-sm font-medium">{e.title}</p>
                      {e.event_date && (
                        <p className="text-xs text-gray-500">{new Date(e.event_date).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div className="pt-2">
                <Button variant="link" onClick={() => navigate("/admin/events")}>View all events</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" /> Recent Donations
            </CardTitle>
            <CardDescription>Latest contributions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loadingLists ? (
                <p className="text-sm text-gray-500">Loading donations…</p>
              ) : recentDonations.length === 0 ? (
                <p className="text-sm text-gray-500">No recent donations</p>
              ) : (
                recentDonations.map((d, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b last:border-0 pb-2">
                    <div>
                      <p className="text-sm font-medium">${d.amount?.toLocaleString?.() || d.amount}</p>
                      <p className="text-xs text-gray-500">{new Date(d.created_at).toLocaleString()}</p>
                    </div>
                    <span className="text-xs uppercase text-gray-600">{d.status || "completed"}</span>
                  </div>
                ))
              )}
              <div className="pt-2">
                <Button variant="link" onClick={() => navigate("/admin/donations")}>View all donations</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Users className="h-5 w-5 text-church-burgundy" /> Recent Members
            </CardTitle>
            <CardDescription>Latest registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loadingLists ? (
                <p className="text-sm text-gray-500">Loading members…</p>
              ) : recentMembers.length === 0 ? (
                <p className="text-sm text-gray-500">No recent members</p>
              ) : (
                recentMembers.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b last:border-0 pb-2">
                    <div>
                      <p className="text-sm font-medium">{m.full_name || m.email || "Member"}</p>
                      {m.created_at && (
                        <p className="text-xs text-gray-500">Joined {new Date(m.created_at).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div className="pt-2">
                <Button variant="link" onClick={() => navigate("/admin/members")}>View all members</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-yellow-600" /> Pending Appointments
          </CardTitle>
          <Button variant="outline" onClick={() => navigate("/admin/appointments")}>Manage</Button>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {loadingLists ? "-" : pendingAppointments}
          </div>
          <CardDescription>Awaiting review</CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
