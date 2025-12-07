import { TaskComparison, Task, SyncStatus } from "@/types/task";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchTaskComparison(): Promise<TaskComparison> {
  const response = await fetch(`${API_URL}/api/sync`);
  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }
  return response.json();
}

export async function fetchAllTasks(): Promise<Task[]> {
  const response = await fetch(`${API_URL}/api/tasks`);
  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }
  return response.json();
}

export async function fetchTasksBySource(source: string): Promise<Task[]> {
  const response = await fetch(`${API_URL}/api/tasks/${source}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch tasks for ${source}`);
  }
  return response.json();
}

export async function fetchSyncStatus(): Promise<SyncStatus> {
  const response = await fetch(`${API_URL}/api/status`);
  if (!response.ok) {
    throw new Error("Failed to fetch sync status");
  }
  return response.json();
}
