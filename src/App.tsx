import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import routes from "tempo-routes";
import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import MembershipRegistration from "./pages/MembershipRegistration";
import Donation from "./pages/Donation";
import DonationSuccess from "./pages/DonationSuccess";
import Gallery from "./pages/Gallery";
import Services from "./pages/Services";
import Sermons from "./pages/Sermons";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminEvents from "./pages/admin/Events";
import AdminGallery from "./pages/admin/Gallery";
import AdminSettings from "./pages/admin/Settings";
import AdminSermons from "./pages/admin/Sermons";
import AdminMembers from "./pages/admin/Members";
import AdminTestimonials from "./pages/admin/Testimonials";
import AdminPrayerRequests from "./pages/admin/PrayerRequests";
import AdminDonations from "./pages/admin/Donations";
import { LanguageProvider } from "./contexts/LanguageContext";

export default function App(): React.ReactElement {
  return (
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Tempo routes */}
            {import.meta.env.VITE_TEMPO === "true" &&
              routes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/membership" element={<MembershipRegistration />} />
            <Route path="/donation" element={<Donation />} />
            <Route path="/donation-success" element={<DonationSuccess />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/services" element={<Services />} />
            <Route path="/sermons" element={<Sermons />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="login" element={<AdminLogin />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="sermons" element={<AdminSermons />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="members" element={<AdminMembers />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="prayer-requests" element={<AdminPrayerRequests />} />
              <Route path="donations" element={<AdminDonations />} />
            </Route>

            {/* Add this before the catchall route */}
            {import.meta.env.VITE_TEMPO === "true" && (
              <Route path="/tempobook/*" />
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  );
}
