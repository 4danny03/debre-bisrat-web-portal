


import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
import { Users, DollarSign, Calendar, ClipboardList, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
        supabase.from("testimonials").select("id", { count: "exact", head: true }),
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

  return (
    <div className="space-y-6" role="main" aria-label="Admin Dashboard Main Content">
      <h1 className="text-2xl sm:text-3xl font-bold text-church-burgundy" tabIndex={-1} id="dashboard-title">
        Admin Dashboard
      </h1>
      <p className="text-gray-600 mb-6">Quick overview of your church management system</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/admin/Members")}>
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
        <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/admin/Donations")}>
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
        <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/admin/Events")}>
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
        <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/admin/Appointments")}>
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
        <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/admin/Testimonials")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" /> Testimonials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "-" : stats.testimonials}</div>
            <CardDescription>Member testimonials</CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
