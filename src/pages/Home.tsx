import React, { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import {
  Calendar,
  DollarSign,
  Church,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import ImageSlider from "../components/ImageSlider";
import { api } from "@/integrations/supabase/api";
import { format } from "date-fns";
import { useDataRefresh } from "@/hooks/useDataRefresh";

// Wisdom Slider Component
interface WisdomSliderProps {
  language: string;
}

const WisdomSlider: React.FC<WisdomSliderProps> = ({ language }) => {
  const [currentWisdom, setCurrentWisdom] = useState(0);

  const wisdoms = [
    {
      english:
        "Give, and it will be given to you. A good measure, pressed down, shaken together and running over, will be poured into your lap. For with the measure you use, it will be measured to you.",
      amharic:
        "ስጡ፥ ይሰጣችሁማል፤ መልካም መስፈሪያ የተደቆሰ የተነቀነቀ የተትረፈረፈ በኩራባችሁ ይሰጣችሁማል፤ በምትሰፍሩበት መስፈሪያ ይሰፈርላችሁማልና።",
      reference: "Luke 6:38",
      amharicRef: "ሉቃስ 6:38",
    },
    {
      english:
        "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
      amharic:
        "በሙሉ ልብህ እግዚአብሔርን አምን፥ በራስህም ማስተዋል አትታመን፤ በሁሉም መንገዶችህ አስብበት፥ እርሱም መንገዶችህን ያቀናል።",
      reference: "Proverbs 3:5-6",
      amharicRef: "ምሳሌ 3:5-6",
    },
    {
      english:
        "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
      amharic:
        "እኔ ስለ እናንተ የማስበውን አሳብ አውቃለሁ፥ ይላል እግዚአብሔር፤ የክፋት አሳብ ሳይሆን የሰላም አሳብ ነው፥ የተስፋና የመጨረሻ ዕድል ልሰጣችሁ።",
      reference: "Jeremiah 29:11",
      amharicRef: "ኤርምያስ 29:11",
    },
    {
      english:
        "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
      amharic:
        "ጠንካራና ደፋር ሁን፤ አትፍራ፥ አትደንግጥ፤ እግዚአብሔር አምላክህ የምትሄድበት ሁሉ ከአንተ ጋር ነውና።",
      reference: "Joshua 1:9",
      amharicRef: "ኢያሱ 1:9",
    },
    {
      english:
        "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
      amharic: "እግዚአብሔርን ለሚወዱት፥ በአሳቡም ለተጠሩት ሁሉ ነገር በጎ እንደሚሆን እናውቃለን።",
      reference: "Romans 8:28",
      amharicRef: "ሮሜ 8:28",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWisdom((prev) => (prev + 1) % wisdoms.length);
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, [wisdoms.length]);

  const nextWisdom = () => {
    setCurrentWisdom((prev) => (prev + 1) % wisdoms.length);
  };

  const prevWisdom = () => {
    setCurrentWisdom((prev) => (prev - 1 + wisdoms.length) % wisdoms.length);
  };

  const currentQuote = wisdoms[currentWisdom];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-white to-church-cream/20">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="text-3xl lg:text-4xl font-serif mb-12 text-center text-church-burgundy">
          <span className="inline-flex items-center">
            <Church size={32} className="text-church-burgundy mr-3" />
            {language === "en" ? "Words of Wisdom" : "የጥበብ ቃላት"}
          </span>
        </h2>

        <div className="relative bg-white rounded-lg shadow-xl border-t-4 border-church-gold max-w-4xl mx-auto">
          <div className="p-8 lg:p-12">
            <div className="min-h-[200px] flex flex-col justify-center">
              <p className="text-xl mb-6 italic text-gray-800 leading-relaxed">
                {language === "en"
                  ? currentQuote.english
                  : currentQuote.amharic}
              </p>
              <p className="text-right text-church-burgundy font-semibold text-lg">
                {language === "en"
                  ? currentQuote.reference
                  : currentQuote.amharicRef}
              </p>
            </div>

            <div className="flex justify-center my-6">
              <div className="h-px w-8 bg-green-600"></div>
              <div className="h-px w-8 bg-yellow-400"></div>
              <div className="h-px w-8 bg-red-600"></div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={prevWisdom}
                className="p-2 rounded-full bg-church-burgundy/10 hover:bg-church-burgundy/20 text-church-burgundy transition-colors"
                aria-label="Previous wisdom"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="flex space-x-2">
                {wisdoms.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentWisdom(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentWisdom
                        ? "bg-church-burgundy scale-125"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to wisdom ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextWisdom}
                className="p-2 rounded-full bg-church-burgundy/10 hover:bg-church-burgundy/20 text-church-burgundy transition-colors"
                aria-label="Next wisdom"
              >
                <ChevronRight size={24} />
              </button>
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

  // Use enhanced data refresh hook for events
  useDataRefresh(
    fetchUpcomingEvents,
    5 * 60 * 1000, // Refresh every 5 minutes
    [language],
    "events",
  );

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

        {/* Enhanced Two Column Section for Events and Donation */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Enhanced Upcoming Events Column */}
              <div className="eth-card eth-flag-ribbon nostalgic-paper transform hover:scale-105 transition-all duration-300">
                <div className="bg-gradient-to-r from-church-burgundy to-church-burgundy/90 text-white p-6 flex items-center">
                  <Calendar size={28} className="text-church-gold mr-3" />
                  <h2 className="text-2xl lg:text-3xl font-serif font-bold">
                    {t("upcoming_events")}
                  </h2>
                </div>
                <div className="p-6 lg:p-8">
                  {loadingEvents ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, index) => (
                        <div
                          key={index}
                          className="border-b border-church-gold/30 pb-3 last:border-0 flex items-start animate-pulse"
                        >
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                            <div className="h-5 bg-gray-200 rounded w-48"></div>
                          </div>
                          <div className="w-20 h-20 bg-gray-200 rounded-md ml-3 flex-shrink-0"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {upcomingEvents.map((event) => (
                        <li
                          key={event.id}
                          className="border-b border-church-gold/30 pb-3 last:border-0 flex items-start"
                        >
                          <div className="flex-1">
                            <p className="text-sm text-church-burgundy font-semibold">
                              {format(
                                new Date(event.event_date),
                                "MMMM d, yyyy",
                              )}
                              {event.event_time && (
                                <span className="ml-2 text-xs">
                                  at {event.event_time}
                                </span>
                              )}
                            </p>
                            <p className="text-lg">{event.title}</p>
                            {event.location && (
                              <p className="text-sm text-gray-600 mt-1">
                                {event.location}
                              </p>
                            )}
                          </div>
                          {(event.image_url ||
                            "/images/gallery/church-service.jpg") && (
                            <div className="w-20 h-20 rounded-md overflow-hidden ml-3 flex-shrink-0">
                              <img
                                src={
                                  event.image_url ||
                                  "/images/gallery/church-service.jpg"
                                }
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-6">
                    <Link to="/events">
                      <Button className="bg-church-burgundy hover:bg-church-burgundy/90 text-white font-semibold">
                        {t("view all")} →
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Enhanced Donation Column */}
              <div className="eth-card eth-flag-ribbon nostalgic-paper transform hover:scale-105 transition-all duration-300">
                <div className="bg-gradient-to-r from-church-burgundy to-church-burgundy/90 text-white p-6 flex items-center">
                  <DollarSign size={28} className="text-church-gold mr-3" />
                  <h2 className="text-2xl lg:text-3xl font-serif font-bold">
                    {t("support_our_church")}
                  </h2>
                </div>
                <div className="p-6 lg:p-8">
                  <p className="mb-6">
                    {language === "en"
                      ? "Your generous support helps us maintain our church and community programs. Consider making a donation today."
                      : "የእርስዎ ገንዘባዊ ድጋፍ ቤተ ክርስቲያናችንንና የማህበረሰብ ፕሮግራሞቻችንን እንድንጠብቅ ይረዳናል። ዛሬ ለመለገስ ይፈልጋሉ?"}
                  </p>

                  <div className="flex flex-col space-y-4">
                    <Link to="/donation">
                      <Button className="w-full bg-church-gold hover:bg-church-gold/90 text-church-burgundy font-semibold">
                        {t("donate_now")}
                      </Button>
                    </Link>

                    <Link
                      to="/donation"
                      className="text-church-burgundy hover:text-church-gold transition-colors text-center"
                    ></Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Wisdom Section with Sliding Wisdoms */}
        <WisdomSlider language={language} />
      </div>
    </Layout>
  );
};

export default Home;
