from notion_client import Client
from typing import List, Optional
from models import Task, TaskStatus
from config import settings
from datetime import datetime


class NotionClient:
    def __init__(self):
        self.client = Client(auth=settings.notion_token)
        self.database_id = settings.notion_database_id

    def get_all_tasks(self) -> List[Task]:
        tasks = []
        results = self.client.databases.query(database_id=self.database_id)

        for page in results.get('results', []):
            task = self._parse_notion_page(page)
            if task:
                tasks.append(task)

        while results.get('has_more'):
            results = self.client.databases.query(
                database_id=self.database_id,
                start_cursor=results.get('next_cursor')
            )
            for page in results.get('results', []):
                task = self._parse_notion_page(page)
                if task:
                    tasks.append(task)

        return tasks

    def _parse_notion_page(self, page: dict) -> Optional[Task]:
        properties = page.get('properties', {})

        title = self._get_title(properties)
        if not title:
            return None

        status = self._get_status(properties)
        due_date = self._get_due_date(properties)
        assignee = self._get_assignee(properties)
        labels = self._get_labels(properties)

        task = Task(
            id=f"notion-{page['id']}",
            title=title,
            description=None,
            sources={"notion"},
            source_ids={"notion": page['id']},
            labels=labels,
            due_date=due_date,
            assignee=assignee,
            status=status,
            urls={"notion": page.get('url', '')},
            created_at=datetime.fromisoformat(page['created_time'].replace('Z', '+00:00')),
            updated_at=datetime.fromisoformat(page['last_edited_time'].replace('Z', '+00:00'))
        )

        return task

    def _get_title(self, properties: dict) -> Optional[str]:
        for key in ['Name', 'Title', 'Task', 'name', 'title']:
            if key in properties:
                prop = properties[key]
                if prop['type'] == 'title' and prop['title']:
                    return ''.join([text['plain_text'] for text in prop['title']])
        return None

    def _get_status(self, properties: dict) -> TaskStatus:
        for key in ['Status', 'status']:
            if key in properties:
                prop = properties[key]
                if prop['type'] == 'status' and prop.get('status'):
                    status_name = prop['status']['name'].lower()
                    if 'done' in status_name or 'complete' in status_name:
                        return TaskStatus.DONE
                    elif 'progress' in status_name:
                        return TaskStatus.IN_PROGRESS
                    else:
                        return TaskStatus.OPEN
                elif prop['type'] == 'select' and prop.get('select'):
                    status_name = prop['select']['name'].lower()
                    if 'done' in status_name or 'complete' in status_name:
                        return TaskStatus.DONE
                    elif 'progress' in status_name:
                        return TaskStatus.IN_PROGRESS
                    else:
                        return TaskStatus.OPEN
        return TaskStatus.OPEN

    def _get_due_date(self, properties: dict) -> Optional[datetime]:
        for key in ['Due Date', 'Due', 'Deadline', 'due_date']:
            if key in properties:
                prop = properties[key]
                if prop['type'] == 'date' and prop.get('date'):
                    date_str = prop['date']['start']
                    try:
                        return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                    except:
                        pass
        return None

    def _get_assignee(self, properties: dict) -> Optional[str]:
        for key in ['Assignee', 'Assigned to', 'Owner', 'assignee']:
            if key in properties:
                prop = properties[key]
                if prop['type'] == 'people' and prop.get('people'):
                    return prop['people'][0]['name'] if prop['people'] else None
        return None

    def _get_labels(self, properties: dict) -> List[str]:
        for key in ['Tags', 'Labels', 'Category', 'tags']:
            if key in properties:
                prop = properties[key]
                if prop['type'] == 'multi_select' and prop.get('multi_select'):
                    return [tag['name'] for tag in prop['multi_select']]
        return []
