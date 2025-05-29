import React from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col lalibela-pattern min-h-[907px]">
      <Header />
      <div className="eth-flag-accent"></div>
      <main className="flex-grow eth-flag-gradient">{children}</main>
      <div className="eth-flag-accent"></div>
      <Footer />
    </div>
  );
};

export default Layout;
