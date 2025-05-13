
import React from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Church } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import ImageSlider from '../components/ImageSlider';

const Home: React.FC = () => {
  const { t, language } = useLanguage();
  
  // Sample upcoming events data
  const upcomingEvents = [
    {
      date: "May 14, 2025",
      title: "St. Gabriel Monthly Commemoration"
    },
    {
      date: "May 21, 2025",
      title: "Sunday School for Children"
    },
    {
      date: "June 19, 2025",
      title: "Church Foundation Anniversary"
    }
  ];

  // Slides for the image slider
  const sliderContent = [
    {
      image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625",
      title: language === 'en' ? "Welcome to Our Church" : "ወደ ቤተክርስቲያናችን እንኳን ደህና መጡ",
      content: language === 'en' ? 
        "A place of worship, community, and spiritual growth." : 
        "የአምልኮ፣ የማህበረሰብ እና የመንፈሳዊ እድገት ቦታ።"
    },
    {
      image: "https://images.unsplash.com/photo-1601513197269-427a1b50e9fc",
      title: language === 'en' ? "Join Our Community" : "ማህበረሰባችንን ይቀላቀሉ",
      content: language === 'en' ? 
        "Discover the richness of Ethiopian Orthodox tradition." : 
        "የኢትዮጵያ ኦርቶዶክስ ቅድመ ሁኔታን ሀብት ይወቁ።"
    },
    {
      image: "https://images.unsplash.com/photo-1578530332339-44982d9af50f",
      title: language === 'en' ? "Weekly Services" : "ሳምንታዊ አገልግሎቶች",
      content: language === 'en' ? 
        "Join us for liturgy, prayer, and fellowship." : 
        "ቅዳሴ፣ ጸሎት እና ህብረት ላይ ይቀላቀሉን።"
    }
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
                    <li key={index} className="border-b border-church-gold/30 pb-3 last:border-0">
                      <p className="text-sm text-church-burgundy font-semibold">{event.date}</p>
                      <p className="text-lg">{event.title}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link 
                    to="/events"
                    className="text-church-burgundy hover:text-church-gold transition-colors flex items-center"
                  >
                    {t("view_all_events")} →
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Donation Column */}
            <div className="eth-card eth-flag-ribbon nostalgic-paper">
              <div className="bg-church-burgundy text-white p-4 flex items-center">
                <DollarSign size={24} className="text-church-gold mr-2" />
                <h2 className="text-2xl font-serif">{t("support_our_church")}</h2>
              </div>
              <div className="p-6">
                <p className="mb-6">
                  {language === 'en' ? 
                    "Your generous support helps us maintain our church and community programs. Consider making a donation today." :
                    "የእርስዎ ገንዘባዊ ድጋፍ ቤተ ክርስቲያናችንንና የማህበረሰብ ፕሮግራሞቻችንን እንድንጠብቅ ይረዳናል። ዛሬ ለመለገስ ይፈልጋሉ?"
                  }
                </p>
                
                <div className="flex flex-col space-y-4">
                  <Button className="bg-church-gold hover:bg-church-gold/90 text-church-burgundy font-semibold">
                    {t("donate_now")}
                  </Button>
                  
                  <Link 
                    to="/donation"
                    className="text-church-burgundy hover:text-church-gold transition-colors text-center"
                  >
                    {t("learn_more_about_giving")} →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Biblical Wisdom Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif mb-8 text-center eth-title">
              <span className="inline-flex items-center">
                <Church size={22} className="text-church-burgundy mr-2" />
                {t("biblical_wisdom")}
              </span>
            </h2>
            
            <div className="eth-border nostalgic-paper">
              <div className="p-8 rounded-lg">
                <p className="text-xl mb-4 italic">
                  "Give, and it will be given to you. A good measure, pressed down, shaken together and running over, 
                  will be poured into your lap. For with the measure you use, it will be measured to you."
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
                  "ስጡ፥ ይሰጣችሁማል፤ መልካም መስፈሪያ የተደቆሰ የተነቀነቀ የተትረፈረፈ 
                  በኩራባችሁ ይሰጣችሁማል፤ በምትሰፍሩበት መስፈሪያ ይሰፈርላችሁማልና።"
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
