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
