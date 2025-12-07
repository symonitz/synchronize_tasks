from github import Github
from typing import List
from models import Task, TaskStatus
from config import settings
from datetime import datetime


class GitHubClient:
    def __init__(self):
        self.client = Github(settings.github_token)
        self.repo = self.client.get_repo(settings.github_repo)

    def get_all_issues(self) -> List[Task]:
        tasks = []
        issues = self.repo.get_issues(state='all')

        for issue in issues:
            if issue.pull_request:
                continue

            status = TaskStatus.CLOSED if issue.state == 'closed' else TaskStatus.OPEN
            if any(label.name.lower() in ['in progress', 'in-progress'] for label in issue.labels):
                status = TaskStatus.IN_PROGRESS

            due_date = None
            if issue.milestone and issue.milestone.due_on:
                due_date = issue.milestone.due_on

            task = Task(
                id=f"gh-{issue.number}",
                title=issue.title,
                description=issue.body,
                sources={"github"},
                source_ids={"github": str(issue.number)},
                labels=[label.name for label in issue.labels],
                due_date=due_date,
                assignee=issue.assignee.login if issue.assignee else None,
                status=status,
                urls={"github": issue.html_url},
                created_at=issue.created_at,
                updated_at=issue.updated_at
            )

            tasks.append(task)

        return tasks
