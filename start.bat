@echo off
echo Starting Metro Command...

:: Terminal 1 - Backend (Port 5000)
start "Metro Backend" cmd /k "cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python main.py"

:: Wait 3 seconds for backend to start
timeout /t 3 /nobreak

:: Terminal 2 - Frontend (Port 3000)
start "Metro Frontend" cmd /k "cd frontend && npm install && npm start"

echo Metro Command is starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
