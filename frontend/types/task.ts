export type TaskStatus = "open" | "in_progress" | "closed" | "done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  sources: string[];
  source_ids: Record<string, string>;
  labels: string[];
  due_date?: string;
  assignee?: string;
  status: TaskStatus;
  importance_score: number;
  urls: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

export interface SyncStatus {
  total_tasks_by_source: Record<string, number>;
  last_sync: string;
}

export interface TaskComparison {
  all_tasks: Task[];
  tasks_by_source: Record<string, Task[]>;
  sync_status: SyncStatus;
}
