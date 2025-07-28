import { supabase } from "@/integrations/supabase/client";
import { dataSyncService } from "@/services/DataSyncService";

interface TestResult {
  name: string;
  status: "pass" | "fail" | "warning";
  message: string;
  error?: any;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  warnings: number;
}

class AdminTestSuite {
  private results: TestResult[] = [];
  private summary: TestSummary = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
  };

  async runTest(
    name: string,
    testFn: () => Promise<void>,
  ): Promise<TestResult> {
    try {
      await testFn();
      this.results.push({
        name,
        status: "pass",
        message: "Test passed successfully",
      });
      this.summary.passed++;
      return this.results[this.results.length - 1];
    } catch (error) {
      const isWarning = error instanceof Warning;
      const result = {
        name,
        status: isWarning ? "warning" : "fail",
        message: error instanceof Error ? error.message : String(error),
        error,
      };
      this.results.push(result);
      isWarning ? this.summary.warnings++ : this.summary.failed++;
      return result;
    } finally {
      this.summary.total++;
    }
  }

  getResults(): TestResult[] {
    return [...this.results];
  }

  getTestSummary(): TestSummary {
    return { ...this.summary };
  }

  clearResults(): void {
    this.results = [];
    this.summary = { total: 0, passed: 0, failed: 0, warnings: 0 };
  }
}

class Warning extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Warning";
  }
}

// Create a singleton instance
export const adminTestSuite = new AdminTestSuite();

// Helper function to run all tests
export async function runAdminTests(): Promise<TestResult[]> {
  adminTestSuite.clearResults();

  // Database tests
  await adminTestSuite.runTest("Database Connection", async () => {
    const { error } = await supabase.from("profiles").select("id").limit(1);
    if (error) throw new Error(`Database connection failed: ${error.message}`);
  });

  await adminTestSuite.runTest("Table Access: Members", async () => {
    const { error } = await supabase.from("members").select("count").limit(1);
    if (error) throw new Error(`Members table access failed: ${error.message}`);
  });

  await adminTestSuite.runTest("Table Access: Events", async () => {
    const { error } = await supabase.from("events").select("count").limit(1);
    if (error) throw new Error(`Events table access failed: ${error.message}`);
  });

  // Storage tests
  await adminTestSuite.runTest("Storage Bucket Access", async () => {
    const { error } = await supabase.storage
      .from("images")
      .list("", { limit: 1 });
    if (error)
      throw new Error(`Storage bucket access failed: ${error.message}`);
  });

  // Authentication tests
  await adminTestSuite.runTest("Authentication Status", async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw new Warning("No active session found");
  });

  // Data sync tests
  await adminTestSuite.runTest("Data Sync Service", async () => {
    const status = dataSyncService.getStatus();
    if (!status.isActive) throw new Warning("Data sync service is not active");
    if (status.errors > 0)
      throw new Warning(`Data sync has ${status.errors} errors`);
  });

  // Edge function tests
  await adminTestSuite.runTest("Edge Function: Admin Dashboard", async () => {
    try {
      await supabase.functions.invoke("supabase-functions-admin-dashboard", {
        body: { action: "ping" },
      });
    } catch (error) {
      throw new Error(
        `Admin dashboard function failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  });

  // Admin helper tests
  await adminTestSuite.runTest("Admin Helper: Dashboard Stats", async () => {
    try {
      await dataSyncService.getDashboardStats();
    } catch (error) {
      throw new Warning(
        `Dashboard stats unavailable: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  });

  // Environment variables test
  await adminTestSuite.runTest("Environment Variables", async () => {
    const requiredVars = ["SUPABASE_URL", "SUPABASE_ANON_KEY"];
    const missingVars = requiredVars.filter(
      (varName) =>
        !import.meta.env[`VITE_${varName}`] && !import.meta.env[varName],
    );
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}`,
      );
    }
  });

  // Browser features test
  await adminTestSuite.runTest("Browser Features", async () => {
    const requiredFeatures = {
      localStorage: typeof localStorage !== "undefined",
      sessionStorage: typeof sessionStorage !== "undefined",
      indexedDB: typeof indexedDB !== "undefined",
    };

    const missingFeatures = Object.entries(requiredFeatures)
      .filter(([_, supported]) => !supported)
      .map(([name]) => name);

    if (missingFeatures.length > 0) {
      throw new Warning(
        `Missing browser features: ${missingFeatures.join(", ")}`,
      );
    }
  });

  return adminTestSuite.getResults();
}
