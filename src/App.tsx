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
const AdminLayout = React.lazy(() => import("./pages/admin/AdminLayout"));
const AdminLogin = React.lazy(() => import("./pages/admin/Login"));
const AdminDashboard = React.lazy(() => import("./pages/admin/Dashboard"));
const AdminEvents = React.lazy(() => import("./pages/admin/Events"));
const AdminGallery = React.lazy(() => import("./pages/admin/Gallery"));
const AdminSettings = React.lazy(() => import("./pages/admin/Settings"));
const AdminMembers = React.lazy(() => import("./pages/admin/Members"));
const AdminTestimonials = React.lazy(() => import("./pages/admin/Testimonials"));
const AdminPrayerRequests = React.lazy(() => import("./pages/admin/PrayerRequests"));
const AdminDonations = React.lazy(() => import("./pages/admin/Donations"));
const AdminUsers = React.lazy(() => import("./pages/admin/Users"));
const AdminSystemHealth = React.lazy(() => import("./pages/admin/SystemHealth"));
const AdminAnalytics = React.lazy(() => import("./pages/admin/Analytics"));
const AdminBulkOperations = React.lazy(() => import("./pages/admin/BulkOperations"));
const AdminContentScheduler = React.lazy(() => import("./pages/admin/ContentScheduler"));
const AdminAppointments = React.lazy(() => import("./pages/admin/Appointments"));
const AdminEmailMarketing = React.lazy(() => import("./pages/admin/EmailMarketing"));
const AdminContactMessages = React.lazy(() => import("./pages/admin/ContactMessages"));
import { LanguageProvider } from "./contexts/LanguageContext";
import { DataProvider } from "./contexts/DataContext";
import ErrorBoundary from "./components/ErrorBoundary";
import "@/utils/debugSync"; // Initialize debug utilities
import MemberLogin from "./pages/MemberLogin";
import MemberDashboard from "@/components/MemberDashboard";
import MemberAuthGuard from "@/components/MemberAuthGuard";
import LoadingSpinner from "@/components/LoadingSpinner";

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
      <Route
        path="/admin/login"
        element={
          <React.Suspense
            fallback={
              <LoadingSpinner className="p-6" text="Loading..." ariaLabel="Loading page" />
            }
          >
            <AdminLogin />
          </React.Suspense>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <React.Suspense
              fallback={
                <LoadingSpinner className="p-6" text="Loading..." ariaLabel="Loading page" />
              }
            >
              <AdminLayout />
            </React.Suspense>
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <React.Suspense
              fallback={
                <LoadingSpinner className="p-6" text="Loading..." ariaLabel="Loading page" />
              }
            >
              <AdminDashboard />
            </React.Suspense>
          }
        />
        <Route
          path="dashboard"
          element={
            <React.Suspense
              fallback={
                <LoadingSpinner className="p-6" text="Loading..." ariaLabel="Loading page" />
              }
            >
              <AdminDashboard />
            </React.Suspense>
          }
        />
        <Route path="events" element={<React.Suspense fallback={<LoadingSpinner className="p-6" text="Loading..." ariaLabel="Loading page" />}><AdminEvents /></React.Suspense>} />
        <Route path="gallery" element={<React.Suspense fallback={<LoadingSpinner className="p-6" text="Loading..." ariaLabel="Loading page" />}><AdminGallery /></React.Suspense>} />
        <Route path="settings" element={<React.Suspense fallback={<LoadingSpinner className="p-6" text="Loading..." ariaLabel="Loading page" />}><AdminSettings /></React.Suspense>} />
        <Route path="members" element={<React.Suspense fallback={<LoadingSpinner className="p-6" text="Loading..." ariaLabel="Loading page" />}><AdminMembers /></React.Suspense>} />
        <Route path="testimonials" element={<React.Suspense fallback={<LoadingSpinner className="p-6" text="Loading..." ariaLabel="Loading page" />}><AdminTestimonials /></React.Suspense>} />
        <Route path="prayer-requests" element={<React.Suspense fallback={<LoadingSpinner className="p-6" text="Loading..." ariaLabel="Loading page" />}><AdminPrayerRequests /></React.Suspense>} />
        <Route path="donations" element={<React.Suspense fallback={<LoadingSpinner className="p-6" text="Loading..." ariaLabel="Loading page" />}><AdminDonations /></React.Suspense>} />
        <Route path="users" element={<React.Suspense fallback={<LoadingSpinner className="p-6" text="Loading..." ariaLabel="Loading page" />}><AdminUsers /></React.Suspense>} />
        <Route path="system-health" element={<React.Suspense fallback={<LoadingSpinner className="p-6" text="Loading..." ariaLabel="Loading page" />}><AdminSystemHealth /></React.Suspense>} />
        <Route path="analytics" element={<React.Suspense fallback={<LoadingSpinner className="p-6" text="Loading..." ariaLabel="Loading page" />}><AdminAnalytics /></React.Suspense>} />
        <Route path="bulk-operations" element={<React.Suspense fallback={<LoadingSpinner className="p-6" text="Loading..." ariaLabel="Loading page" />}><AdminBulkOperations /></React.Suspense>} />
        <Route path="content-scheduler" element={<React.Suspense fallback={<LoadingSpinner className="p-6" text="Loading..." ariaLabel="Loading page" />}><AdminContentScheduler /></React.Suspense>} />
        <Route path="appointments" element={<React.Suspense fallback={<LoadingSpinner className="p-6" text="Loading..." ariaLabel="Loading page" />}><AdminAppointments /></React.Suspense>} />
        <Route path="contact-messages" element={<React.Suspense fallback={<LoadingSpinner className="p-6" text="Loading..." ariaLabel="Loading page" />}><AdminContactMessages /></React.Suspense>} />
        <Route path="email-marketing" element={<React.Suspense fallback={<LoadingSpinner className="p-6" text="Loading..." ariaLabel="Loading page" />}><AdminEmailMarketing /></React.Suspense>} />
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
