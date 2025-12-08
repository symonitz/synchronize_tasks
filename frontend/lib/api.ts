import { TaskComparison, Task, SyncStatus } from "@/types/task";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (API_KEY) {
    headers["X-API-Key"] = API_KEY;
  }
  return headers;
}

export async function fetchTaskComparison(): Promise<TaskComparison> {
  const response = await fetch(`${API_URL}/api/sync`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }
  return response.json();
}

export async function fetchAllTasks(): Promise<Task[]> {
  const response = await fetch(`${API_URL}/api/tasks`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }
  return response.json();
}

export async function fetchTasksBySource(source: string): Promise<Task[]> {
  const response = await fetch(`${API_URL}/api/tasks/${source}`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch tasks for ${source}`);
  }
  return response.json();
}

export async function fetchSyncStatus(): Promise<SyncStatus> {
  const response = await fetch(`${API_URL}/api/status`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch sync status");
  }
  return response.json();
}
