# Task Synchronization Dashboard

A full-stack application to sync and visualize tasks between GitHub Issues and Notion with intelligent importance scoring.

## Features

- **Read-only sync** between GitHub Issues and Notion
- **Importance scoring** based on due dates and custom factors
- **Visual dashboard** showing all tasks with their priority
- **Missing task detection** - see which tasks exist in one system but not the other
- **Multi-source support** - designed to support additional task sources in the future

## Architecture

- **Backend**: Python + FastAPI
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Deployment**:
  - Backend: Railway/Render
  - Frontend: Vercel

## Setup

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

5. Run the backend:
   ```bash
   python main.py
   ```

   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your backend URL
   ```

4. Run the frontend:
   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:3000`

## Deployment

### Deploy Backend to Railway/Render

1. **Railway**:
   - Push code to GitHub
   - Connect repository to Railway
   - Add environment variables in Railway dashboard
   - Railway will auto-detect Python and deploy

2. **Render**:
   - Push code to GitHub
   - Create new Web Service in Render
   - Connect repository
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables

### Deploy Frontend to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Vercel will auto-detect Next.js
4. Add environment variable: `NEXT_PUBLIC_API_URL` pointing to your backend URL
5. Deploy

## Configuration

### GitHub

1. Create a Personal Access Token:
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Generate new token with `repo` scope
   - Copy token to `GITHUB_TOKEN` in `.env`

2. Set repository in format `owner/repo-name`

### Notion

1. Create an integration:
   - Go to https://www.notion.so/my-integrations
   - Create new integration
   - Copy Internal Integration Token to `NOTION_TOKEN` in `.env`

2. Get database ID:
   - Open your Notion database
   - Copy database ID from URL
   - Add to `NOTION_DATABASE_ID` in `.env`

3. Share database with integration:
   - Click "..." in your database
   - Select "Add connections"
   - Find and add your integration

### Field Mapping

Configure how GitHub and Notion link to each other:

- `NOTION_GITHUB_ID_FIELD`: Notion property name that stores GitHub issue number
- `GITHUB_NOTION_ID_FIELD`: Not currently used (GitHub issues don't support custom fields easily)

## API Endpoints

- `GET /` - Health check
- `GET /api/sync` - Get full sync data (all tasks + status)
- `GET /api/tasks` - Get all tasks sorted by importance
- `GET /api/missing/{source}` - Get tasks missing in specific source
- `GET /api/status` - Get sync status summary

## Importance Scoring Algorithm

Tasks are scored based on:

- **Due dates** (0-100 points):
  - Overdue: 100
  - Due today: 90
  - Due in 1 day: 80
  - Due in 3 days: 70
  - Due in 7 days: 60
  - Due in 14 days: 40
  - Due in 30 days: 20

- **Priority labels** (+30 points):
  - high, urgent, critical, p0, p1

- **Status** (10-15 points):
  - In progress: +15
  - Open: +10

- **Assignee** (+5 points)

- **Staleness** (-10 to -20 points):
  - Not updated in 30+ days: -10
  - Not updated in 60+ days: -20

## Future Enhancements

- Add write capabilities (create missing tasks)
- Support for more task sources (Jira, Linear, etc.)
- Custom scoring rules
- Task filtering and search
- Bulk operations
- Real-time updates with WebSockets

## License

MIT
