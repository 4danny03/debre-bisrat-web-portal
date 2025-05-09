
import React from 'react';
import { Phone, Mail, Facebook, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-church-burgundy text-white pt-8 pb-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 lg:px-0">
          
          {/* Church Information */}
          <div>
            <h3 className="text-church-gold font-serif text-xl mb-4">
              Debre Bisrat Dagimawi Kulibi
            </h3>
            <p className="mb-2">
              St. Gabriel Ethiopian Orthodox Tewahedo Church
            </p>
            <div className="flex items-center gap-2 mt-4">
              <Home size={18} />
              <address className="not-italic">
                16020 Batson Rd, Spencerville, MD 20868
              </address>
            </div>
          </div>
          
          {/* Contact Information */}
          <div>
            <h3 className="text-church-gold font-serif text-xl mb-4">
              Contact Us
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone size={18} />
                <a href="tel:+12403818146" className="hover:text-church-gold transition-colors">
                  (240)-381-8146
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={18} />
                <a href="mailto:info@stgabrielsilverspring.org" className="hover:text-church-gold transition-colors">
                  info@stgabrielsilverspring.org
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Facebook size={18} />
                <a 
                  href="https://www.facebook.com/EthiopianOrthodoxSt.GabrielChurchSilverspringMD" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-church-gold transition-colors"
                >
                  Follow us on Facebook
                </a>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-church-gold font-serif text-xl mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-church-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-church-gold transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-church-gold transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-church-gold transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-4 border-t border-white/20 text-center text-sm">
          <p>
            © 2025 Debre Bisrat Dagimawi Kulibi St. Gabriel Ethiopian Orthodox Tewahedo Church. All rights reserved.
          </p>
          <p className="mt-2">
            <a href="https://stgabrielmd.org" target="_blank" rel="noreferrer" className="underline hover:text-church-gold transition-colors">
              stgabrielmd.org
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
