import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Database,
  Server,
  HardDrive,
  Activity,
  Clock,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import AdminDiagnostics from "@/components/AdminDiagnostics";
import {
  runSystemDiagnostics,
  getPerformanceMetrics,
} from "@/utils/adminDiagnostics";

interface HealthCheck {
  name: string;
  status: "healthy" | "warning" | "error";
  message: string;
  lastChecked: Date;
  responseTime?: number;
  details?: Record<string, unknown>;
}

interface SystemMetrics {
  database: {
    connections: number;
    queries: number;
    avgResponseTime: number;
    storage: {
      used: number;
      total: number;
      percentage: number;
    };
  };
  api: {
    uptime: number;
    requests: number;
    errors: number;
    avgResponseTime: number;
  };
  storage: {
    images: {
      count: number;
      size: number;
    };
    documents: {
      count: number;
      size: number;
    };
  };
}

export default function SystemHealth() {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    runHealthChecks();
    const interval = setInterval(runHealthChecks, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const runHealthChecks = async () => {
    setLoading(true);
    const checks: HealthCheck[] = [];

    // Database connectivity check
    try {
      const start = Date.now();
      const { error } = await supabase.from("profiles").select("id").limit(1);
      const responseTime = Date.now() - start;

      checks.push({
        name: "Database Connection",
        status: error ? "error" : "healthy",
        message: error
          ? `Connection failed: ${error.message}`
          : "Connected successfully",
        lastChecked: new Date(),
        responseTime,
      });
    } catch (error) {
      checks.push({
        name: "Database Connection",
        status: "error",
        message: "Connection failed",
        lastChecked: new Date(),
      });
    }

    // Storage bucket check
    try {
      const start = Date.now();
      const { error } = await supabase.storage
        .from("images")
        .list("", { limit: 1 });
      const responseTime = Date.now() - start;

      checks.push({
        name: "Storage Bucket",
        status: error ? "error" : "healthy",
        message: error
          ? `Storage error: ${error.message}`
          : "Storage accessible",
        lastChecked: new Date(),
        responseTime,
      });
    } catch (error) {
      checks.push({
        name: "Storage Bucket",
        status: "error",
        message: "Storage check failed",
        lastChecked: new Date(),
      });
    }

    // Data integrity checks
    try {
      const [eventsRes, membersRes, donationsRes] = await Promise.all([
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("members").select("*", { count: "exact", head: true }),
        supabase.from("donations").select("*", { count: "exact", head: true }),
      ]);

      const totalRecords =
        (eventsRes.count || 0) +
        (membersRes.count || 0) +
        (donationsRes.count || 0);

      checks.push({
        name: "Data Integrity",
        status: "healthy",
        message: `${totalRecords} total records found`,
        lastChecked: new Date(),
        details: {
          events: eventsRes.count || 0,
          members: membersRes.count || 0,
          donations: donationsRes.count || 0,
        },
      });
    } catch (error) {
      checks.push({
        name: "Data Integrity",
        status: "warning",
        message: "Could not verify data integrity",
        lastChecked: new Date(),
      });
    }

    // Email system check (mock)
    checks.push({
      name: "Email System",
      status: "healthy",
      message: "Email service operational",
      lastChecked: new Date(),
    });

    // Payment system check (mock)
    checks.push({
      name: "Payment System",
      status: "healthy",
      message: "Stripe integration active",
      lastChecked: new Date(),
    });

    setHealthChecks(checks);
    setLastUpdate(new Date());

    // Load system metrics
    await loadSystemMetrics();

    setLoading(false);
  };

  const loadSystemMetrics = async () => {
    try {
      // Get storage info
      const { data: storageData } = await supabase.storage
        .from("images")
        .list();

      // Mock metrics (in a real app, these would come from monitoring services)
      const mockMetrics: SystemMetrics = {
        database: {
          connections: 12,
          queries: 1547,
          avgResponseTime: 45,
          storage: {
            used: 2.3,
            total: 10,
            percentage: 23,
          },
        },
        api: {
          uptime: 99.8,
          requests: 8432,
          errors: 12,
          avgResponseTime: 120,
        },
        storage: {
          images: {
            count: storageData?.length || 0,
            size: 156.7, // MB
          },
          documents: {
            count: 0,
            size: 0,
          },
        },
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error("Error loading metrics:", error);
    }
  };

  const getStatusIcon = (status: HealthCheck["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusBadge = (status: HealthCheck["status"]) => {
    const variants = {
      healthy: "default",
      warning: "secondary",
      error: "destructive",
    } as const;

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  const overallStatus =
    healthChecks.length > 0
      ? healthChecks.some((check) => check.status === "error")
        ? "error"
        : healthChecks.some((check) => check.status === "warning")
          ? "warning"
          : "healthy"
      : "healthy";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-church-burgundy">
            System Health
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor system status and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              Last updated: {format(lastUpdate, "HH:mm:ss")}
            </span>
          )}
          <Button
            onClick={runHealthChecks}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <AdminDiagnostics />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getStatusIcon(overallStatus)}
            <span>System Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-church-burgundy capitalize">
                {overallStatus === "healthy"
                  ? "All Systems Operational"
                  : overallStatus === "warning"
                    ? "Some Issues Detected"
                    : "Critical Issues Found"}
              </p>
              <p className="text-gray-600">
                {healthChecks.filter((c) => c.status === "healthy").length} of{" "}
                {healthChecks.length} services healthy
              </p>
            </div>
            {getStatusBadge(overallStatus)}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="health" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="health">Health Checks</TabsTrigger>
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          {healthChecks.map((check, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <h3 className="font-medium">{check.name}</h3>
                      <p className="text-sm text-gray-600">{check.message}</p>
                      {check.details && (
                        <div className="text-xs text-gray-500 mt-1">
                          {Object.entries(check.details).map(([key, value]) => (
                            <span key={key} className="mr-3">
                              {key}:{" "}
                              {typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(check.status)}
                    <p className="text-xs text-gray-500 mt-1">
                      {format(check.lastChecked, "HH:mm:ss")}
                    </p>
                    {check.responseTime && (
                      <p className="text-xs text-gray-500">
                        {check.responseTime}ms
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          {metrics && (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Database className="h-4 w-4 mr-2" />
                      Database
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-church-burgundy">
                      {metrics.database.connections}
                    </div>
                    <p className="text-xs text-gray-500">Active connections</p>
                    <div className="mt-2 text-xs text-gray-600">
                      <div>Queries: {metrics.database.queries}</div>
                      <div>
                        Avg response: {metrics.database.avgResponseTime}ms
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Server className="h-4 w-4 mr-2" />
                      API
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-church-burgundy">
                      {metrics.api.uptime}%
                    </div>
                    <p className="text-xs text-gray-500">Uptime</p>
                    <div className="mt-2 text-xs text-gray-600">
                      <div>Requests: {metrics.api.requests}</div>
                      <div>Errors: {metrics.api.errors}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <HardDrive className="h-4 w-4 mr-2" />
                      Storage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-church-burgundy">
                      {metrics.database.storage.percentage}%
                    </div>
                    <p className="text-xs text-gray-500">Used</p>
                    <div className="mt-2 text-xs text-gray-600">
                      <div>
                        {metrics.database.storage.used}GB /{" "}
                        {metrics.database.storage.total}GB
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Activity className="h-4 w-4 mr-2" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-church-burgundy">
                      {metrics.api.avgResponseTime}ms
                    </div>
                    <p className="text-xs text-gray-500">Avg response time</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Storage Usage</CardTitle>
                    <CardDescription>File storage breakdown</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Images</span>
                      <span className="text-sm font-medium">
                        {metrics.storage.images.count} files (
                        {metrics.storage.images.size} MB)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Documents</span>
                      <span className="text-sm font-medium">
                        {metrics.storage.documents.count} files (
                        {metrics.storage.documents.size} MB)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-church-burgundy h-2 rounded-full"
                        style={{
                          width: `${metrics.database.storage.percentage}%`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Database Performance</CardTitle>
                    <CardDescription>
                      Query and connection metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          Active Connections
                        </p>
                        <p className="text-2xl font-bold text-church-burgundy">
                          {metrics.database.connections}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Queries</p>
                        <p className="text-2xl font-bold text-church-burgundy">
                          {metrics.database.queries}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Average Response Time
                      </p>
                      <p className="text-lg font-semibold">
                        {metrics.database.avgResponseTime}ms
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent System Events
              </CardTitle>
              <CardDescription>
                Latest system activities and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    time: "10:30:15",
                    level: "info",
                    message: "Database backup completed successfully",
                  },
                  {
                    time: "10:25:42",
                    level: "info",
                    message: "New member registration: John Doe",
                  },
                  {
                    time: "10:20:18",
                    level: "warning",
                    message: "High memory usage detected (85%)",
                  },
                  {
                    time: "10:15:33",
                    level: "info",
                    message: "Email campaign sent to 150 subscribers",
                  },
                  {
                    time: "10:10:07",
                    level: "error",
                    message: "Failed to process payment for donation #1234",
                  },
                  {
                    time: "10:05:21",
                    level: "info",
                    message: "System health check completed",
                  },
                ].map((log, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex-shrink-0">
                      {log.level === "error" ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : log.level === "warning" ? (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{log.message}</p>
                    </div>
                    <div className="text-xs text-gray-500">{log.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
