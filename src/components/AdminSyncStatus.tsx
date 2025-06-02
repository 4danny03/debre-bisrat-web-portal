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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection Health */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            {connectionHealth ? (
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
              className={connectionHealth ? "text-green-600" : "text-red-600"}
            >
              {connectionHealth ? "Healthy" : "Disconnected"}
            </span>
            {lastRefresh && (
              <span className="text-xs text-gray-500">
                Last: {format(lastRefresh, "HH:mm:ss")}
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
            {Object.entries(syncStatus).map(([table, status]) => (
              <div
                key={table}
                className="flex items-center justify-between text-sm"
              >
                <span className="capitalize">{table}</span>
                {getStatusBadge(status)}
              </div>
            ))}
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
              <Badge variant="outline">{gitStatus.branch}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Changes:</span>
              <Badge
                className={
                  gitStatus.hasChanges
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }
              >
                {gitStatus.hasChanges
                  ? `${gitStatus.changedFiles.length} files`
                  : "Clean"}
              </Badge>
            </div>
            {gitStatus.changedFiles.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-gray-500">Changed files:</span>
                <div className="max-h-20 overflow-y-auto">
                  {gitStatus.changedFiles.map((file, index) => (
                    <div key={index} className="text-xs text-gray-600 truncate">
                      {file}
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
          disabled={isRefreshing}
          className="w-full"
          variant="outline"
        >
          {isRefreshing ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Force Sync Data
        </Button>

        {gitStatus.hasChanges && (
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
