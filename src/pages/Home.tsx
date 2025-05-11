
import React from 'react';
import ImageSlider from '../components/ImageSlider';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { Book, Bell, Calendar, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625',
    title: 'Welcome to St. Gabriel Church',
    content: 'Join us in worship and community',
  },
  {
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742',
    title: 'Our Faith Community',
    content: 'Growing together in faith and fellowship',
  },
  {
    image: 'https://images.unsplash.com/photo-1473177104440-ffee2f376098',
    title: 'Worship with Us',
    content: 'Experience the Ethiopian Orthodox tradition',
  },
];

const Home: React.FC = () => {
  const { t, language } = useLanguage();
  
  return (
    <Layout>
      <ImageSlider slides={slides} />
      
      <section className="py-12 px-6">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="eth-cross"></div>
              <h1 className="text-4xl md:text-5xl font-serif mb-2 eth-title">
                {language === 'en' ? 
                  "Welcome to Debre Bisrat Dagimawi Kulibi St. Gabriel" : 
                  "እንኳን ወደ ደብረ ብሥራት ዳግማዊ ቁልቢ ቅዱስ ገብርኤል በሰላም መጡ"
                }
              </h1>
              <div className="eth-cross"></div>
            </div>
            
            <p className="text-xl mb-4 text-church-dark">
              {language === 'en' ? 
                "Ethiopian Orthodox Tewahedo Church, Silver Spring, Maryland" :
                "የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን, ሲልቨር ስፕሪንግ, ሜሪላንድ"
              }
            </p>
            
            <p className={`text-2xl mb-8 ${language === 'am' ? 'font-amharic' : ''}`}>
              {language === 'en' ? 
                "In the name of the Father, the Son, and the Holy Spirit, one God, Amen." :
                "በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ አሜን።"
              }
            </p>

            <div className="mt-12 mb-8">
              <Link 
                to="/about"
                className="bg-church-burgundy text-white px-8 py-3 rounded-md hover:bg-church-burgundy/80 transition-colors flex items-center justify-center mx-auto w-fit"
              >
                <span>{t("learn_more")}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif mb-8 text-center eth-title">{t("biblical_wisdom")}</h2>
            
            <div className="eth-border">
              <div className="bg-church-cream p-8 rounded-lg">
                <p className="text-xl mb-4 italic">
                  "Give, and it will be given to you. A good measure, pressed down, shaken together and running over, 
                  will be poured into your lap. For with the measure you use, it will be measured to you."
                </p>
                <p className="text-right text-church-burgundy font-semibold">
                  Luke 6:38, NIV
                </p>
                
                <div className="flex justify-center my-4">
                  <div className="h-px bg-church-gold w-24"></div>
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

      <section className="py-12 px-6 cross-pattern">
        <div className="container mx-auto">
          <h2 className="text-3xl font-serif mb-10 text-center eth-title">{t("our_community")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="eth-card hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <Bell size={36} className="text-church-gold" />
                </div>
                <h3 className="text-2xl font-serif mb-4 text-center">{t("worship")}</h3>
                <p className="mb-4 text-center">{t("worship_desc")}</p>
                <Link to="/services" className="text-church-burgundy hover:underline block text-center">{t("find_schedule")} →</Link>
              </div>
            </div>
            
            <div className="eth-card hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <Users size={36} className="text-church-gold" />
                </div>
                <h3 className="text-2xl font-serif mb-4 text-center">{t("community")}</h3>
                <p className="mb-4 text-center">{t("community_desc")}</p>
                <Link to="/about" className="text-church-burgundy hover:underline block text-center">{t("learn_about_us")} →</Link>
              </div>
            </div>
            
            <div className="eth-card hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <Calendar size={36} className="text-church-gold" />
                </div>
                <h3 className="text-2xl font-serif mb-4 text-center">{t("events")}</h3>
                <p className="mb-4 text-center">{t("events_desc")}</p>
                <Link to="/events" className="text-church-burgundy hover:underline block text-center">{t("view_calendar")} →</Link>
              </div>
            </div>
            
            <div className="eth-card hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <Book size={36} className="text-church-gold" />
                </div>
                <h3 className="text-2xl font-serif mb-4 text-center">{t("teachings")}</h3>
                <p className="mb-4 text-center">{t("teachings_desc")}</p>
                <Link to="/about" className="text-church-burgundy hover:underline block text-center">{t("learn_more")} →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
