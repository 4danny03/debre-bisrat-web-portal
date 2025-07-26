import React, { useState, useEffect, useCallback } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  User,
  Clock,
  Database,
  Download,
  RefreshCw,
  Eye,
} from "lucide-react";
import { dataSyncService } from "@/services/DataSyncService";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Json } from "@/types/supabase";

interface AuditLogEntry {
  id: string;
  action: string;
  table: string;
  data?: Json;
  user_id?: string;
  userId?: string;
  timestamp: string;
  details?: string;
}

interface AuditLogStatistics {
  today: number;
  thisWeek: number;
  criticalCount: number;
  total: number;
  byAction: Record<string, number>;
  byUser: Record<string, number>;
}

interface AuditLogProps {
  className?: string;
  ariaLabel?: string;
}

const AuditLog: React.FC<AuditLogProps> = ({ className, ariaLabel }) => {
  const [actions, setActions] = useState<AuditLogEntry[]>([]);
  const [criticalActions, setCriticalActions] = useState<AuditLogEntry[]>([]);
  const [statistics, setStatistics] = useState<AuditLogStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");
  const [activeTab, setActiveTab] = useState("recent");
  const { toast } = useToast();

  const loadAuditData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch recent actions from Supabase
      const actionsFromDb =
        await dataSyncService.getRecentAdminActionsFromDb(50);
      setActions(actionsFromDb);
      setCriticalActions(
        actionsFromDb.filter(
          (a) => a.action && a.action.toLowerCase().includes("delete"),
        ),
      );
      setStatistics({
        today: actionsFromDb.filter(
          (a) =>
            new Date(a.timestamp).toDateString() === new Date().toDateString(),
        ).length,
        thisWeek: actionsFromDb.filter((a) => {
          const now = new Date();
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          return new Date(a.timestamp) >= weekAgo;
        }).length,
        criticalCount: actionsFromDb.filter(
          (a) => a.action && a.action.toLowerCase().includes("delete"),
        ).length,
        total: actionsFromDb.length,
        byAction: actionsFromDb.reduce(
          (acc, a) => {
            acc[a.action] = (acc[a.action] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
        byUser: actionsFromDb.reduce(
          (acc, a) => {
            const uid = a.user_id || a.userId || "unknown";
            acc[uid] = (acc[uid] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
      });
    } catch (error) {
      console.error("Error loading audit data:", error);
      toast({
        title: "Error",
        description: "Failed to load audit log data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAuditData();
    const interval = setInterval(loadAuditData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [loadAuditData]);

  const exportAuditLog = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      timeRange,
      statistics,
      actions: actions.slice(0, 1000), // Limit export size
      criticalActions,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${format(new Date(), "yyyy-MM-dd-HH-mm")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Audit log exported successfully",
    });
  };

  const getActionIcon = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes("delete"))
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (lower.includes("create"))
      return <Database className="h-4 w-4 text-green-600" />;
    if (lower.includes("update"))
      return <Eye className="h-4 w-4 text-blue-600" />;
    return <Clock className="h-4 w-4 text-gray-600" />;
  };

  const getActionBadge = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes("delete"))
      return <Badge variant="destructive">Delete</Badge>;
    if (lower.includes("create"))
      return <Badge className="bg-green-100 text-green-800">Create</Badge>;
    if (lower.includes("update"))
      return <Badge className="bg-blue-100 text-blue-800">Update</Badge>;
    return <Badge variant="secondary">{action}</Badge>;
  };

  return (
    <div
      className={`space-y-6 ${className}`}
      role="region"
      aria-label={ariaLabel || "Audit log"}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" role="region" aria-label="Audit log controls">
        <div>
          <h2 className="text-2xl font-bold text-church-burgundy" id="audit-log-title">Audit Log</h2>
          <p className="text-gray-600 mt-1">
            Track all administrative actions and system events
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last Day</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={exportAuditLog}
            variant="outline"
            className="flex-1 sm:flex-none"
            aria-label="Export audit log"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={loadAuditData}
            variant="outline"
            className="flex-1 sm:flex-none"
            aria-label="Refresh audit log"
            aria-busy={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              aria-hidden={!loading}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" role="region" aria-label="Audit statistics overview">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today</p>
                  <p className="text-2xl font-bold text-church-burgundy">
                    {statistics.today}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-church-burgundy" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-church-burgundy">
                    {statistics.thisWeek}
                  </p>
                </div>
                <Database className="h-8 w-8 text-church-burgundy" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Critical Actions
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {statistics.criticalCount}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Actions
                  </p>
                  <p className="text-2xl font-bold text-church-burgundy">
                    {statistics.total}
                  </p>
                </div>
                <User className="h-8 w-8 text-church-burgundy" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} aria-label="Audit log tabs">
        <TabsList className="grid w-full grid-cols-3" role="tablist">
          <TabsTrigger value="recent" role="tab" aria-controls="recent-tab">Recent Actions</TabsTrigger>
          <TabsTrigger value="critical" role="tab" aria-controls="critical-tab">Critical Actions</TabsTrigger>
          <TabsTrigger value="statistics" role="tab" aria-controls="statistics-tab">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4" id="recent-tab" role="tabpanel" aria-labelledby="recent">
          {loading ? (
            <div className="flex items-center justify-center h-32" aria-live="polite">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-church-burgundy" aria-label="Loading recent actions"></div>
            </div>
          ) : actions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent actions found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {actions.map((action, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getActionIcon(action.action)}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-sm">
                              {action.action}
                            </p>
                            {getActionBadge(action.action)}
                          </div>
                          <p className="text-sm text-gray-600">
                            Table: {action.table}
                          </p>
                          {typeof action.data === "object" && action.data !== null && "preview" in action.data && (
                            <p className="text-xs text-gray-500 truncate">
                              Data: {(action.data as { preview?: string }).preview}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                            <span>
                              User:{" "}
                              {action.user_id || action.userId || "unknown"}
                            </span>
                            <span>
                              {format(
                                new Date(action.timestamp),
                                "MMM d, HH:mm:ss",
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="critical" className="space-y-4" id="critical-tab" role="tabpanel" aria-labelledby="critical">
          {criticalActions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No critical actions recorded</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {criticalActions.map((action, index) => (
                <Card key={index} className="border-red-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-sm text-red-900">
                              {action.action}
                            </p>
                            <Badge variant="destructive">Critical</Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Table: {action.table}
                          </p>
                          {typeof action.data === "object" && action.data !== null && "preview" in action.data && (
                            <p className="text-xs text-gray-500 truncate">
                              Data: {(action.data as { preview?: string }).preview}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                            <span>
                              User:{" "}
                              {action.user_id || action.userId || "unknown"}
                            </span>
                            <span>
                              {format(
                                new Date(action.timestamp),
                                "MMM d, HH:mm:ss",
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4" id="statistics-tab" role="tabpanel" aria-labelledby="statistics">
          {statistics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>Key audit log statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    <li>
                      Today:{" "}
                      <span className="font-semibold">{statistics.today}</span>
                    </li>
                    <li>
                      This week:{" "}
                      <span className="font-semibold">
                        {statistics.thisWeek}
                      </span>
                    </li>
                    <li>
                      Critical actions:{" "}
                      <span className="font-semibold text-red-700">
                        {statistics.criticalCount}
                      </span>
                    </li>
                    <li>
                      Total actions:{" "}
                      <span className="font-semibold">{statistics.total}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Actions by User</CardTitle>
                  <CardDescription>User activity breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    {Object.entries(statistics.byUser).map(([user, count]) => (
                      <li key={user}>
                        <span className="font-semibold">{user}</span>: {count}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No statistics available
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditLog;
