
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
        </div>
      </div>
    </section>
  );
};

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

const Home: React.FC = () => {
  const { t, language } = useLanguage();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Fallback events if no database events are available
  const fallbackEvents = [
    {
      id: "fallback-1",
      title:
        language === "en"
          ? "St. Gabriel Monthly Commemoration"
          : "የቅዱስ ገብርኤል ወርሃዊ ተዝካር",
      description: null,
      event_date: "2025-05-19",
      event_time: "10:00",
      location: null,
      image_url: "/images/religious/church-service.jpg",
      is_featured: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "fallback-2",
      title:
        language === "en"
          ? "Sunday School for Children"
          : "የሰንበት ትምህርት ቤት ለልጆች",
      description: null,
      event_date: "2025-05-25",
      event_time: "09:00",
      location: null,
      image_url: "/images/gallery/church-service.jpg",
      is_featured: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "fallback-3",
      title:
        language === "en"
          ? "Church Foundation Anniversary"
          : "የቤተክርስቲያን መሰረት የተጣለበት ቀን",
      description: null,
      event_date: "2025-06-19",
      event_time: "11:00",
      location: null,
      image_url: "/images/gallery/church-service.jpg",
      is_featured: false,
      created_at: new Date().toISOString(),
    },
  ];

  const fetchUpcomingEvents = useCallback(async () => {
    try {
      setLoadingEvents(true);
      const data = await api.events.getUpcomingEvents(3);

      if (data && data.length > 0) {
        setUpcomingEvents(data);
      } else {
        // Use fallback events if no database events
        setUpcomingEvents(fallbackEvents);
      }
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      // Use fallback events on error
      setUpcomingEvents(fallbackEvents);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcomingEvents();
  }, [fetchUpcomingEvents]);

  // Removed data refresh hook to prevent circular dependencies

  // Slides for the image slider
  const sliderContent = [
    {
      image: "/images/gallery/church-front.jpg",
      title:
        language === "en"
          ? "Welcome to Our Church"
          : "ወደ ቤተክርስቲያናችን እንኳን ደህና መጡ",
      content:
        language === "en"
          ? "Debre Bisrat Dagimawi Kulibi St.Gabriel Ethiopian Orthodox Tewahedo Church"
          : "ደብረ ብሥራት ዳግማዊ ቁልቢ ቅዱስ ገብርኤል ቤተክርስቲያን",
    },
    {
      image: "/images/religious/palm-sunday.jpg",
      title: language === "en" ? "Palm Sunday" : "ሆሳዕና",
      content:
        language === "en"
          ? "Commemorating Jesus's triumphal entry into Jerusalem"
          : "የኢየሱስ ክርስቶስ ወደ ኢየሩሳሌም መግባትን የሚያስታውስ",
    },
    {
      image: "/images/gallery/church-service.jpg",
      title: language === "en" ? "Holy Sacrifice" : "ቅዱስ መስዋዕት",
      content:
        language === "en"
          ? "Remembering the sacrifice of our Lord Jesus Christ"
          : "የጌታችን የኢየሱስ ክርስቶስን መስዋዕትነት የምናስታውስበት",
    },
    {
      image: "/images/gallery/timket.jpg",
      title: language === "en" ? "Timket Celebration" : "የጥምቀት በዓል",
      content:
        language === "en"
          ? "Celebrating the baptism of Jesus Christ in the Jordan River"
          : "የኢየሱስ ክርስቶስ በዮርዳኖስ ወንዝ ጥምቀትን የምናከብርበት",
    },
    {
      image: "/images/religious/crucifixion.jpg",
      title: language === "en" ? "Good Friday" : "ስቅለት",
      content:
        language === "en"
          ? "Remembering the crucifixion and death of our Lord Jesus Christ"
          : "የጌታችን የኢየሱስ ክርስቶስን መስቀል እና ሞት የምናስታውስበት",
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Image Slider Section */}
        <section className="mb-12 lg:mb-16">
          <ImageSlider slides={sliderContent} />
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
