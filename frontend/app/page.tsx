"use client";

import { useState, useEffect } from "react";
import { fetchTaskComparison } from "@/lib/api";
import { TaskComparison, Task } from "@/types/task";
import TaskCard from "@/components/TaskCard";
import SyncStatusCard from "@/components/SyncStatusCard";

export default function Home() {
  const [data, setData] = useState<TaskComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "github" | "notion">("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");

  useEffect(() => {
    async function loadData() {
      try {
        const result = await fetchTaskComparison();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!data) return null;

  const getFilteredTasks = (): Task[] => {
    let tasks: Task[] = [];
    if (filter === "all") {
      tasks = data.all_tasks;
    } else {
      tasks = data.tasks_by_source[filter] || [];
    }

    // Filter by assignee
    if (assigneeFilter !== "all") {
      if (assigneeFilter === "unassigned") {
        tasks = tasks.filter(task => !task.assignee);
      } else {
        tasks = tasks.filter(task => task.assignee === assigneeFilter);
      }
    }

    return tasks;
  };

  // Get unique assignees
  const getAssignees = (): string[] => {
    const assignees = new Set<string>();
    data.all_tasks.forEach(task => {
      if (task.assignee) {
        assignees.add(task.assignee);
      }
    });
    return Array.from(assignees).sort();
  };

  const filteredTasks = getFilteredTasks();
  const assignees = getAssignees();

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Task Sync Dashboard</h1>
        <p className="text-gray-600">View and compare tasks across GitHub and Notion</p>
      </header>

      <SyncStatusCard status={data.sync_status} />

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          All Tasks ({data.all_tasks.length})
        </button>
        <button
          onClick={() => setFilter("github")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === "github"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          GitHub Only ({data.tasks_by_source.github?.length || 0})
        </button>
        <button
          onClick={() => setFilter("notion")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === "notion"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Notion Only ({data.tasks_by_source.notion?.length || 0})
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Assignee:
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setAssigneeFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              assigneeFilter === "all"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            All Assignees
          </button>
          <button
            onClick={() => setAssigneeFilter("unassigned")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              assigneeFilter === "unassigned"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            Unassigned
          </button>
          {assignees.map((assignee) => (
            <button
              key={assignee}
              onClick={() => setAssigneeFilter(assignee)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                assigneeFilter === assignee
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              {assignee}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No tasks found for this filter
        </div>
      )}
    </div>
  );
}
