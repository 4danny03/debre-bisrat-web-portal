import React from "react";
import { useDataContext } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  GitBranch,
  Database,
  Wifi,
  WifiOff,
} from "lucide-react";
import { format } from "date-fns";

interface AdminSyncStatusProps {
  className?: string;
}

export default function AdminSyncStatus({ className }: AdminSyncStatusProps) {
  const {
    connectionHealth,
    syncStatus,
    gitStatus,
    lastRefresh,
    isRefreshing,
    forceSync,
    autoCommitAndPush,
  } = useDataContext();

  const handleForceSync = async () => {
    console.log("Force sync triggered from admin panel");
    await forceSync();
  };

  const handleAutoCommit = async () => {
    const success = await autoCommitAndPush(
      "Admin sync: Manual commit from dashboard",
    );
    if (success) {
      console.log("Successfully committed and pushed changes");
    } else {
      console.error("Failed to commit and push changes");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBSCRIBED":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        );
      case "CHANNEL_ERROR":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      case "CONNECTING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Connecting
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Ensure we have safe defaults for all data
  const safeConnectionHealth = connectionHealth ?? true;
  const safeSyncStatus = syncStatus ?? {};
  const safeGitStatus = gitStatus ?? {
    branch: "main",
    hasChanges: false,
    changedFiles: [],
  };
  const safeLastRefresh = lastRefresh;
  const safeIsRefreshing = isRefreshing ?? false;

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
            {Object.keys(safeSyncStatus).length > 0 ? (
              Object.entries(safeSyncStatus).map(([table, status]) => (
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

      {/* Action Buttons */}
      <div className="space-y-2">
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
            <GitBranch className="w-4 h-4 mr-2" />
            Commit & Push Changes
          </Button>
        )}
      </div>
    </div>
  );
}
