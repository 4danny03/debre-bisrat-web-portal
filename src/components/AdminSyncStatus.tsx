
import { useDataContext } from "../contexts/DataContext";

export default function AdminSyncStatus() {
  const { connectionHealth, gitStatus, lastRefresh, isRefreshing, forceSync, autoCommitAndPush } = useDataContext();

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
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Sync Status</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-medium">Connection Health</h3>
          <div className={`inline-flex items-center px-2 py-1 rounded text-sm ${
            connectionHealth ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {connectionHealth ? 'Connected' : 'Disconnected'}
          </div>
        </div>

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
        <div className="space-y-2">
          <h3 className="font-medium">Git Status</h3>
          <div className="text-sm text-gray-600">
            <p>Branch: {gitStatus.branch}</p>
            <p>Changes: {gitStatus.hasChanges ? 'Yes' : 'No'}</p>
            {gitStatus.changedFiles.length > 0 && (
              <div className="mt-1">
                <p className="font-medium">Changed files:</p>
                <ul className="list-disc list-inside ml-2">
                  {gitStatus.changedFiles.map((file: string, index: number) => (
                    <li key={index} className="text-xs">{file}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
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
          disabled={isRefreshing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isRefreshing ? 'Syncing...' : 'Force Sync'}
        </button>
        
        {gitStatus.hasChanges && (
          <button
            onClick={handleAutoCommit}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Auto Commit & Push
          </button>
        )}
      </div>

      {lastRefresh && (
        <p className="text-xs text-gray-500 mt-2">
          Last refresh: {lastRefresh.toLocaleString()}
        </p>
      )}
    </div>
  );
}
