import { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "done":
      case "closed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getImportanceColor = (score: number) => {
    if (score >= 80) return "border-red-500";
    if (score >= 50) return "border-orange-500";
    if (score >= 20) return "border-yellow-500";
    return "border-gray-300";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return <span className="text-red-600 font-semibold">Overdue by {Math.abs(diffDays)}d</span>;
    if (diffDays === 0) return <span className="text-orange-600 font-semibold">Due today</span>;
    if (diffDays === 1) return <span className="text-yellow-600">Due tomorrow</span>;
    if (diffDays <= 7) return <span className="text-yellow-600">Due in {diffDays}d</span>;
    return <span className="text-gray-600">Due in {diffDays}d</span>;
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${getImportanceColor(task.importance_score)} hover:shadow-md transition`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-gray-900">{task.title}</h3>
        <span className="text-sm font-bold text-purple-600">
          {Math.round(task.importance_score)}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
          {task.status.replace("_", " ")}
        </span>
        {task.sources.map((source) => (
          <span key={source} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
            {source}
          </span>
        ))}
      </div>

      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.map((label, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          {task.assignee && <span>@{task.assignee}</span>}
        </div>
        <div>
          {task.due_date && formatDate(task.due_date)}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        {Object.entries(task.urls).map(([source, url]) => (
          <a
            key={source}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            View in {source}
          </a>
        ))}
      </div>
    </div>
  );
}
