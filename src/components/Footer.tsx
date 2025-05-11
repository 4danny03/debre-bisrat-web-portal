
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPin, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  
  return (
    <footer className="bg-church-burgundy text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-xl font-serif text-church-gold mb-3">
              {language === 'en' 
                ? "Debre Bisrat St. Gabriel Church" 
                : "ደብረ ብሥራት ቅዱስ ገብርኤል ቤተክርስቲያን"}
            </h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <MapPin size={18} className="text-church-gold mr-2" />
                <address className="not-italic">
                  16020 Batson Rd, Spencerville, MD 20868
                </address>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="text-church-gold mr-2" />
                <p>(240)-381-8146</p>
              </div>
              <div className="flex items-center">
                <Mail size={18} className="text-church-gold mr-2" />
                <p>info@stgabrielmd.org</p>
              </div>
            </div>
          </div>

          <div className="mb-6 md:mb-0">
            <h3 className="text-church-gold text-lg mb-3">
              {language === 'en' ? "Quick Links" : "ፈጣን አገናኞች"}
            </h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-church-gold transition-colors">{t("home")}</Link></li>
              <li><Link to="/about" className="hover:text-church-gold transition-colors">{t("about")}</Link></li>
              <li><Link to="/services" className="hover:text-church-gold transition-colors">{t("services")}</Link></li>
              <li><Link to="/donation" className="hover:text-church-gold transition-colors">{t("donation")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-church-gold text-lg mb-3">
              {language === 'en' ? "Connect With Us" : "ከእኛ ጋር ይገናኙ"}
            </h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.facebook.com/EthiopianOrthodoxSt.GabrielChurchSilverspringMD" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-church-gold transition-colors"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a 
                  href="https://stgabrielmd.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-church-gold transition-colors"
                >
                  {language === 'en' ? "Official Website" : "ይፋዊ ድረ-ገጽ"}
                </a>
              </li>
              <li>
                <Link to="/contact" className="hover:text-church-gold transition-colors">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/20 text-center text-sm">
          <p>{t("copyright")}</p>
          <p className="mt-2">
            {language === 'en' 
              ? "Visit us at our church location for worship services and community events." 
              : "ለአምልኮ አገልግሎቶች እና የማህበረሰብ ዝግጅቶች በቤተክርስቲያናችን ይጎብኙን።"}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
