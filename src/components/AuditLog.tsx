import React, { useState, useEffect } from "react";
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
  Filter,
  Eye,
} from "lucide-react";
import { dataSyncService } from "@/services/DataSyncService";
import { format, subDays, subWeeks, subMonths } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface AuditLogProps {
  className?: string;
}

const AuditLog: React.FC<AuditLogProps> = ({ className }) => {
  const [actions, setActions] = useState<any[]>([]);
  const [criticalActions, setCriticalActions] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("week");
  const [activeTab, setActiveTab] = useState("recent");
  const { toast } = useToast();

  useEffect(() => {
    loadAuditData();
    const interval = setInterval(loadAuditData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [filter, timeRange]);

  const loadAuditData = async () => {
    try {
      setLoading(true);

      // Get filtered actions based on time range
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case "day":
          startDate = subDays(now, 1);
          break;
        case "week":
          startDate = subWeeks(now, 1);
          break;
        case "month":
          startDate = subMonths(now, 1);
          break;
        default:
          startDate = subWeeks(now, 1);
      }

      const filteredActions = dataSyncService.getActionsByDateRange(
        startDate,
        now,
      );
      const recentActions = dataSyncService.getRecentAdminActions(50);
      const critical = dataSyncService.getCriticalActions(20);
      const stats = dataSyncService.getActionStatistics();

      setActions(filter === "all" ? recentActions : filteredActions);
      setCriticalActions(critical);
      setStatistics(stats);
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
  };

  const exportAuditLog = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      timeRange,
      filter,
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
    if (action.includes("delete"))
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (action.includes("create"))
      return <Database className="h-4 w-4 text-green-600" />;
    if (action.includes("update"))
      return <Eye className="h-4 w-4 text-blue-600" />;
    return <Clock className="h-4 w-4 text-gray-600" />;
  };

  const getActionBadge = (action: string) => {
    if (action.includes("delete"))
      return <Badge variant="destructive">Delete</Badge>;
    if (action.includes("create"))
      return <Badge className="bg-green-100 text-green-800">Create</Badge>;
    if (action.includes("update"))
      return <Badge className="bg-blue-100 text-blue-800">Update</Badge>;
    return <Badge variant="secondary">{action}</Badge>;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-church-burgundy">Audit Log</h2>
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
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={loadAuditData}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recent">Recent Actions</TabsTrigger>
          <TabsTrigger value="critical">Critical Actions</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-church-burgundy"></div>
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
                          {action.data?.preview && (
                            <p className="text-xs text-gray-500 truncate">
                              Data: {action.data.preview}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                            <span>User: {action.userId}</span>
                            <span>
                              Session: {action.sessionId?.substring(0, 8)}...
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

        <TabsContent value="critical" className="space-y-4">
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
                          {action.data?.preview && (
                            <p className="text-xs text-gray-500 truncate">
                              Data: {action.data.preview}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                            <span>User: {action.userId}</span>
                            <span>
                              Session: {action.sessionId?.substring(0, 8)}...
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

        <TabsContent value="statistics" className="space-y-6">
          {statistics && (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Actions by Type</CardTitle>
                    <CardDescription>
                      Breakdown of administrative actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(statistics.byAction).map(
                        ([action, count]) => (
                          <div
                            key={action}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm capitalize">
                              {action.replace("_", " ")}
                            </span>
                            <Badge variant="outline">{count as number}</Badge>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actions by User</CardTitle>
                    <CardDescription>User activity breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(statistics.byUser).map(
                        ([user, count]) => (
                          <div
                            key={user}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">{user}</span>
                            <Badge variant="outline">{count as number}</Badge>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditLog;
