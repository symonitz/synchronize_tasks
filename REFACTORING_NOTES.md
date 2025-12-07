# Refactoring Notes

## Problem Identified

**Tight Coupling**: GitHub client had knowledge of Notion, and Notion client had knowledge of GitHub.

### Before:
```python
# github_client.py
notion_id = self._extract_notion_id(issue)
if notion_id:
    sources.add("notion")
    source_ids["notion"] = notion_id
```

This violated separation of concerns - why should GitHub know about Notion?

## Solution

### Architecture Changes

**1. Added Metadata Field**
- Added `metadata: dict[str, any]` to Task model
- Used to store cross-references without polluting the main data structure

**2. Client Responsibilities**
Each client now only knows about its own source:

**GitHub Client**:
- Fetches GitHub issues
- Extracts external references from issue body (Notion URLs)
- Stores references in `metadata["external_refs"]`
- Returns tasks with only `sources={"github"}`

**Notion Client**:
- Fetches Notion tasks
- Reads GitHub issue number from Notion properties
- Stores references in `metadata["external_refs"]`
- Returns tasks with only `sources={"notion"}`

**3. TaskSyncEngine Responsibilities**
- Reads metadata from both sources
- Matches tasks based on cross-references
- Merges matched tasks (combines sources, IDs, URLs)
- Returns unified task list

### Code Flow

```
GitHub Issue #123 (body contains: "notion.so/abc123")
    ↓ GitHubClient extracts
Task {
    sources: {"github"},
    source_ids: {"github": "123"},
    metadata: {"external_refs": {"notion": ["abc123"]}}
}

Notion Page abc123 (property: GitHub Issue = 123)
    ↓ NotionClient extracts
Task {
    sources: {"notion"},
    source_ids: {"notion": "abc123"},
    metadata: {"external_refs": {"github": ["123"]}}
}

    ↓ TaskSyncEngine merges

Task {
    sources: {"github", "notion"},
    source_ids: {"github": "123", "notion": "abc123"},
    urls: {"github": "...", "notion": "..."},
    ...
}
```

## Benefits

**1. Separation of Concerns**
- Each client is independent
- Easy to add new sources (Jira, Linear, etc.)
- No cross-source dependencies

**2. Testability**
- Can test GitHub client without Notion
- Can test Notion client without GitHub
- Mocking is simpler

**3. Extensibility**
- Adding a new source requires:
  1. New client that extracts its data + external refs
  2. Update TaskSyncEngine to handle matching
  3. No changes to existing clients

**4. Maintainability**
- Changes to one source don't affect others
- Clear responsibility boundaries
- Easier to reason about code

## Future Improvements

- Create a `CrossReferenceExtractor` service for common extraction logic
- Add fuzzy matching (by title) for tasks without explicit refs
- Support multiple matching strategies (strict refs, fuzzy, manual)
