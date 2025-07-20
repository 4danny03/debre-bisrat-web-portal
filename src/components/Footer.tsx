import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { MapPin, Phone, Mail } from "lucide-react";

const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-gradient-to-r from-church-burgundy via-church-burgundy to-church-burgundy/95 text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4">
            <h2
              className="text-2xl font-bold text-church-gold mb-4"
              style={{
                textShadow:
                  "2px 2px 4px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.6)",
              }}
            >
              {language === "en"
                ? "Debre Bisrat Dagimawi Kulibi St.Gabriel church"
                : "ደብረ ብሥራት ዳግማዊ ቁልቢ ቅዱስ ገብርኤል ቤተክርስቲያን"}
            </h2>
            <div className="space-y-3">
              <div className="flex items-start group">
                <MapPin
                  size={20}
                  className="text-church-gold mr-3 mt-1 group-hover:scale-110 transition-transform"
                />
                <address className="not-italic leading-relaxed">
                  16020 Batson Rd, Spencerville, MD 20868
                </address>
              </div>
              <div className="flex items-center group">
                <Phone
                  size={20}
                  className="text-church-gold mr-3 group-hover:scale-110 transition-transform"
                />
                <p className="font-medium">(240)-381-8146</p>
              </div>
              <div className="flex items-center group">
                <Mail
                  size={20}
                  className="text-church-gold mr-3 group-hover:scale-110 transition-transform"
                />
                <p className="font-medium">info@stgabrielmd.org</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-church-gold text-xl font-semibold mb-4">
              {language === "en" ? "Quick Links" : "ፈጣን አገናኞች"}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="hover:text-church-gold transition-all hover:translate-x-1 block py-1"
                >
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-church-gold transition-all hover:translate-x-1 block py-1"
                >
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="hover:text-church-gold transition-all hover:translate-x-1 block py-1"
                >
                  {t("services")}
                </Link>
              </li>
              <li>
                <Link
                  to="/donation"
                  className="hover:text-church-gold transition-all hover:translate-x-1 block py-1"
                >
                  {t("donation")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-church-gold text-xl font-semibold mb-4">
              {language === "en" ? "Connect With Us" : "ከእኛ ጋር ይገናኙ"}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.facebook.com/EthiopianOrthodoxSt.GabrielChurchSilverspringMD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-church-gold transition-all hover:translate-x-1 block py-1 font-medium"
                >
                  📘 Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://www.google.com/maps/search/Debre+Bisrat+Dagmawi+Kulubi+St+Gabriel+Ethiopian+Orthodox+Tewahedo+Church+%E1%8B%B0%E1%89%A5%E1%88%A8+%E1%89%A5%E1%88%A5%E1%88%AB%E1%89%B5+%E1%8B%B3%E1%8C%8D%E1%88%9B%E1%8B%8A+%E1%89%81%E1%88%8D%E1%89%A2+%E1%89%85%E1%8B%B1%E1%88%B5+%E1%8C%88%E1%89%A5%E1%88%AD%E1%8A%A4%E1%88%8D+%E1%89%A4%E1%89%B0%E1%8A%AD%E1%88%AD%E1%88%B5%E1%89%B2%E1%8B%AB%E1%8A%95/@29.5352296,-17.578125,3z?entry=ttu&g_ep=EgoyMDI1MDYxNy4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-church-gold transition-all hover:translate-x-1 block py-1 font-medium"
                >
                  <span role="img" aria-label="Map">
                    🗺️
                  </span>{" "}
                  {language === "en" ? "Official Map" : "ይፋዊ ካርታ"}
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/@st.gebrieleotcmd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-church-gold transition-all hover:translate-x-1 block py-1 font-medium"
                >
                  <span role="img" aria-label="YouTube">
                    ▶️
                  </span>{" "}
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="text-center space-y-4">
            <div className="flex justify-center space-x-4 mb-4">
              <div className="w-8 h-2 bg-green-500 rounded"></div>
              <div className="w-8 h-2 bg-yellow-400 rounded"></div>
              <div className="w-8 h-2 bg-red-500 rounded"></div>
            </div>
            <p className="text-sm font-medium">{t("copyright")}</p>
            <p className="text-sm opacity-90 max-w-2xl mx-auto leading-relaxed">
              {language === "en"
                ? "Visit us at our church location for worship services and community events. All are welcome to join our spiritual family."
                : "ለአምልኮ አገልግሎቶች እና የማህበረሰብ ዝግጅቶች በቤተክርስቲያናችን ይጎብኙን። ሁሉም ወደ መንፈሳዊ ቤተሰባችን እንዲቀላቀሉ እንኳን ደህና መጡ።"}
            </p>
            <Link
              to="/admin/login"
              className="inline-block text-church-gold/70 hover:text-church-gold text-xs transition-all hover:scale-105 mt-4 px-3 py-1 rounded border border-church-gold/30 hover:border-church-gold/60"
            >
              {language === "en" ? "🔐 Administration" : "🔐 አስተዳደር"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
