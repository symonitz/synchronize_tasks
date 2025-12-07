from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
from github_client import GitHubClient
from notion_client import NotionClient
from models import TaskComparison, SyncStatus
from config import settings
import uvicorn

app = FastAPI(title="Task Sync API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

github_client = GitHubClient()
notion_client = NotionClient() if settings.notion_token and settings.notion_database_id else None


@app.get("/")
def root():
    return {"status": "ok", "message": "Task Sync API"}


@app.get("/api/sync")
def sync_tasks():
    try:
        github_tasks = github_client.get_all_issues()
        notion_tasks = notion_client.get_all_tasks() if notion_client else []

        all_tasks = github_tasks + notion_tasks

        for task in all_tasks:
            task.importance_score = task.calculate_importance()

        tasks_by_source = {
            "github": github_tasks,
        }
        if notion_client:
            tasks_by_source["notion"] = notion_tasks

        sync_status_data = {
            "github": len(github_tasks),
        }
        if notion_client:
            sync_status_data["notion"] = len(notion_tasks)

        sync_status = SyncStatus(
            total_tasks_by_source=sync_status_data,
            last_sync=datetime.now(timezone.utc)
        )

        result = TaskComparison(
            all_tasks=sorted(all_tasks, key=lambda t: t.importance_score, reverse=True),
            tasks_by_source=tasks_by_source,
            sync_status=sync_status
        )

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/tasks")
def get_all_tasks():
    try:
        github_tasks = github_client.get_all_issues()
        notion_tasks = notion_client.get_all_tasks() if notion_client else []

        all_tasks = github_tasks + notion_tasks

        for task in all_tasks:
            task.importance_score = task.calculate_importance()

        return sorted(all_tasks, key=lambda t: t.importance_score, reverse=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/tasks/{source}")
def get_tasks_by_source(source: str):
    try:
        if source == "github":
            tasks = github_client.get_all_issues()
        elif source == "notion":
            if not notion_client:
                raise HTTPException(status_code=503, detail="Notion integration not configured")
            tasks = notion_client.get_all_tasks()
        else:
            raise HTTPException(status_code=404, detail=f"Source '{source}' not found")

        for task in tasks:
            task.importance_score = task.calculate_importance()

        return sorted(tasks, key=lambda t: t.importance_score, reverse=True)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/status")
def get_sync_status():
    try:
        github_tasks = github_client.get_all_issues()
        notion_tasks = notion_client.get_all_tasks() if notion_client else []

        sync_status_data = {
            "github": len(github_tasks),
        }
        if notion_client:
            sync_status_data["notion"] = len(notion_tasks)

        return SyncStatus(
            total_tasks_by_source=sync_status_data,
            last_sync=datetime.now(timezone.utc)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True
    )
