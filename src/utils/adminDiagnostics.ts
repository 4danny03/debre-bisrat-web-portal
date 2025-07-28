import { supabase } from "@/integrations/supabase/client";

export interface DiagnosticResult {
  component: string;
  status: "success" | "warning" | "error";
  message: string;
  details?: any;
}

export class AdminDiagnostics {
  static async runFullDiagnostics(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];

    // Test database connectivity
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);
      if (error) throw error;
      results.push({
        component: "Database Connection",
        status: "success",
        message: "Database connection successful",
      });
    } catch (error) {
      results.push({
        component: "Database Connection",
        status: "error",
        message: "Database connection failed",
        details: error,
      });
    }

    // Test authentication
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        results.push({
          component: "Authentication",
          status: "success",
          message: "User authenticated successfully",
        });
      } else {
        results.push({
          component: "Authentication",
          status: "warning",
          message: "No active session found",
        });
      }
    } catch (error) {
      results.push({
        component: "Authentication",
        status: "error",
        message: "Authentication check failed",
        details: error,
      });
    }

    // Test storage access
    try {
      const { data, error } = await supabase.storage
        .from("images")
        .list("", { limit: 1 });
      if (error) throw error;
      results.push({
        component: "Storage Access",
        status: "success",
        message: "Storage access successful",
      });
    } catch (error) {
      results.push({
        component: "Storage Access",
        status: "error",
        message: "Storage access failed",
        details: error,
      });
    }

    // Test each table
    const tables = [
      "events",
      "members",
      "gallery",
      "donations",
      "testimonials",
      "prayer_requests",
      "sermons",
    ];
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select("*").limit(1);
        if (error) throw error;
        results.push({
          component: `Table: ${table}`,
          status: "success",
          message: `Table ${table} accessible`,
        });
      } catch (error) {
        results.push({
          component: `Table: ${table}`,
          status: "error",
          message: `Table ${table} access failed`,
          details: error,
        });
      }
    }

    return results;
  }

  static async testImagePaths(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];
    const imagePaths = [
      "/images/gallery/church-service.jpg",
      "/images/religious/palm-sunday.jpg",
      "/images/religious/crucifixion.jpg",
      "/images/religious/procession.jpg",
      "/images/gallery/timket.jpg",
      "/images/gallery/ceremony-1.jpg",
      "/images/gallery/ceremony-2.jpg",
      "/images/gallery/ceremony-3.jpg",
    ];

    for (const path of imagePaths) {
      try {
        const response = await fetch(path, { method: "HEAD" });
        if (response.ok) {
          results.push({
            component: `Image: ${path}`,
            status: "success",
            message: `Image accessible`,
          });
        } else {
          results.push({
            component: `Image: ${path}`,
            status: "error",
            message: `Image not found (${response.status})`,
          });
        }
      } catch (error) {
        results.push({
          component: `Image: ${path}`,
          status: "error",
          message: `Image check failed`,
          details: error,
        });
      }
    }

    return results;
  }
}

/**
 * Run comprehensive system diagnostics
 */
export const runSystemDiagnostics = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];

  try {
    // Database connectivity check
    try {
      const start = Date.now();
      const { error } = await supabase.from("profiles").select("id").limit(1);
      const responseTime = Date.now() - start;

      results.push({
        component: "Database Connection",
        status: error ? "error" : "success",
        message: error
          ? `Connection failed: ${error.message}`
          : `Connected successfully (${responseTime}ms)`,
        details: { responseTime },
      });
    } catch (error) {
      results.push({
        component: "Database Connection",
        status: "error",
        message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        details: error,
      });
    }

    // Storage bucket check
    try {
      const start = Date.now();
      const { error } = await supabase.storage
        .from("images")
        .list("", { limit: 1 });
      const responseTime = Date.now() - start;

      results.push({
        component: "Storage Bucket",
        status: error ? "error" : "success",
        message: error
          ? `Storage error: ${error.message}`
          : `Storage accessible (${responseTime}ms)`,
        details: { responseTime },
      });
    } catch (error) {
      results.push({
        component: "Storage Bucket",
        status: "error",
        message: `Storage check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        details: error,
      });
    }

    // Authentication check
    try {
      const { data } = await supabase.auth.getSession();
      results.push({
        component: "Authentication",
        status: data.session ? "success" : "warning",
        message: data.session ? "User is authenticated" : "No active session",
        details: { hasSession: !!data.session },
      });
    } catch (error) {
      results.push({
        component: "Authentication",
        status: "error",
        message: `Auth check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        details: error,
      });
    }

    // Environment variables check
    const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_ANON_KEY"];
    const missingEnvVars = requiredEnvVars.filter(
      (varName) =>
        !import.meta.env[`VITE_${varName}`] && !import.meta.env[varName],
    );

    results.push({
      component: "Environment Variables",
      status: missingEnvVars.length > 0 ? "error" : "success",
      message:
        missingEnvVars.length > 0
          ? `Missing required variables: ${missingEnvVars.join(", ")}`
          : "All required variables are set",
      details: { missingEnvVars },
    });

    // Browser features check
    const browserFeatures = {
      localStorage: typeof localStorage !== "undefined",
      sessionStorage: typeof sessionStorage !== "undefined",
      indexedDB: typeof indexedDB !== "undefined",
      serviceWorker: "serviceWorker" in navigator,
    };

    const missingFeatures = Object.entries(browserFeatures)
      .filter(([_, supported]) => !supported)
      .map(([name]) => name);

    results.push({
      component: "Browser Features",
      status: missingFeatures.length > 0 ? "warning" : "success",
      message:
        missingFeatures.length > 0
          ? `Missing browser features: ${missingFeatures.join(", ")}`
          : "All required browser features are supported",
      details: browserFeatures,
    });

    // Performance check
    if (typeof performance !== "undefined") {
      const navigationTiming = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      const loadTime = navigationTiming
        ? navigationTiming.loadEventEnd - navigationTiming.startTime
        : null;

      results.push({
        component: "Page Performance",
        status: loadTime && loadTime > 3000 ? "warning" : "success",
        message: loadTime
          ? `Page load time: ${Math.round(loadTime)}ms`
          : "Performance metrics not available",
        details: { loadTime },
      });
    }
  } catch (error) {
    console.error("Diagnostics error:", error);
    results.push({
      component: "Diagnostics Runner",
      status: "error",
      message: `Failed to complete diagnostics: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: error,
    });
  }

  return results;
};

/**
 * Get system performance metrics
 */
export const getPerformanceMetrics = () => {
  if (typeof performance === "undefined") {
    return null;
  }

  try {
    const navigationTiming = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;

    if (!navigationTiming) {
      return null;
    }

    return {
      loadTime: navigationTiming.loadEventEnd - navigationTiming.startTime,
      domContentLoaded:
        navigationTiming.domContentLoadedEventEnd - navigationTiming.startTime,
      firstPaint: performance
        .getEntriesByType("paint")
        .find((entry) => entry.name === "first-paint")?.startTime,
      firstContentfulPaint: performance
        .getEntriesByType("paint")
        .find((entry) => entry.name === "first-contentful-paint")?.startTime,
      resourceCount: performance.getEntriesByType("resource").length,
      resourceSize: performance
        .getEntriesByType("resource")
        .reduce(
          (total, entry) =>
            total + (entry as PerformanceResourceTiming).encodedBodySize,
          0,
        ),
    };
  } catch (error) {
    console.error("Error getting performance metrics:", error);
    return null;
  }
};
