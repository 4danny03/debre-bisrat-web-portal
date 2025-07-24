import React, { useState, useEffect, useCallback, useMemo } from "react";
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
    <section className="py-20 lg:py-24 bg-gradient-to-br from-church-cream/30 via-white to-church-cream/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-church-burgundy/5 via-transparent to-church-gold/5"></div>
      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-church-burgundy rounded-full mb-6">
            <Church size={32} className="text-church-gold" />
          </div>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-serif text-church-burgundy mb-4">
            {language === "en" ? "Words of Wisdom" : "የጥበብ ቃላት"}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-church-gold to-transparent mx-auto"></div>
        </div>

        <div
          className="relative bg-gradient-to-br from-white via-white to-church-cream/50 rounded-2xl shadow-2xl border border-church-gold/20 max-w-5xl mx-auto animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
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
  const fallbackEvents = useMemo(
    () => [
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
        image_url:
          import.meta.env.BASE_URL + "images/religious/church-service.jpg",
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
        image_url:
          import.meta.env.BASE_URL + "images/gallery/church-service.jpg",
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
        image_url:
          import.meta.env.BASE_URL + "images/gallery/church-service.jpg",
        is_featured: false,
        created_at: new Date().toISOString(),
      },
    ],
    [language],
  );

  const fetchUpcomingEvents = useCallback(async () => {
    try {
      setLoadingEvents(true);
      const data = await api.events.getUpcomingEvents(3);

      if (Array.isArray(data) && data.length > 0) {
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
  }, [fallbackEvents]);

  useEffect(() => {
    fetchUpcomingEvents();
  }, [fetchUpcomingEvents]);

  // Slides for the image slider with new church images
  const sliderContent = [
    {
      image:
        import.meta.env.BASE_URL + "images/gallery/church-procession-1.jpg",
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
      image:
        import.meta.env.BASE_URL + "images/gallery/church-ceremony-new.jpg",
      title: language === "en" ? "Sacred Ceremony" : "ቅዱስ ሥርዓት",
      content:
        language === "en"
          ? "Celebrating our faith through traditional Orthodox ceremonies"
          : "በባህላዊ ኦርቶዶክስ ሥርዓቶች እምነታችንን እናከብራለን",
    },
    {
      image: import.meta.env.BASE_URL + "images/gallery/church-celebration.jpg",
      title: language === "en" ? "Community Celebration" : "የማህበረሰብ በዓል",
      content:
        language === "en"
          ? "United in faith, celebrating God's blessings together"
          : "በእምነት አንድ ሆነን የእግዚአብሔርን በረከት በአንድነት እናከብራለን",
    },
    {
      image: import.meta.env.BASE_URL + "images/gallery/church-gathering.jpg",
      title: language === "en" ? "Faithful Gathering" : "የምእመናን ስብሰባ",
      content:
        language === "en"
          ? "Our community comes together in worship and fellowship"
          : "ማህበረሰባችን በአምልኮ እና በህብረት ይሰበሰባል",
    },
    {
      image: import.meta.env.BASE_URL + "images/gallery/timket.jpg",
      title: language === "en" ? "Timket Celebration" : "የጥምቀት በዓል",
      content:
        language === "en"
          ? "Celebrating the baptism of Jesus Christ in the Jordan River"
          : "የኢየሱስ ክርስቶስ በዮርዳኖስ ወንዝ ጥምቀትን የምናከብርበት",
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Enhanced Image Slider Section */}
        <section className="mb-16 lg:mb-20">
          <div className="animate-slide-up">
            <ImageSlider slides={sliderContent} />
          </div>
        </section>

        {/* Enhanced Two Column Section for Events and Donation */}
        <section className="py-20 lg:py-24">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-church-burgundy mb-4 animate-slide-up">
                {language === "en" ? "Stay Connected" : "ተገናኙ"}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-church-gold to-transparent mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-slide-up">
                {language === "en"
                  ? "Discover upcoming events and support our mission through your generous contributions."
                  : "የሚመጡ ዝግጅቶችን ያግኙ እና በልግስ አስተዋፅዖዎ ተልዕኮአችንን ይደግፉ።"}
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
              {/* Enhanced Upcoming Events Column */}
              <div
                className="eth-card animate-slide-up"
                style={{ animationDelay: "0.2s" }}
              >
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
              <div
                className="eth-card animate-slide-up"
                style={{ animationDelay: "0.4s" }}
              >
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
