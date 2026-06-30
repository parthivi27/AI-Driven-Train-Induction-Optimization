from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import openai
import json
import asyncio
from datetime import datetime, timedelta
import random

app = FastAPI(title="Metro AI Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",  # ✅ Added for browser compatibility
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ──────────────────────────────────────────────────────────────────
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    api_key: str
    model: Optional[str] = "gpt-4o"

class TrainStatus(BaseModel):
    id: str
    line: str
    status: str
    delay: int
    location: str
    passengers: int
    next_station: str

# ── Mock Metro Data ──────────────────────────────────────────────────────────
LINES = ["Blue Line", "Red Line", "Green Line", "Yellow Line", "Purple Line"]
STATIONS = {
    "Blue Line": ["Central Hub", "Airport", "University", "Tech Park", "Old Town"],
    "Red Line": ["North Gate", "Mall Complex", "Business District", "Harbor", "South End"],
    "Green Line": ["East Station", "Park & Ride", "Stadium", "Hospital", "West Terminal"],
    "Yellow Line": ["City Square", "Market", "Museum", "Library", "Sports Complex"],
    "Purple Line": ["Junction", "Riverside", "Convention Center", "Hotel Row", "Grand Central"],
}

def generate_train_data():
    trains = []
    for i, line in enumerate(LINES):
        for j in range(3):
            stations = STATIONS[line]
            current_idx = random.randint(0, len(stations) - 2)
            delay = random.choices([0, 0, 0, 2, 5, 8, 12], weights=[40, 20, 15, 10, 7, 5, 3])[0]
            status = "On Time" if delay == 0 else f"{delay} min delay"
            trains.append({
                "id": f"T{i+1}{j+1:02d}",
                "line": line,
                "status": status,
                "delay": delay,
                "location": stations[current_idx],
                "passengers": random.randint(80, 450),
                "next_station": stations[current_idx + 1],
                "capacity": 500,
            })
    return trains

def generate_stats():
    now = datetime.now()
    hourly = []
    for i in range(24):
        hour = (now - timedelta(hours=23 - i)).strftime("%H:00")
        is_peak = i in range(7, 10) or i in range(17, 20)
        base = 4500 if is_peak else 1800
        hourly.append({"hour": hour, "passengers": base + random.randint(-300, 300)})

    return {
        "total_passengers_today": random.randint(142000, 158000),
        "trains_running": 15,
        "trains_delayed": random.randint(1, 4),
        "avg_delay": round(random.uniform(0.8, 3.2), 1),
        "on_time_pct": round(random.uniform(87, 96), 1),
        "revenue_today": round(random.uniform(420000, 480000), 2),
        "active_stations": 47,
        "incidents_today": random.randint(0, 3),
        "hourly_passengers": hourly,
        "line_performance": [
            {"line": line, "on_time": round(random.uniform(85, 98), 1),
             "passengers": random.randint(25000, 45000)}
            for line in LINES
        ],
    }

# ── Routes ───────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "Metro AI Backend Running", "time": datetime.now().isoformat()}

@app.get("/api/trains")
def get_trains():
    return generate_train_data()

@app.get("/api/stats")
def get_stats():
    return generate_stats()

@app.get("/api/alerts")
def get_alerts():
    alerts = [
        {"id": 1, "type": "warning", "line": "Red Line", "message": "Signal maintenance at Harbor station. Expected delay: 8 min.", "time": "14:32"},
        {"id": 2, "type": "info", "line": "Blue Line", "message": "Extra service added for evening rush hour.", "time": "14:15"},
        {"id": 3, "type": "critical", "line": "Green Line", "message": "Track inspection required at East Station. Service suspended.", "time": "13:50"},
        {"id": 4, "type": "info", "line": "All Lines", "message": "System operating at 94.2% efficiency today.", "time": "13:00"},
    ]
    return alerts

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Streaming chat endpoint using OpenAI."""
    try:
        client = openai.AsyncOpenAI(api_key=request.api_key)

        system_prompt = """You are MetroAI, an intelligent assistant for a metro rail transit management system. 
You have deep expertise in:
- Metro operations, scheduling, and real-time train management
- Passenger flow optimization and capacity planning
- Incident management and emergency protocols
- Revenue analytics and performance metrics
- Infrastructure maintenance scheduling
- Route optimization and timetabling

You have access to the metro system's live data including train positions, delays, passenger counts, and performance metrics.
Be concise, professional, and actionable. Use data when relevant. Format responses clearly with bullet points or structured info when helpful.
Always refer to yourself as MetroAI."""

        messages = [{"role": "system", "content": system_prompt}]
        messages += [{"role": m.role, "content": m.content} for m in request.messages]

        async def stream_response():
            try:
                stream = await client.chat.completions.create(
                    model=request.model,
                    messages=messages,
                    max_tokens=1024,
                    stream=True,
                )
                async for chunk in stream:
                    delta = chunk.choices[0].delta.content if chunk.choices[0].delta.content else ""
                    if delta:
                        yield f"data: {json.dumps({'delta': delta})}\n\n"
                yield "data: [DONE]\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return StreamingResponse(stream_response(), media_type="text/event-stream")

    except openai.AuthenticationError:
        raise HTTPException(status_code=401, detail="Invalid OpenAI API key.")
    except openai.RateLimitError:
        raise HTTPException(status_code=429, detail="OpenAI rate limit exceeded.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=5000, reload=True)  # ✅ Changed from 0.0.0.0 to 127.0.0.1