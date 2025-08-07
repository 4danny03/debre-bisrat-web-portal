import * as React from "react";
// import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { usePerformanceMonitoring } from "@/hooks/use-performance-monitoring";

// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        console.log("ServiceWorker registration successful");
      })
      .catch((err) => {
        console.log("ServiceWorker registration failed: ", err);
      });
  });
}

// Simple component to handle tempo routes without causing recursion
// function TempoRoutesHandler() {
//   // Only render tempo routes if in tempo environment
//   if (!import.meta.env.VITE_TEMPO || import.meta.env.VITE_TEMPO !== "true") {
//     return null;
//   }
//   // Return a simple route that will be handled by the main Routes component
//   return null;
// }
import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import MembershipRegistration from "./pages/MembershipRegistration";
import Donation from "./pages/Donation";
import DonationSuccess from "./pages/DonationSuccess";
import DonationDemo from "./pages/DonationDemo";
import MembershipSuccess from "./pages/MembershipSuccess";
import Gallery from "./pages/Gallery";
import Services from "./pages/Services";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminEvents from "./pages/admin/Events";
import AdminGallery from "./pages/admin/Gallery";
import AdminSettings from "./pages/admin/Settings";
import AdminMembers from "./pages/admin/Members";
import AdminTestimonials from "./pages/admin/Testimonials";
import AdminPrayerRequests from "./pages/admin/PrayerRequests";
import AdminDonations from "./pages/admin/Donations";
import AdminUsers from "./pages/admin/Users";
import AdminSystemHealth from "./pages/admin/SystemHealth";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminBulkOperations from "./pages/admin/BulkOperations";
import AdminContentScheduler from "./pages/admin/ContentScheduler";
import AdminAppointments from "./pages/admin/Appointments";
import AdminEmailMarketing from "./pages/admin/EmailMarketing";
import AdminContactMessages from "./pages/admin/ContactMessages";
import { LanguageProvider } from "./contexts/LanguageContext";
import { DataProvider } from "./contexts/DataContext";
import ErrorBoundary from "./components/ErrorBoundary";
import "@/utils/debugSync"; // Initialize debug utilities
import MemberLogin from "./pages/MemberLogin";
import MemberDashboard from "@/components/MemberDashboard";
import MemberAuthGuard from "@/components/MemberAuthGuard";

function AppContent() {
  usePerformanceMonitoring();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/events" element={<Events />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/membership" element={<MembershipRegistration />} />
      <Route path="/donation" element={<Donation />} />
      <Route path="/donation-success" element={<DonationSuccess />} />
      <Route path="/donation-demo" element={<DonationDemo />} />
      <Route path="/membership-success" element={<MembershipSuccess />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/services" element={<Services />} />

      {/* Member Routes */}
      <Route path="/member/login" element={<MemberLogin />} />
      <Route
        path="/member/dashboard"
        element={
          <MemberAuthGuard>
            <MemberDashboard />
          </MemberAuthGuard>
        }
      />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="members" element={<AdminMembers />} />
        <Route path="testimonials" element={<AdminTestimonials />} />
        <Route path="prayer-requests" element={<AdminPrayerRequests />} />
        <Route path="donations" element={<AdminDonations />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="system-health" element={<AdminSystemHealth />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="bulk-operations" element={<AdminBulkOperations />} />
        <Route path="content-scheduler" element={<AdminContentScheduler />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="contact-messages" element={<AdminContactMessages />} />
        <Route path="email-marketing" element={<AdminEmailMarketing />} />
      </Route>

      {/* Add this before the catchall route */}
      {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App(): React.ReactElement {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <DataProvider>
          <TooltipProvider>
            <BrowserRouter>
              <AppContent />
              <Toaster />
              <Sonner />
            </BrowserRouter>
          </TooltipProvider>
        </DataProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
