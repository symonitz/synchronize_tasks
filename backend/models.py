from pydantic import BaseModel
from typing import Optional, List, Set
from datetime import datetime, timezone
from enum import Enum


class TaskStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"
    DONE = "done"


class Task(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    sources: Set[str] = set()
    source_ids: dict[str, str] = {}
    labels: List[str] = []
    due_date: Optional[datetime] = None
    assignee: Optional[str] = None
    status: TaskStatus
    importance_score: float = 0.0
    urls: dict[str, str] = {}
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def calculate_importance(self) -> float:
        score = 0.0

        if self.due_date:
            now = datetime.now(timezone.utc)
            days_until_due = (self.due_date - now).days

            if days_until_due < 0:
                score += 100
            elif days_until_due == 0:
                score += 90
            elif days_until_due <= 1:
                score += 80
            elif days_until_due <= 3:
                score += 70
            elif days_until_due <= 7:
                score += 60
            elif days_until_due <= 14:
                score += 40
            elif days_until_due <= 30:
                score += 20

        priority_labels = ['high', 'urgent', 'critical', 'p0', 'p1']
        for label in self.labels:
            if any(p in label.lower() for p in priority_labels):
                score += 30
                break

        if self.status == "in_progress":
            score += 15
        elif self.status == "open":
            score += 10

        if self.assignee:
            score += 5

        if self.updated_at:
            days_since_update = (datetime.now(timezone.utc) - self.updated_at).days
            if days_since_update > 60:
                score -= 20
            elif days_since_update > 30:
                score -= 10

        return score

    class Config:
        json_encoders = {
            set: list
        }


class SyncStatus(BaseModel):
    total_tasks_by_source: dict[str, int]
    last_sync: datetime


class TaskComparison(BaseModel):
    all_tasks: List[Task]
    tasks_by_source: dict[str, List[Task]]
    sync_status: SyncStatus
