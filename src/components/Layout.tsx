
import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen lalibela-pattern">
      <Header />
      <main className="flex-grow">
        <div className="eth-flag-accent"></div>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
