import { supabase } from "@/integrations/supabase/client";
import { api } from "@/integrations/supabase/api";
import { dataSyncService } from "@/services/DataSyncService";
import {
  loadDashboardStats,
  loadRecentActivity,
  performBulkOperation,
  checkAdminPermissions,
  getCurrentUserProfile,
} from "@/utils/adminHelpers";

interface TestResult {
  name: string;
  status: "pass" | "fail" | "warning";
  message: string;
  error?: any;
}

/**
 * Comprehensive admin panel test suite
 */
export class AdminTestSuite {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestResult[]> {
    this.results = [];
    console.log("🧪 Starting Admin Panel Test Suite...");

    // Database connectivity tests
    await this.testDatabaseConnection();
    await this.testTableAccess();

    // API function tests
    await this.testApiEndpoints();

    // Admin helper tests
    await this.testAdminHelpers();

    // Edge function tests
    await this.testEdgeFunctions();

    // Data sync service tests
    await this.testDataSyncService();

    // Authentication tests
    await this.testAuthentication();

    console.log("✅ Admin Panel Test Suite Complete");
    return this.results;
  }

  private addResult(
    name: string,
    status: "pass" | "fail" | "warning",
    message: string,
    error?: any,
  ) {
    this.results.push({ name, status, message, error });
    const emoji = status === "pass" ? "✅" : status === "fail" ? "❌" : "⚠️";
    console.log(`${emoji} ${name}: ${message}`);
    if (error) console.error("Error details:", error);
  }

  private async testDatabaseConnection() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("count", { count: "exact", head: true });
      if (error) throw error;
      this.addResult(
        "Database Connection",
        "pass",
        "Successfully connected to Supabase",
      );
    } catch (error) {
      this.addResult(
        "Database Connection",
        "fail",
        "Failed to connect to database",
        error,
      );
    }
  }

  private async testTableAccess() {
    const tables = [
      "profiles",
      "events",
      "members",
      "donations",
      "testimonials",
      "prayer_requests",
      "sermons",
      "gallery",
      "appointments",
      "site_settings",
      "stripe_settings",
      "email_settings",
      "email_subscribers",
      "email_templates",
      "email_campaigns",
    ];

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });
        if (error) throw error;
        this.addResult(`Table Access: ${table}`, "pass", "Table accessible");
      } catch (error) {
        this.addResult(
          `Table Access: ${table}`,
          "fail",
          "Table not accessible",
          error,
        );
      }
    }
  }

  private async testApiEndpoints() {
    const tests = [
      { name: "Events API", test: () => api.events.getEvents() },
      { name: "Members API", test: () => api.members.getMembers() },
      { name: "Sermons API", test: () => api.sermons.getSermons() },
      {
        name: "Testimonials API",
        test: () => api.testimonials.getTestimonials(false),
      },
      {
        name: "Prayer Requests API",
        test: () => api.prayerRequests.getPrayerRequests(false),
      },
      { name: "Donations API", test: () => api.donations.getDonations() },
      { name: "Gallery API", test: () => api.gallery.getGalleryImages() },
      { name: "Users API", test: () => api.users.getUsers() },
      {
        name: "Appointments API",
        test: () => api.appointments.getAppointments(),
      },
      {
        name: "Site Settings API",
        test: () => api.siteSettings?.getSettings(),
      },
      {
        name: "Stripe Settings API",
        test: () => api.stripeSettings.getSettings(),
      },
      {
        name: "Email Settings API",
        test: () => api.emailSettings.getSettings(),
      },
    ];

    for (const { name, test } of tests) {
      try {
        await test();
        this.addResult(`API: ${name}`, "pass", "API endpoint working");
      } catch (error) {
        this.addResult(`API: ${name}`, "fail", "API endpoint failed", error);
      }
    }
  }

  private async testAdminHelpers() {
    try {
      const stats = await loadDashboardStats();
      this.addResult(
        "Admin Helper: Dashboard Stats",
        "pass",
        `Loaded stats: ${Object.keys(stats).length} metrics`,
      );
    } catch (error) {
      this.addResult(
        "Admin Helper: Dashboard Stats",
        "fail",
        "Failed to load dashboard stats",
        error,
      );
    }

    try {
      const activity = await loadRecentActivity(5);
      this.addResult(
        "Admin Helper: Recent Activity",
        "pass",
        `Loaded ${activity.length} activities`,
      );
    } catch (error) {
      this.addResult(
        "Admin Helper: Recent Activity",
        "fail",
        "Failed to load recent activity",
        error,
      );
    }
  }

  private async testEdgeFunctions() {
    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-admin-operations",
        {
          body: { operation: "getDashboardStats" },
        },
      );

      if (error) throw error;
      this.addResult(
        "Edge Function: Admin Operations",
        "pass",
        "Admin operations function working",
      );
    } catch (error) {
      this.addResult(
        "Edge Function: Admin Operations",
        "warning",
        "Admin operations function not available",
        error,
      );
    }
  }

  private async testDataSyncService() {
    try {
      const status = dataSyncService.getStatus();
      this.addResult(
        "Data Sync Service",
        "pass",
        `Service active with ${status.listeners} listeners`,
      );

      // Test admin action logging
      dataSyncService.notifyAdminAction("test", "test_table", { test: true });
      const recentActions = dataSyncService.getRecentAdminActions(1);

      if (recentActions.length > 0) {
        this.addResult(
          "Data Sync: Action Logging",
          "pass",
          "Action logging working",
        );
      } else {
        this.addResult(
          "Data Sync: Action Logging",
          "warning",
          "Action logging may not be working",
        );
      }
    } catch (error) {
      this.addResult(
        "Data Sync Service",
        "fail",
        "Data sync service failed",
        error,
      );
    }
  }

  private async testAuthentication() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        this.addResult(
          "Authentication: Session",
          "pass",
          "User session active",
        );

        const profile = await getCurrentUserProfile();
        if (profile) {
          this.addResult(
            "Authentication: Profile",
            "pass",
            `Profile loaded: ${profile.role}`,
          );

          const isAdmin = await checkAdminPermissions();
          this.addResult(
            "Authentication: Admin Check",
            isAdmin ? "pass" : "warning",
            isAdmin ? "Admin permissions confirmed" : "No admin permissions",
          );
        } else {
          this.addResult(
            "Authentication: Profile",
            "warning",
            "Profile not found",
          );
        }
      } else {
        this.addResult(
          "Authentication: Session",
          "warning",
          "No active session",
        );
      }
    } catch (error) {
      this.addResult(
        "Authentication",
        "fail",
        "Authentication test failed",
        error,
      );
    }
  }

  getTestSummary(): {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  } {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.status === "pass").length;
    const failed = this.results.filter((r) => r.status === "fail").length;
    const warnings = this.results.filter((r) => r.status === "warning").length;

    return { total, passed, failed, warnings };
  }

  getFailedTests(): TestResult[] {
    return this.results.filter((r) => r.status === "fail");
  }

  getWarningTests(): TestResult[] {
    return this.results.filter((r) => r.status === "warning");
  }
}

// Export singleton instance
export const adminTestSuite = new AdminTestSuite();

// Quick test function for console use
export const runAdminTests = async () => {
  const results = await adminTestSuite.runAllTests();
  const summary = adminTestSuite.getTestSummary();

  console.log("\n📊 Test Summary:");
  console.log(`Total: ${summary.total}`);
  console.log(`✅ Passed: ${summary.passed}`);
  console.log(`❌ Failed: ${summary.failed}`);
  console.log(`⚠️ Warnings: ${summary.warnings}`);

  if (summary.failed > 0) {
    console.log("\n❌ Failed Tests:");
    adminTestSuite.getFailedTests().forEach((test) => {
      console.log(`- ${test.name}: ${test.message}`);
    });
  }

  if (summary.warnings > 0) {
    console.log("\n⚠️ Warning Tests:");
    adminTestSuite.getWarningTests().forEach((test) => {
      console.log(`- ${test.name}: ${test.message}`);
    });
  }

  return results;
};
