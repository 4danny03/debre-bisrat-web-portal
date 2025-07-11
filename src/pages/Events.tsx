import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";
import { api } from "@/integrations/supabase/api";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Clock,
  RefreshCw,
  Church,
  Users,
  BookOpen,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataRefresh } from "@/hooks/useDataRefresh";

// Placeholder Events Component
const PlaceholderEvents = () => {
  const { language } = useLanguage();

  const placeholderEvents = [
    {
      id: "placeholder-1",
      title: language === "en" ? "Sunday Divine Liturgy" : "የእሁድ ቅዳሴ",
      description:
        language === "en"
          ? "Join us every Sunday for our traditional Divine Liturgy service. Experience the ancient traditions of the Ethiopian Orthodox Tewahedo Church."
          : "በየእሁድ ለባህላዊ የቅዳሴ አገልግሎታችን ይቀላቀሉን። የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያንን ጥንታዊ ወጎች ይለማመዱ።",
      date: "Every Sunday",
      time: "7:00 AM - 12:00 PM",
      location: "Main Sanctuary",
      image: "/images/gallery/church-service.jpg",
      icon: Church,
    },
    {
      id: "placeholder-2",
      title:
        language === "en"
          ? "St. Gabriel Monthly Commemoration"
          : "የቅዱስ ገብርኤል ወርሃዊ ተዝካር",
      description:
        language === "en"
          ? "Monthly celebration honoring St. Gabriel the Archangel, our church's patron saint. Special prayers and blessings."
          : "የቤተክርስቲያናችንን ጠባቂ ቅዱስ ገብርኤል መልአከ አምላክን የሚያከብር ወርሃዊ በዓል። ልዩ ጸሎቶች እና በረከቶች።",
      date: "19th of Every Month",
      time: "10:00 AM - 2:00 PM",
      location: "Church Grounds",
      image: "/images/religious/palm-sunday.jpg",
      icon: Church,
    },
    {
      id: "placeholder-3",
      title:
        language === "en"
          ? "Sunday School for Children"
          : "የሰንበት ትምህርት ቤት ለልጆች",
      description:
        language === "en"
          ? "Educational program for children ages 5-12. Learn about Orthodox faith, Bible stories, and Ethiopian traditions."
          : "ከ5-12 ዓመት ለሆኑ ልጆች የትምህርት ፕሮግራም። ስለ ኦርቶዶክስ እምነት፣ የመጽሐፍ ቅዱስ ታሪኮች እና የኢትዮጵያ ወጎች ይማሩ።",
      date: "Every Sunday",
      time: "9:00 AM - 12:00 PM",
      location: "Education Hall",
      image: "/images/gallery/ceremony-1.jpg",
      icon: BookOpen,
    },
    {
      id: "placeholder-4",
      title: language === "en" ? "Community Fellowship" : "የማህበረሰብ ህብረት",
      description:
        language === "en"
          ? "Monthly community gathering for fellowship, sharing meals, and strengthening bonds within our church family."
          : "ለህብረት፣ ምግብ ለመካፈል እና በቤተክርስቲያን ቤተሰባችን ውስጥ ትስስርን ለማጠናከር ወርሃዊ የማህበረሰብ ስብሰባ።",
      date: "First Saturday of Every Month",
      time: "2:00 PM - 6:00 PM",
      location: "Community Hall",
      image: "/images/gallery/ceremony-2.jpg",
      icon: Users,
    },
    {
      id: "placeholder-5",
      title: language === "en" ? "Youth Program" : "የወጣቶች ፕሮግራም",
      description:
        language === "en"
          ? "Weekly program for teenagers focusing on spiritual growth, community service, and cultural activities."
          : "በመንፈሳዊ ዕድገት፣ የማህበረሰብ አገልግሎት እና የባህል ስራዎች ላይ የሚያተኩር ለወጣቶች ሳምንታዊ ፕሮግራም።",
      date: "Every Saturday",
      time: "3:00 PM - 6:00 PM",
      location: "Youth Center",
      image: "/images/gallery/ceremony-3.jpg",
      icon: Users,
    },
    {
      id: "placeholder-6",
      title: language === "en" ? "Amharic Language Classes" : "የአማርኛ ቋንቋ ትምህርት",
      description:
        language === "en"
          ? "Learn to read and write in Amharic. Classes for all ages to connect with Ethiopian heritage and culture."
          : "አማርኛ ማንበብና መጻፍ ይማሩ። ከኢትዮጵያዊ ሀረግ እና ባህል ጋር ለመገናኘት ለሁሉም ዕድሜ ክፍሎች።",
      date: "Every Saturday",
      time: "10:00 AM - 12:00 PM",
      location: "Language Center",
      image: "/images/gallery/timket.jpg",
      icon: BookOpen,
    },
  ];

  return (
    <div>
      <div className="text-center py-8 mb-8 bg-church-cream/30 rounded-lg">
        <h3 className="text-2xl font-bold text-church-burgundy mb-2">
          {language === "en"
            ? "Regular Church Activities"
            : "መደበኛ የቤተክርስቲያን ስራዎች"}
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {language === "en"
            ? "While we don't have specific upcoming events scheduled, here are our regular activities and services that happen throughout the year."
            : "ልዩ የወደፊት ዝግጅቶች ባይኖሩንም፣ በዓመቱ ውስጥ የሚካሄዱ መደበኛ ስራዎቻችን እና አገልግሎቶቻችን እነኚሁ ናቸው።"}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {placeholderEvents.map((event) => {
          const IconComponent = event.icon;
          return (
            <Card
              key={event.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-56 bg-cover bg-center relative overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // Enhanced fallback system for placeholder events
                    if (target.src.includes("church-service.jpg")) {
                      target.src = "/images/gallery/church-gathering.jpg";
                    } else if (target.src.includes("church-gathering.jpg")) {
                      target.src = "/images/gallery/ceremony-1.jpg";
                    } else if (target.src.includes("ceremony-1.jpg")) {
                      target.src = "/images/gallery/timket.jpg";
                    } else {
                      target.src = "/images/gallery/church-service.jpg";
                    }
                  }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <IconComponent className="h-12 w-12 text-white" />
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-church-burgundy mb-2">
                  {event.title}
                </h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">{event.date}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm">{event.time}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">{event.location}</span>
                </div>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  {event.description}
                </p>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    className="text-church-burgundy border-church-burgundy hover:bg-church-burgundy hover:text-white"
                  >
                    {language === "en" ? "Learn More" : "ተጨማሪ መረጃ"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
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

// Religious event images mapping with verified paths
const religiousEventImages = [
  "/images/religious/palm-sunday.jpg",
  "/images/religious/crucifixion.jpg",
  "/images/religious/procession.jpg",
  "/images/gallery/timket.jpg",
  "/images/gallery/church-service.jpg",
  "/images/gallery/church-gathering.jpg",
  "/images/gallery/ceremony-1.jpg",
  "/images/gallery/ceremony-2.jpg",
  "/images/gallery/ceremony-3.jpg",
];

// Function to get a religious image based on event data
const getReligiousImage = (event: Event): string => {
  // If the event already has an image, use it
  if (event.image_url) return event.image_url;

  // Otherwise, assign a religious image based on the event id (for consistency)
  const imageIndex =
    parseInt(event.id.charAt(0), 16) % religiousEventImages.length;
  return religiousEventImages[imageIndex];
};

export default function Events() {
  const { t } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await api.events.getEvents();
      const validatedData = Array.isArray(data) ? data : [];
      setEvents(validatedData);
    } catch (error) {
      console.error("Error loading events:", error);
      // Don't show error to user for background refreshes
      if (events.length === 0) {
        // Only show error if we have no events to display
        console.error("Failed to load events on initial load");
        setEvents([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Removed data refresh hook to prevent circular dependencies

  const handleManualRefresh = async () => {
    console.log("Manual refresh triggered for events");
    await loadEvents();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-church-burgundy mb-4">
            {t("events") || "Church Events"}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-4">
            Join us for our upcoming events and celebrations. Our church hosts
            various activities throughout the year for all members of our
            community.
          </p>
          <Button
            onClick={handleManualRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
            className="inline-flex items-center"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh Events
          </Button>
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
                <div className="h-56 bg-cover bg-center relative overflow-hidden">
                  <img
                    src={getReligiousImage(event)}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Enhanced fallback system for placeholder events
                      if (target.src.includes("church-service.jpg")) {
                        target.src = "/images/gallery/church-gathering.jpg";
                      } else if (target.src.includes("church-gathering.jpg")) {
                        target.src = "/images/gallery/ceremony-1.jpg";
                      } else if (target.src.includes("ceremony-1.jpg")) {
                        target.src = "/images/gallery/timket.jpg";
                      } else {
                        target.src = "/images/gallery/church-service.jpg";
                      }
                    }}
                  />
                </div>
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
          <PlaceholderEvents />
        )}
      </div>
    </Layout>
  );
}
