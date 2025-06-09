
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import NewsletterSubscription from "@/components/NewsletterSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock, Heart, Book, Users } from "lucide-react";

export default function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [featuredSermons, setFeaturedSermons] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      // Get upcoming events
      const today = new Date().toISOString().split('T')[0];
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(3);

      // Get featured sermons
      const { data: sermons } = await supabase
        .from("sermons")
        .select("*")
        .eq("is_featured", true)
        .order("sermon_date", { ascending: false })
        .limit(3);

      // Get site settings
      const { data: siteSettings } = await supabase
        .from("site_settings")
        .select("*")
        .single();

      setUpcomingEvents(events || []);
      setFeaturedSermons(sermons || []);
      setSettings(siteSettings);
    } catch (error) {
      console.error("Error loading home data:", error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Welcome to {settings?.church_name || "St. Gabriel Ethiopian Orthodox Church"}
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of faith, worship, and service. Experience the rich traditions 
            of Ethiopian Orthodox Christianity in a welcoming environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link to="/about">Learn More</Link>
            </Button>
            {settings?.enable_donations && (
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Link to="/donation">
                  <Heart className="h-5 w-5 mr-2" />
                  Donate
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Quick Info */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <CardTitle>Service Times</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p>Sunday Liturgy: 9:00 AM</p>
                <p>Evening Prayer: 6:00 PM</p>
                <p>Wednesday Service: 7:00 PM</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p>{settings?.church_address || "Church Address"}</p>
                <Button asChild variant="link" className="p-0">
                  <Link to="/contact">Get Directions</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <CardTitle>Get Involved</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p>Join our community</p>
                {settings?.enable_membership && (
                  <Button asChild variant="link" className="p-0">
                    <Link to="/membership-registration">Become a Member</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((event: any) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.event_date).toLocaleDateString()}
                      {event.event_time && (
                        <>
                          <Clock className="h-4 w-4 ml-2" />
                          {event.event_time}
                        </>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                    {event.location && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild>
                <Link to="/events">View All Events</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Featured Sermons */}
      {featuredSermons.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Featured Sermons</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredSermons.map((sermon: any) => (
                <Card key={sermon.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{sermon.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Book className="h-4 w-4" />
                      {sermon.scripture_reference}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{sermon.description}</p>
                    <p className="text-sm text-gray-500">
                      Preacher: {sermon.preacher}
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(sermon.sermon_date).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild>
                <Link to="/sermons">View All Sermons</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Subscription */}
      {settings?.enable_newsletter && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
              <p className="text-lg text-gray-600">
                Subscribe to our newsletter to receive updates about church events, 
                announcements, and spiritual reflections.
              </p>
            </div>
            <div className="flex justify-center">
              <NewsletterSubscription />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
