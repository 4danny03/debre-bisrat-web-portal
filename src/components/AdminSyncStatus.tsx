
import { useDataContext } from "../contexts/DataContext";

export default function AdminSyncStatus() {
  const { connectionHealth, syncStatus, gitStatus, lastRefresh, isRefreshing, forceSync, autoCommitAndPush } = useDataContext();

  const handleForceSync = async () => {
    await forceSync();
  };

  const handleAutoCommit = async () => {
    const success = await autoCommitAndPush("Auto commit from admin panel");
    if (success) {
      console.log("Auto commit successful");
    }
  };

  return (
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
