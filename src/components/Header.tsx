
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Globe, Menu, X } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useState } from "react";

const Header: React.FC = () => {
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "am" : "en");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-gradient-to-r from-church-burgundy via-church-burgundy to-church-burgundy/95 text-white relative shadow-lg">
      {/* Enhanced Flag-inspired horizontal bars at the top */}
      <div className="w-full flex h-3">
        <div className="bg-gradient-to-r from-green-600 to-green-500 flex-1 flag-green"></div>
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 flex-1 flag-yellow"></div>
        <div className="bg-gradient-to-r from-red-600 to-red-500 flex-1 flag-red"></div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0 group">
            <div className="w-20 h-20 md:w-24 md:h-24 mr-4 rounded-full overflow-hidden border-4 border-church-gold shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl">
              <img
                src="/images/church-icon.png"
                alt="St. Gabriel Icon"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-col items-start">
              <div className="flex items-center">
                <h1
                  className="text-xl md:text-3xl lg:text-4xl font-bold text-white leading-tight"
                  style={{
                    textShadow:
                      "2px 2px 4px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.6)",
                  }}
                >
                  {language === "en"
                    ? "Debre Bisrat Dagimawi Kulibi St.Gabriel church"
                    : "ደብረ ብሥራት ዳግማዊ ቁልቢ ቅዱስ ገብርኤል ቤተክርስቲያን"}
                </h1>
                <div className="hidden md:block w-10 h-6 ml-3 overflow-hidden rounded shadow-sm">
                  <img
                    src="/images/church-flag.png"
                    alt="Ethiopian Orthodox Church Flag"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <p className="text-sm md:text-base lg:text-lg church-subtitle mt-2 font-semibold">
                {language === "en"
                  ? "Ethiopian Orthodox Tewahedo Church"
                  : "የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን"}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-center bg-church-gold hover:bg-church-gold/90 text-church-burgundy rounded-full px-4 py-2 mr-4 shadow-md transition-all hover:shadow-lg hover:scale-105 font-medium"
              aria-label="Change language"
            >
              <Globe size={18} />
              <span className="ml-2 text-sm font-semibold">
                {t("language_switch")}
              </span>
            </button>

            <button
              className="md:hidden bg-church-gold/20 hover:bg-church-gold/30 text-church-gold p-3 rounded-lg transition-all"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <nav
          className={`mt-6 ${mobileMenuOpen ? "block animate-slide-in" : "hidden md:block"}`}
        >
          <ul className="flex flex-col md:flex-row md:flex-wrap justify-center md:justify-start md:space-x-2">
            <li className="py-1 md:py-0">
              <Link
                to="/"
                className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("home")}
              </Link>
            </li>
            <li className="py-2 md:py-0">
              <Link
                to="/about"
                className={`nav-link ${location.pathname === "/about" ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("about")}
              </Link>
            </li>
            <li className="py-2 md:py-0">
              <Link
                to="/services"
                className={`nav-link ${location.pathname === "/services" ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("services")}
              </Link>
            </li>
            <li className="py-2 md:py-0">
              <Link
                to="/sermons"
                className={`nav-link ${location.pathname === "/sermons" ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {language === "en" ? "Sermons" : "ስብከቶች"}
              </Link>
            </li>
            <li className="py-2 md:py-0">
              <Link
                to="/events"
                className={`nav-link ${location.pathname === "/events" ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("events")}
              </Link>
            </li>
            <li className="py-2 md:py-0">
              <Link
                to="/gallery"
                className={`nav-link ${location.pathname === "/gallery" ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("gallery")}
              </Link>
            </li>
            <li className="py-2 md:py-0">
              <Link
                to="/donation"
                className={`nav-link ${location.pathname === "/donation" ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("donation")}
              </Link>
            </li>
            <li className="py-2 md:py-0">
              <Link
                to="/membership"
                className={`nav-link ${location.pathname === "/membership" ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("membership")}
              </Link>
            </li>
            <li className="py-2 md:py-0">
              <Link
                to="/contact"
                className={`nav-link ${location.pathname === "/contact" ? "active" : ""}`}
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
