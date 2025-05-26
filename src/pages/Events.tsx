import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";
import { api } from "@/integrations/supabase/api";
import { format } from "date-fns";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  image_url: string | null;
  is_featured: boolean;
  created_at: string;
}

export default function Events() {
  const { t } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await api.events.getEvents();
      setEvents(data || []);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-church-burgundy mb-4">
            {t("events") || "Church Events"}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join us for our upcoming events and celebrations. Our church hosts
            various activities throughout the year for all members of our
            community.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-10 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                {event.image_url ? (
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${event.image_url})` }}
                  />
                ) : (
                  <div className="h-48 bg-church-burgundy/10 flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-church-burgundy/30" />
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-church-burgundy mb-2">
                    {event.title}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-4">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {format(new Date(event.event_date), "MMMM d, yyyy")}
                    </span>
                    {event.event_time && (
                      <>
                        <Clock className="h-4 w-4 ml-4 mr-2" />
                        <span>{event.event_time}</span>
                      </>
                    )}
                  </div>
                  {event.location && (
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {event.description}
                  </p>
                  <div className="flex justify-between">
                    <Button variant="outline" className="text-church-burgundy">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-600">
              No upcoming events at this time.
            </h3>
            <p className="mt-2 text-gray-500">
              Please check back later for future events.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
