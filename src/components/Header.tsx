
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto">
        <div className="flex items-center justify-between py-4 px-6 lg:px-0">
          {/* Logo and Church Name */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-church-burgundy rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-serif">SG</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-serif text-church-burgundy">
                Debre Bisrat Dagimawi Kulibi
              </h1>
              <p className="text-sm text-church-dark">
                St. Gabriel Ethiopian Orthodox Tewahedo Church
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex">
            <ul className="flex gap-6">
              <li>
                <Link to="/" className="nav-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="nav-link">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/events" className="nav-link">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/contact" className="nav-link">
                  Contact Us
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-church-burgundy focus:outline-none"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden animate-fade-in">
          <nav className="bg-white py-4 shadow-inner">
            <ul className="flex flex-col items-center gap-4">
              <li>
                <Link 
                  to="/" 
                  className="nav-link block py-2" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="nav-link block py-2" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/events" 
                  className="nav-link block py-2" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Events
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="nav-link block py-2" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
