import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/hooks";
import { api } from "@/integrations/supabase/api";
import { format } from "date-fns";
import LoadingSpinner from "./LoadingSpinner";

interface Profile {
  full_name: string;
  email: string;
  created_at: string;
  status: string;
}

interface Donation {
  amount: number;
  payment_method: string;
  created_at: string;
}

interface Event {
  status: string;
  events: {
    id: string;
    title: string;
    event_date: string;
  };
}

const MemberDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!user?.id) return;
      try {
        const [profileData, donationsData, eventsData] = await Promise.all([
          api.members.getMemberProfile(user.id),
          api.members.getMemberDonations(user.id),
          api.members.getMemberEvents(user.id),
        ]);
        // setProfile(profileData);
        // setDonations(donationsData);
        // setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching member data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [user]);
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 text-center">
        <p className="text-gray-600">
          Please log in to view your member dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-church-burgundy">
        Member Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-church-burgundy text-white flex items-center justify-center text-3xl font-bold mb-4">
            {profile?.full_name?.[0] || user.email?.[0] || "U"}
          </div>
          <div className="text-lg font-semibold mb-1">
            {profile?.full_name || user.email}
          </div>
          <div className="text-gray-500 text-sm mb-2">
            {profile?.email || user.email}
          </div>
          <div className="text-gray-400 text-xs mb-1">
            Member since:{" "}
            {profile?.created_at
              ? format(new Date(profile.created_at), "MMM yyyy")
              : "N/A"}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              profile?.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {profile?.status || "Pending"}
          </span>
        </div>

        {/* Donation History Card */}
        <div className="bg-white rounded-lg shadow p-6 col-span-1 md:col-span-1">
          <div className="font-semibold text-church-burgundy mb-3">
            Recent Donations
          </div>
          <ul className="divide-y divide-gray-100">
            {donations.length > 0 ? (
              donations.slice(0, 3).map((donation, idx) => (
                <li key={idx} className="py-2 flex justify-between text-sm">
                  <span>{format(new Date(donation.created_at), "MMM dd")}</span>
                  <span>${donation.amount}</span>
                  <span className="text-gray-400">
                    {donation.payment_method || "Card"}
                  </span>
                </li>
              ))
            ) : (
              <li className="py-2 text-sm text-gray-500">No donations yet</li>
            )}
          </ul>
        </div>

        {/* Event Registrations Card */}
        <div className="bg-white rounded-lg shadow p-6 col-span-1 md:col-span-1">
          <div className="font-semibold text-church-burgundy mb-3">
            Event Registrations
          </div>
          <ul className="divide-y divide-gray-100">
            {events.length > 0 ? (
              events.slice(0, 3).map((event, idx) => (
                <li key={idx} className="py-2 flex justify-between text-sm">
                  <span>{event.events?.title || "Event"}</span>
                  <span>
                    {event.events?.event_date
                      ? format(new Date(event.events.event_date), "MMM dd")
                      : "TBD"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      event.status === "registered"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {event.status || "Pending"}
                  </span>
                </li>
              ))
            ) : (
              <li className="py-2 text-sm text-gray-500">
                No event registrations
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Extensible area for future widgets */}
      <div className="bg-church-burgundy/5 rounded-lg p-6 text-center text-gray-500">
        More features coming soon: profile editing, payment methods, and more!
      </div>
    </div>
  );
};

export default MemberDashboard;
