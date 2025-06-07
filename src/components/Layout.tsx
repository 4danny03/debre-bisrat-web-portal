import React from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-church-cream/30 to-white">
      <Header />
      <main className="flex-1 animate-fade-in">
        <div className="relative">
          {/* Enhanced background pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-church-burgundy/15 via-church-gold/5 to-church-green/10"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(125,34,36,0.05)_0%,transparent_50%)] animate-pulse"></div>
          </div>
          <div className="relative z-10 px-4 md:px-6 lg:px-8">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
