import { SyncStatus } from "@/types/task";

interface SyncStatusCardProps {
  status: SyncStatus;
}

export default function SyncStatusCard({ status }: SyncStatusCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Sync Status</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(status.total_tasks_by_source).map(([source, count]) => (
          <div key={source} className="text-center">
            <div className="text-3xl font-bold text-blue-600">{count}</div>
            <div className="text-sm text-gray-600 capitalize">{source} tasks</div>
          </div>
        ))}

        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {Object.values(status.total_tasks_by_source).reduce((a, b) => a + b, 0)}
          </div>
          <div className="text-sm text-gray-600">Total tasks</div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Last synced: {new Date(status.last_sync).toLocaleString()}
      </div>
    </div>
  );
}
