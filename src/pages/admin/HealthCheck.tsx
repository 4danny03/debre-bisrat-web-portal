import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface HealthStatus {
  database: "healthy" | "error" | "checking";
  auth: "healthy" | "error" | "checking";
  storage: "healthy" | "error" | "checking";
  tables: {
    events: boolean;
    members: boolean;
    gallery: boolean;
    sermons: boolean;
    testimonials: boolean;
    prayer_requests: boolean;
    donations: boolean;
    profiles: boolean;
    site_settings: boolean;
  };
}

type TableName =
  | "events"
  | "members"
  | "gallery"
  | "sermons"
  | "testimonials"
  | "prayer_requests"
  | "donations"
  | "profiles"
  | "site_settings";

export default function HealthCheck() {
  const [status, setStatus] = useState<HealthStatus>({
    database: "checking",
    auth: "checking",
    storage: "checking",
    tables: {
      events: false,
      members: false,
      gallery: false,
      sermons: false,
      testimonials: false,
      prayer_requests: false,
      donations: false,
      profiles: false,
      site_settings: false,
    },
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // useCallback for stable function reference
  const runHealthCheck = useCallback(async () => {
    setLoading(true);
    const newStatus: HealthStatus = {
      database: "checking",
      auth: "checking",
      storage: "checking",
      tables: {
        events: false,
        members: false,
        gallery: false,
        sermons: false,
        testimonials: false,
        prayer_requests: false,
        donations: false,
        profiles: false,
        site_settings: false,
      },
    };
    try {
      const { error: dbError } = await supabase
        .from("profiles")
        .select("count", { count: "exact", head: true });
      newStatus.database = dbError ? "error" : "healthy";
      const {
        data: { session },
      } = await supabase.auth.getSession();
      newStatus.auth = session ? "healthy" : "error";
      try {
        // Only destructure error, remove unused buckets
        const { error: storageError } = await supabase.storage.listBuckets();
        newStatus.storage = storageError ? "error" : "healthy";
      } catch (storageErr) {
        console.warn("Storage check failed:", storageErr);
        newStatus.storage = "error";
      }
      const tables: TableName[] = Object.keys(newStatus.tables) as TableName[];
      for (const table of tables) {
        try {
          const { error } = await supabase
            .from(table)
            .select("count", { count: "exact", head: true });
          newStatus.tables[table] = !error;
        } catch {
          newStatus.tables[table] = false;
        }
      }
    } catch (error) {
      console.error("Health check error:", error);
      toast({
        title: "Health Check Failed",
        description: "Unable to complete system health check",
        variant: "destructive",
      });
    }
    setStatus(newStatus);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);
  const getStatusIcon = (status: "healthy" | "error" | "checking") => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "checking":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status: "healthy" | "error" | "checking") => {
    switch (status) {
      case "healthy":
        return "Healthy";
      case "error":
        return "Error";
      case "checking":
        return "Checking...";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between">
          <div>
            <div>
              <h1 className="text-3xl font-bold text-church-burgundy">
                System Health Check
              </h1>
              <p className="text-gray-600">
                Monitor the status of all admin system components
              </p>
            </div>
          </div>
        </div>
        <Button onClick={runHealthCheck} disabled={loading}>
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Database Connection
                {getStatusIcon(status.database)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {getStatusText(status.database)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Authentication
                {getStatusIcon(status.auth)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {getStatusText(status.auth)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                File Storage
                {getStatusIcon(status.storage)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {getStatusText(status.storage)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Database Tables Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {Object.entries(status.tables).map(([table, isHealthy]) => (
                <div
                  key={table}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <span className="font-medium capitalize">
                    {table.replace("_", " ")}
                  </span>
                  {isHealthy ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <div className="flex justify-between">
                    <span>Environment:</span>
                    <span className="font-mono">{import.meta.env.MODE}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Supabase URL:</span>
                  <span className="font-mono text-xs">
                    {import.meta.env.VITE_SUPABASE_URL || "Not configured"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last Check:</span>
                  <span>{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}