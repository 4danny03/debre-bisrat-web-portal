import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Bug,
  Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface DiagnosticCheck {
  name: string;
  status: "pass" | "fail" | "warning";
  message: string;
  details?: string;
}

// Extend window type for __consoleErrors
interface WindowWithConsoleErrors extends Window {
  __consoleErrors?: unknown[];
}

export default function ErrorDiagnostics() {
  const [checks, setChecks] = useState<DiagnosticCheck[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runDiagnostics = useCallback(async () => {
    setLoading(true);
    const diagnostics: DiagnosticCheck[] = [];

    // Check Supabase connection
    try {
      const { error } = await supabase.from("profiles").select("id").limit(1);
      diagnostics.push({
        name: "Supabase Connection",
        status: error ? "fail" : "pass",
        message: error
          ? `Connection failed: ${error.message || "Unknown error"}`
          : "Connected successfully",
        details: error?.details || undefined,
      });
    } catch (error) {
      diagnostics.push({
        name: "Supabase Connection",
        status: "fail",
        message: "Connection error",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Check required tables
    const requiredTables = [
      "profiles",
      "events",
      "members",
      "sermons",
      "gallery",
      "testimonials",
      "prayer_requests",
      "donations",
    ];

    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select("*").limit(1);
        diagnostics.push({
          name: `Table: ${table}`,
          status: error ? "fail" : "pass",
          message: error
            ? `Table access failed: ${error.message || "Unknown error"}`
            : "Table accessible",
          details: error?.details || undefined,
        });
      } catch (error) {
        diagnostics.push({
          name: `Table: ${table}`,
          status: "fail",
          message: "Table check failed",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Check storage bucket
    try {
      const { error } = await supabase.storage
        .from("images")
        .list("", { limit: 1 });
      diagnostics.push({
        name: "Storage Bucket",
        status: error ? "fail" : "pass",
        message: error
          ? `Storage error: ${error.message || "Unknown error"}`
          : "Storage accessible",
        details: (error && "details" in error ? (error as any).details : undefined),
      });
    } catch (error) {
      diagnostics.push({
        name: "Storage Bucket",
        status: "fail",
        message: "Storage check failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Check environment variables
    const requiredEnvVars = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];

    requiredEnvVars.forEach((envVar) => {
      try {
        const value = import.meta.env?.[envVar];
        diagnostics.push({
          name: `Env Var: ${envVar}`,
          status: value ? "pass" : "fail",
          message: value
            ? "Environment variable set"
            : "Environment variable missing",
          details: value
            ? `Value: ${String(value).substring(0, 20)}...`
            : "Variable not found in import.meta.env",
        });
      } catch (error) {
        diagnostics.push({
          name: `Env Var: ${envVar}`,
          status: "fail",
          message: "Error checking environment variable",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Check browser console errors
    if (typeof window !== "undefined") {
      const consoleErrors = (window as WindowWithConsoleErrors).__consoleErrors || [];
      if (Array.isArray(consoleErrors) && consoleErrors.length > 0) {
        diagnostics.push({
          name: "Console Errors",
          status: "warning",
          message: `${consoleErrors.length} console errors detected`,
          details: consoleErrors.slice(0, 3).filter(Boolean).join("; "),
        });
      } else {
        diagnostics.push({
          name: "Console Errors",
          status: "pass",
          message: "No console errors detected",
        });
      }
    } else {
      diagnostics.push({
        name: "Console Errors",
        status: "warning",
        message: "Console error checking not available (SSR environment)",
      });
    }

    // Check local storage
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        localStorage.setItem("tempo_test", "test");
        localStorage.removeItem("tempo_test");
        diagnostics.push({
          name: "Local Storage",
          status: "pass",
          message: "Local storage accessible",
        });
      } catch (error) {
        diagnostics.push({
          name: "Local Storage",
          status: "fail",
          message: "Local storage not accessible",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    } else {
      diagnostics.push({
        name: "Local Storage",
        status: "warning",
        message: "Local storage not available (SSR environment)",
      });
    }

    setChecks(diagnostics);
    setLoading(false);

    const failedChecks = diagnostics.filter((c) => c.status === "fail").length;
    const warningChecks = diagnostics.filter(
      (c) => c.status === "warning",
    ).length;

    if (failedChecks > 0) {
      toast({
        title: "Diagnostics Complete",
        description: `Found ${failedChecks} critical issues and ${warningChecks} warnings`,
        variant: "destructive",
      });
    } else if (warningChecks > 0) {
      toast({
        title: "Diagnostics Complete",
        description: `Found ${warningChecks} warnings`,
      });
    } else {
      toast({
        title: "Diagnostics Complete",
        description: "All checks passed successfully",
      });
    }
  }, [toast]);

  const getStatusIcon = useCallback((status: DiagnosticCheck["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  }, []);

  const getStatusBadge = useCallback((status: DiagnosticCheck["status"]) => {
    const variants = {
      pass: "default" as const,
      warning: "secondary" as const,
      fail: "destructive" as const,
    };

    return (
      <Badge variant={variants[status] || "secondary"} className="capitalize">
        {status}
      </Badge>
    );
  }, []);

  useEffect(() => {
    // Capture console errors safely
    if (typeof window !== "undefined") {
      const originalError = console.error;

      // Initialize console errors array safely
      if (!(window as WindowWithConsoleErrors).__consoleErrors) {
        (window as WindowWithConsoleErrors).__consoleErrors = [];
      }

      console.error = (...args: any[]) => {
        try {
          const errorMessage = args
            .filter(Boolean)
            .map((arg) => {
              try {
                return typeof arg === "string" ? arg : JSON.stringify(arg);
              } catch {
                return String(arg);
              }
            })
            .join(" ");

          // Safely push errorMessage if __consoleErrors is defined
          if ((window as WindowWithConsoleErrors).__consoleErrors) {
            (window as WindowWithConsoleErrors).__consoleErrors!.push(errorMessage);
            if ((window as WindowWithConsoleErrors).__consoleErrors!.length > 50) {
              (window as WindowWithConsoleErrors).__consoleErrors = (window as WindowWithConsoleErrors).__consoleErrors!.slice(-50);
            }
          }
        } catch (e) {
          // Ignore errors in error handling to prevent infinite loops
        }
        originalError.apply(console, args);
      };

      return () => {
        console.error = originalError;
      };
    }
  }, []);

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bug className="h-5 w-5 mr-2" />
          System Diagnostics
        </CardTitle>
        <CardDescription>
          Run comprehensive checks to identify potential issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDiagnostics} disabled={loading} className="w-full">
          {loading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Bug className="h-4 w-4 mr-2" />
          )}
          Run Diagnostics
        </Button>

        {checks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Diagnostic Results</h3>
              <div className="flex space-x-2">
                <Badge className="bg-green-100 text-green-800">
                  {checks.filter((c) => c.status === "pass").length} Pass
                </Badge>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {checks.filter((c) => c.status === "warning").length} Warning
                </Badge>
                <Badge className="bg-red-100 text-red-800">
                  {checks.filter((c) => c.status === "fail").length} Fail
                </Badge>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {checks.map((check, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <p className="font-medium text-sm">{check.name}</p>
                      <p className="text-xs text-gray-600">{check.message}</p>
                      {check.details && (
                        <p className="text-xs text-gray-500 mt-1">
                          {check.details}
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(check.status)}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center">
            <Info className="h-4 w-4 text-blue-600 mr-2" />
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> If you're experiencing errors, run
              diagnostics to identify the root cause. Check the browser console
              for additional error details.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
