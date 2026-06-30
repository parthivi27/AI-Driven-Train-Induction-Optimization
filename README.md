# Metro Command

A real-time metro rail operations dashboard with AI assistant.

## Quick Start

### Option 1: Use start.bat (Windows)
Double-click `start.bat` — it opens both terminals automatically.

### Option 2: Manual

**Terminal 1 — Backend (runs on port 5000)**
```
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux
pip install -r requirements.txt
python main.py
```

**Terminal 2 — Frontend (runs on port 3000)**
```
cd frontend
npm install
npm start
```

Open http://localhost:3000

## AI Assistant
Go to **Settings** and enter your OpenAI API key (sk-proj-...) to enable MetroAI.

## Ports
- Backend API: http://localhost:5000
- Frontend: http://localhost:3000




to run the backend

in one terminal
cd backend
venv\scripts\activate
python main.py

in second terminal
cd frontend
npm start