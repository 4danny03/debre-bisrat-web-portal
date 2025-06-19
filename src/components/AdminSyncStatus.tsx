import { useDataContext } from "../contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Wifi, WifiOff, Database, GitBranch, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface AdminSyncStatusProps {
  className?: string;
}

export default function AdminSyncStatus({ className }: AdminSyncStatusProps) {
  const {
    connectionHealth,
    gitStatus,
    lastRefresh,
    isRefreshing,
    forceSync,
    autoCommitAndPush,
  } = useDataContext();

  const handleForceSync = async () => {
    await forceSync();
  };

  const handleAutoCommit = async () => {
    const success = await autoCommitAndPush("Auto commit from admin panel");
    if (success) {
      console.log("Auto commit successful");
    }
  };

  // Ensure we have safe defaults for all data
  const safeConnectionHealth = connectionHealth ?? true;
  const syncStatus = {}; // Default empty object for sync status
  const safeGitStatus = gitStatus ?? {
    branch: "main",
    hasChanges: false,
    changedFiles: [],
  };
  const safeLastRefresh = lastRefresh;
  const safeIsRefreshing = isRefreshing ?? false;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case "disconnected":
        return <Badge className="bg-red-100 text-red-800">Disconnected</Badge>;
      case "syncing":
        return <Badge className="bg-blue-100 text-blue-800">Syncing</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  return (
    <div className={`space-y-4 ${className || ""}`}>
      {/* Connection Health */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            {safeConnectionHealth ? (
              <Wifi className="w-4 h-4 mr-2 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 mr-2 text-red-600" />
            )}
            Database Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span
              className={
                safeConnectionHealth ? "text-green-600" : "text-red-600"
              }
            >
              {safeConnectionHealth ? "Healthy" : "Disconnected"}
            </span>
            {safeLastRefresh && (
              <span className="text-xs text-gray-500">
                Last: {format(safeLastRefresh, "HH:mm:ss")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Sync Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Database className="w-4 h-4 mr-2" />
            Real-time Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.keys(syncStatus).length > 0 ? (
              Object.entries(syncStatus).map(([table, status]) => (
                <div
                  key={table}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="capitalize">{table}</span>
                  {getStatusBadge(status || "unknown")}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">
                No active subscriptions
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Git Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <GitBranch className="w-4 h-4 mr-2" />
            Git Repository
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Branch:</span>
              <Badge variant="outline">{safeGitStatus.branch}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Changes:</span>
              <Badge
                className={
                  safeGitStatus.hasChanges
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }
              >
                {safeGitStatus.hasChanges
                  ? `${safeGitStatus.changedFiles?.length || 0} files`
                  : "Clean"}
              </Badge>
            </div>
            {safeGitStatus.changedFiles &&
              safeGitStatus.changedFiles.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500">Changed files:</span>
                  <div className="max-h-20 overflow-y-auto">
                    {safeGitStatus.changedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="text-xs text-gray-600 truncate"
                      >
                        {file || "Unknown file"}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex gap-2">
        <Button
          onClick={handleForceSync}
          disabled={safeIsRefreshing}
          className="w-full"
          variant="outline"
        >
          {safeIsRefreshing ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Force Sync Data
        </Button>

        {safeGitStatus.hasChanges && (
          <Button
            onClick={handleAutoCommit}
            className="w-full"
            variant="default"
          >
            Auto Commit & Push
          </Button>
        )}
      </div>

      {safeLastRefresh && (
        <p className="text-xs text-gray-500 mt-2">
          Last refresh: {safeLastRefresh.toLocaleString()}
        </p>
      )}
    </div>
  );
}
