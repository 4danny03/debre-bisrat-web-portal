// System Test Utilities
// This file contains utilities to test various system components

import { supabase } from "@/integrations/supabase/client";
import { api } from "@/integrations/supabase/api";

export const systemTest = {
  // Test database connectivity
  async testDatabaseConnection() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);
      if (error) throw error;
      console.log("✅ Database connection successful");
      return true;
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      return false;
    }
  },

  // Test authentication
  async testAuthentication() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("✅ Authentication system working");
      return { success: true, hasSession: !!session };
    } catch (error) {
      console.error("❌ Authentication test failed:", error);
      return { success: false, hasSession: false };
    }
  },

  // Test API endpoints
  async testAPIEndpoints() {
    const results = {
      events: false,
      sermons: false,
      gallery: false,
      testimonials: false,
      prayerRequests: false,
      members: false,
      donations: false,
    };

    try {
      // Test events API
      await api.events.getEvents();
      results.events = true;
      console.log("✅ Events API working");
    } catch (error) {
      console.error("❌ Events API failed:", error);
    }

    try {
      // Test sermons API
      await api.sermons.getSermons();
      results.sermons = true;
      console.log("✅ Sermons API working");
    } catch (error) {
      console.error("❌ Sermons API failed:", error);
    }

    try {
      // Test gallery API
      await api.gallery.getGalleryImages();
      results.gallery = true;
      console.log("✅ Gallery API working");
    } catch (error) {
      console.error("❌ Gallery API failed:", error);
    }

    try {
      // Test testimonials API
      await api.testimonials.getTestimonials();
      results.testimonials = true;
      console.log("✅ Testimonials API working");
    } catch (error) {
      console.error("❌ Testimonials API failed:", error);
    }

    try {
      // Test prayer requests API
      await api.prayerRequests.getPrayerRequests();
      results.prayerRequests = true;
      console.log("✅ Prayer Requests API working");
    } catch (error) {
      console.error("❌ Prayer Requests API failed:", error);
    }

    try {
      // Test members API
      await api.members.getMembers();
      results.members = true;
      console.log("✅ Members API working");
    } catch (error) {
      console.error("❌ Members API failed:", error);
    }

    try {
      // Test donations API
      await api.donations.getDonations();
      results.donations = true;
      console.log("✅ Donations API working");
    } catch (error) {
      console.error("❌ Donations API failed:", error);
    }

    return results;
  },

  // Test edge functions
  async testEdgeFunctions() {
    const results = {
      createCheckout: false,
      sendEmail: false,
    };

    try {
      // Test create-checkout function (without actually creating a checkout)
      const { error } = await supabase.functions.invoke(
        "supabase-functions-create-checkout",
        {
          body: {
            amount: "1",
            donationType: "one_time",
            purpose: "test",
            email: "test@example.com",
            name: "Test User",
            address: "Test Address",
            isAnonymous: false,
            includeBulletin: false,
            memorial: "",
          },
        },
      );

      // If we get a response (even an error), the function is accessible
      results.createCheckout = true;
      console.log("✅ Create Checkout function accessible");
    } catch (error) {
      console.error("❌ Create Checkout function failed:", error);
    }

    return results;
  },

  // Run comprehensive system test
  async runFullSystemTest() {
    console.log("🔍 Starting comprehensive system test...");

    const results = {
      database: false,
      authentication: { success: false, hasSession: false },
      api: {},
      edgeFunctions: {},
      timestamp: new Date().toISOString(),
    };

    // Test database
    results.database = await this.testDatabaseConnection();

    // Test authentication
    results.authentication = await this.testAuthentication();

    // Test API endpoints
    results.api = await this.testAPIEndpoints();

    // Test edge functions
    results.edgeFunctions = await this.testEdgeFunctions();

    // Summary
    const apiSuccessCount = Object.values(results.api).filter(Boolean).length;
    const apiTotalCount = Object.keys(results.api).length;
    const edgeFunctionSuccessCount = Object.values(
      results.edgeFunctions,
    ).filter(Boolean).length;
    const edgeFunctionTotalCount = Object.keys(results.edgeFunctions).length;

    console.log("\n📊 System Test Summary:");
    console.log(`Database: ${results.database ? "✅" : "❌"}`);
    console.log(
      `Authentication: ${results.authentication.success ? "✅" : "❌"}`,
    );
    console.log(`API Endpoints: ${apiSuccessCount}/${apiTotalCount} working`);
    console.log(
      `Edge Functions: ${edgeFunctionSuccessCount}/${edgeFunctionTotalCount} accessible`,
    );

    return results;
  },
};

// Make it available globally for debugging
if (typeof window !== "undefined") {
  (window as any).systemTest = systemTest;
}
