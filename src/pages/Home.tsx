import React from "react";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import { Calendar, DollarSign, Church } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import ImageSlider from "../components/ImageSlider";

const Home: React.FC = () => {
  const { t, language } = useLanguage();

  // Sample upcoming events data
  const upcomingEvents = [
    {
      date: "May 19, 2025",
      title:
        language === "en"
          ? "St. Gabriel Monthly Commemoration"
          : "የቅዱስ ገብርኤል ወርሃዊ ተዝካር",
      image: "/images/religious/church-service.jpg",
    },
    {
      date: "May 25, 2025",
      title:
        language === "en"
          ? "Sunday School for Children"
          : "የሰንበት ትምህርት ቤት ለልጆች",
      image: "/images/gallery/church/church-service.jpg",
    },
    {
      date: "June 19, 2025",
      title:
        language === "en"
          ? "Church Foundation Anniversary"
          : "የቤተክርስቲያን መሰረት የተጣለበት ቀን",
      image: "/images/gallery/church-service.jpg",
    },
  ];

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
  ];

  return (
    <Layout>
      {/* Mid-page Image Slider Section */}
      <section className="relative">
        <ImageSlider slides={sliderContent} />
      </section>

      {/* Two Column Section for Events and Donation */}
      <section className="py-12 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Upcoming Events Column */}
            <div className="eth-card eth-flag-ribbon nostalgic-paper">
              <div className="bg-church-burgundy text-white p-4 flex items-center">
                <Calendar size={24} className="text-church-gold mr-2" />
                <h2 className="text-2xl font-serif">{t("upcoming_events")}</h2>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <li
                      key={index}
                      className="border-b border-church-gold/30 pb-3 last:border-0 flex items-start"
                    >
                      <div className="flex-1">
                        <p className="text-sm text-church-burgundy font-semibold">
                          {event.date}
                        </p>
                        <p className="text-lg">{event.title}</p>
                      </div>
                      {event.image && (
                        <div className="w-20 h-20 rounded-md overflow-hidden ml-3 flex-shrink-0">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link to="/events">
                    <Button className="bg-church-burgundy hover:bg-church-burgundy/90 text-white font-semibold">
                      {t("view all")} →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Donation Column */}
            <div className="eth-card eth-flag-ribbon nostalgic-paper">
              <div className="bg-church-burgundy text-white p-4 flex items-center">
                <DollarSign size={24} className="text-church-gold mr-2" />
                <h2 className="text-2xl font-serif">
                  {t("support_our_church")}
                </h2>
              </div>
              <div className="p-6">
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

      {/* Wisdom Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif mb-8 text-center eth-title">
              <span className="inline-flex items-center">
                <Church size={22} className="text-church-burgundy mr-2" />
                {t("")}
              </span>
            </h2>

            <div className="eth-border nostalgic-paper">
              <div className="p-8 rounded-lg">
                <p className="text-xl mb-4 italic">
                  "Give, and it will be given to you. A good measure, pressed
                  down, shaken together and running over, will be poured into
                  your lap. For with the measure you use, it will be measured to
                  you."
                </p>
                <p className="text-right text-church-burgundy font-semibold">
                  Luke 6:38, NIV
                </p>

                <div className="flex justify-center my-4">
                  <div className="h-px w-8 bg-church-green"></div>
                  <div className="h-px w-8 bg-church-yellow"></div>
                  <div className="h-px w-8 bg-church-red"></div>
                </div>

                <p className="text-xl mt-6 mb-4 font-amharic italic">
                  "ስጡ፥ ይሰጣችሁማል፤ መልካም መስፈሪያ የተደቆሰ የተነቀነቀ የተትረፈረፈ በኩራባችሁ ይሰጣችሁማል፤
                  በምትሰፍሩበት መስፈሪያ ይሰፈርላችሁማልና።"
                </p>
                <p className="text-right text-church-burgundy font-semibold font-amharic">
                  ሉቃስ 6:38
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
