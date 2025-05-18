import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Menu, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';

const Header: React.FC = () => {
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'am' : 'en');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-church-burgundy text-white relative">
      {/* Flag-inspired horizontal bars at the top */}
      <div className="w-full flex">
        <div className="h-2 bg-church-green flex-1"></div>
        <div className="h-2 bg-church-yellow flex-1"></div>
        <div className="h-2 bg-church-red flex-1"></div>
      </div>
      
      <div className="container mx-auto px-4 py-5">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-16 h-16 mr-3 rounded-full overflow-hidden border-2 border-church-gold">
              <img 
                src="/images/church-icon.png" 
                alt="St. Gabriel Icon" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex flex-col items-start">
              <div className="flex items-center">
                <h1 className="text-xl md:text-2xl font-serif text-church-gold">
                  {language === 'en' ? (
                    "Debre Bisrat Dagimawi Kulibi St.Gabriel church"
                  ) : (
                    "ደብረ ብሥራት ዳግማዊ ቁልቢ ቅዱስ ገብርኤል ቤተክርስቲያን"
                  )}
                </h1>
                <div className="hidden md:block w-8 h-5 ml-2 overflow-hidden">
                  <img 
                    src="/images/church-flag.png" 
                    alt="Ethiopian Orthodox Church Flag" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <p className="text-xs md:text-sm">
                {language === 'en' ? (
                  "Ethiopian Orthodox Tewahedo Church"
                ) : (
                  "የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን"
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <button 
              onClick={toggleLanguage} 
              className="flex items-center justify-center bg-church-gold text-church-burgundy rounded-full p-2 mr-4"
              aria-label="Change language"
            >
              <Globe size={16} />
              <span className="ml-1 text-sm">{t("language_switch")}</span>
            </button>
            
            <button 
              className="md:hidden bg-church-burgundy text-church-gold p-2"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <nav className={`mt-4 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
          <ul className="flex flex-col md:flex-row md:flex-wrap justify-center md:justify-start md:space-x-4">
            <li className="py-2 md:py-0">
              <Link 
                to="/" 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("home")}
              </Link>
            </li>
            <li className="py-2 md:py-0">
              <Link 
                to="/about" 
                className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("about")}
              </Link>
            </li>
            <li className="py-2 md:py-0">
              <Link 
                to="/services" 
                className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("services")}
              </Link>
            </li>
            <li className="py-2 md:py-0">
              <Link 
                to="/events" 
                className={`nav-link ${location.pathname === '/events' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("events")}
              </Link>
            </li>
            <li className="py-2 md:py-0">
              <Link 
                to="/gallery" 
                className={`nav-link ${location.pathname === '/gallery' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("gallery")}
              </Link>
            </li>
            <li className="py-2 md:py-0">
              <Link 
                to="/donation" 
                className={`nav-link ${location.pathname === '/donation' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("donation")}
              </Link>
            </li>
            <li className="py-2 md:py-0">
              <Link 
                to="/membership" 
                className={`nav-link ${location.pathname === '/membership' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("membership")}
              </Link>
            </li>
            <li className="py-2 md:py-0">
              <Link 
                to="/contact" 
                className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
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
