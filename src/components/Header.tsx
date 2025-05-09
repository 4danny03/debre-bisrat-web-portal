
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Header: React.FC = () => {
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'am' : 'en');
  };

  return (
    <header className="bg-church-burgundy text-white">
      <div className="container mx-auto px-4 py-5">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-12 h-12 bg-church-gold rounded-full mr-3"></div>
            <div>
              <h1 className="text-xl md:text-2xl font-serif text-church-gold">
                {language === 'en' ? (
                  "Debre Bisrat St. Gabriel"
                ) : (
                  "ደብረ ብሥራት ቅዱስ ገብርኤል"
                )}
              </h1>
              <p className="text-xs md:text-sm">
                {language === 'en' ? (
                  "Ethiopian Orthodox Tewahedo Church"
                ) : (
                  "የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን"
                )}
              </p>
            </div>
          </div>
          
          <button 
            onClick={toggleLanguage} 
            className="absolute top-4 right-4 md:static flex items-center justify-center bg-church-gold text-church-burgundy rounded-full p-2 md:ml-4"
          >
            <Globe size={16} />
            <span className="ml-1 text-sm">{t("language_switch")}</span>
          </button>
        </div>

        <nav className="mt-4">
          <ul className="flex flex-wrap justify-center md:justify-start space-x-1 md:space-x-4">
            <li>
              <Link 
                to="/" 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                {t("home")}
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
              >
                {t("about")}
              </Link>
            </li>
            <li>
              <Link 
                to="/services" 
                className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`}
              >
                {t("services")}
              </Link>
            </li>
            <li>
              <Link 
                to="/events" 
                className={`nav-link ${location.pathname === '/events' ? 'active' : ''}`}
              >
                {t("events")}
              </Link>
            </li>
            <li>
              <Link 
                to="/gallery" 
                className={`nav-link ${location.pathname === '/gallery' ? 'active' : ''}`}
              >
                {t("gallery")}
              </Link>
            </li>
            <li>
              <Link 
                to="/donation" 
                className={`nav-link ${location.pathname === '/donation' ? 'active' : ''}`}
              >
                {t("donation")}
              </Link>
            </li>
            <li>
              <Link 
                to="/signup" 
                className={`nav-link ${location.pathname === '/signup' ? 'active' : ''}`}
              >
                {t("signup")}
              </Link>
            </li>
            <li>
              <Link 
                to="/contact" 
                className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
              >
                {t("contact")}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
