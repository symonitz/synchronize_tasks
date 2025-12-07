# Quick Start Guide

## 1. Backend Setup (5 minutes)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` with your credentials:
- Get GitHub token from: https://github.com/settings/tokens
- Get Notion token from: https://www.notion.so/my-integrations
- Get Notion database ID from your database URL

```bash
python main.py
```

Backend runs at http://localhost:8000

## 2. Frontend Setup (3 minutes)

```bash
cd frontend
npm install
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm run dev
```

Frontend runs at http://localhost:3000

## 3. Deploy to Production

### Backend to Railway:
1. Push to GitHub
2. Go to railway.app
3. "New Project" > "Deploy from GitHub repo"
4. Add environment variables from `.env`
5. Done! Copy the public URL

### Frontend to Vercel:
1. Go to vercel.com
2. "Import Project" > Select your repo
3. Add env var: `NEXT_PUBLIC_API_URL=<your-railway-url>`
4. Deploy!

Your dashboard is now live and will sync automatically when accessed.
