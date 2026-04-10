Mental Health Digital Twin Mini App
1. Project Overview
The Mental Health Digital Twin mini app is a full-stack web application that allows users to log their daily mood, stress levels, and sleep hours, then receive AI-generated personalised insights powered by a locally-running Ollama language model.

Key capabilities:
Log mood entries with stress level, sleep hours, and free-text notes
View full mood history with colour-coded emotional indicators
Receive AI-generated emotional insights and recommendations via llama3.2
Automatic pattern detection with real-time warnings (high stress, low sleep, mood drops)
Fully explainable AI — every insight shows which data drove it
100% local and private — no data leaves your machine

2. Architecture
The application follows a classic three-tier architecture:

Layer            Technology      Responsibility

Frontend         React + Vite    User interface — mood form, history list, AI insight panel 

Backend        Node.js + Express  REST API, business logic, pattern detection, Ollama bridge

AI Engine      Ollama + llama3.2   Local LLM — generates empathetic insights from mood data

Storage       In-memory(JS object)  Mood entries stored per user_id — replaceable with a DB

Data Flow
The complete request lifecycle from user action to AI response:

User fills the mood form and clicks Log Mood Entry
React calls POST /mental/add-mood on the Express backend
Backend validates, timestamps, and stores the entry in moodStore
React refreshes history via GET /mental/history — warnings are recalculated
User clicks Generate AI Insight
React calls POST /mental/analyze
Backend computes averages, runs detectWarnings(), builds a structured prompt
ollamaService.js sends the prompt to Ollama at http://localhost:11434
llama3.2 generates a JSON response with insight, recommendation, and note
Backend parses and enriches the response with data_used metadata
React displays the full analysis with the explainability panel

3. API Design
Base URL: http://localhost:5000/mental

 POST /mental/add-mood
Saves a new mood entry for a user.
Field        Type    Description

user_id      string   Required. Unique identifier for the user

mood         string   Required. One of: happy, calm, neutral, anxious, sad, overwhelmed

stress_level number  1–10 scale. Defaults to 5 if omitted

sleep_hours  number   Hours of sleep. Defaults to 7 if omitted

note         string   ptional free-text note

Example Request
POST /mental/add-mood
{
  "user_id": "user_01",
  "mood": "sad",
  "stress_level": 8,
  "sleep_hours": 4,
  "note": "Feeling overwhelmed with work"
}

Example Response  —  201 Created
{
  "success": true,
  "entry": {
    "id": "1775774727579",
    "user_id": "user_01",
    "mood": "sad",
    "stress_level": 8,
    "sleep_hours": 4,
    "note": "Feeling overwhelmed with work",
    "timestamp": "2026-04-09T22:45:27.579Z"
  }
}
 
GET /mental/history
Returns paginated mood history for a user, plus any detected pattern warnings.
Example Request
GET /mental/history?user_id=user_01&limit=5
Example Response  —  200 OK
{
  "user_id": "user_01",
  "entries": [ ... ],
  "warnings": [
    "Your stress levels have been consistently high for the past 3 entries."
  ],
  "total": 5
}
POST /mental/analyze
Triggers Ollama AI analysis on the user's recent mood entries and returns personalised insights with full explainability data.

Request Body
Field
Type
Description
user_id
string
Required. The user to analyse
limit
number
Optional. How many recent entries to analyse. Defaults to 5


Example Response  —  200 OK
{
  "success": true,
  "user_id": "user_01",
  "source": "ollama",
  "analysis": {
    "emotional_insight": "It sounds like you're feeling overwhelmed...",
    "recommendation": "Try breaking tasks into smaller chunks...",
    "data_explanation": "Your avg stress of 8.0/10 and 4h sleep suggests...",
    "supportive_note": "You are not alone in this. Take care of yourself.",
    "data_used": {
      "entries_analysed": 3,
      "avg_stress": "7.3",
      "avg_sleep": "4.5",
      "moods_logged": "sad, anxious, overwhelmed",
      "warnings": ["Stress consistently high for 3 entries"]
    }
  }
}

4. AI Approach
* Why Ollama + llama3.2

Reason       Detail

100% Free    No API key, no usage costs, runs indefinitely on local hardware

Full Privacy  Mood data is sensitive — nothing leaves the user's machine

No Internet   Works completely offline — ideal for mental health data

Quality       llama3.2 produces empathetic, coherent insights for this use case

Lightweight   2.0 GB model — runs comfortably on most modern laptops


*How the AI Integration Works
The AI pipeline in ollamaService.js follows these steps:

Build a structured data summary from the user's recent entries (mood, stress, sleep, notes, timestamps)
Compute averages for stress and sleep across the entries
Append any detected pattern warnings to the context
Send a carefully engineered prompt to Ollama's local API at http://localhost:11434/api/generate
Parse the JSON response, repairing missing closing braces if the model truncates output
Return the structured insight with data_used metadata attached for explainability

*Robustness — JSON Repair
Local models occasionally truncate output and forget to close the JSON object. The service handles this automatically by counting opening and closing braces and appending any missing ones before parsing:

const openBraces  = (cleaned.match(/{/g) || []).length;
const closeBraces = (cleaned.match(/}/g) || []).length;
const missing     = openBraces - closeBraces;
for (let i = 0; i < missing; i++) cleaned += "\n}


* Explainability
Every AI insight includes a data_used object that tells the user exactly what drove the analysis — number of entries, average stress, average sleep, moods logged, and any detected warnings. This is displayed directly in the UI as tagged chips so users always understand why they received a particular insight.

5. Setup & Running Locally

Prerequisites
Node.js v18 or higher
Ollama installed from ollama.com
llama3.2 model pulled: ollama pull llama3.2

Backend
cd backend
npm install
node index.js
# Server runs on http://localhost:5000

Frontend
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173

Ollama
# Ollama starts automatically — verify with:
curl http://localhost:11434
# Should return: Ollama is running
Mental Health Digital Twin Mini App
1. Project Overview
The Mental Health Digital Twin mini app is a full-stack web application that allows users to log their daily mood, stress levels, and sleep hours, then receive AI-generated personalised insights powered by a locally-running Ollama language model.

Key capabilities:
Log mood entries with stress level, sleep hours, and free-text notes
View full mood history with colour-coded emotional indicators
Receive AI-generated emotional insights and recommendations via llama3.2
Automatic pattern detection with real-time warnings (high stress, low sleep, mood drops)
Fully explainable AI — every insight shows which data drove it
100% local and private — no data leaves your machine

2. Architecture
The application follows a classic three-tier architecture:

Layer            Technology      Responsibility

Frontend         React + Vite    User interface — mood form, history list, AI insight panel 

Backend        Node.js + Express  REST API, business logic, pattern detection, Ollama bridge

AI Engine      Ollama + llama3.2   Local LLM — generates empathetic insights from mood data

Storage       In-memory(JS object)  Mood entries stored per user_id — replaceable with a DB

Data Flow
The complete request lifecycle from user action to AI response:

User fills the mood form and clicks Log Mood Entry
React calls POST /mental/add-mood on the Express backend
Backend validates, timestamps, and stores the entry in moodStore
React refreshes history via GET /mental/history — warnings are recalculated
User clicks Generate AI Insight
React calls POST /mental/analyze
Backend computes averages, runs detectWarnings(), builds a structured prompt
ollamaService.js sends the prompt to Ollama at http://localhost:11434
llama3.2 generates a JSON response with insight, recommendation, and note
Backend parses and enriches the response with data_used metadata
React displays the full analysis with the explainability panel

3. API Design
Base URL: http://localhost:5000/mental

 POST /mental/add-mood
Saves a new mood entry for a user.
Field        Type    Description

user_id      string   Required. Unique identifier for the user

mood         string   Required. One of: happy, calm, neutral, anxious, sad, overwhelmed

stress_level number  1–10 scale. Defaults to 5 if omitted

sleep_hours  number   Hours of sleep. Defaults to 7 if omitted

note         string   ptional free-text note

Example Request
POST /mental/add-mood
{
  "user_id": "user_01",
  "mood": "sad",
  "stress_level": 8,
  "sleep_hours": 4,
  "note": "Feeling overwhelmed with work"
}

Example Response  —  201 Created
{
  "success": true,
  "entry": {
    "id": "1775774727579",
    "user_id": "user_01",
    "mood": "sad",
    "stress_level": 8,
    "sleep_hours": 4,
    "note": "Feeling overwhelmed with work",
    "timestamp": "2026-04-09T22:45:27.579Z"
  }
}
 
GET /mental/history
Returns paginated mood history for a user, plus any detected pattern warnings.
Example Request
GET /mental/history?user_id=user_01&limit=5
Example Response  —  200 OK
{
  "user_id": "user_01",
  "entries": [ ... ],
  "warnings": [
    "Your stress levels have been consistently high for the past 3 entries."
  ],
  "total": 5
}
POST /mental/analyze
Triggers Ollama AI analysis on the user's recent mood entries and returns personalised insights with full explainability data.

Request Body
Field
Type
Description
user_id
string
Required. The user to analyse
limit
number
Optional. How many recent entries to analyse. Defaults to 5


Example Response  —  200 OK
{
  "success": true,
  "user_id": "user_01",
  "source": "ollama",
  "analysis": {
    "emotional_insight": "It sounds like you're feeling overwhelmed...",
    "recommendation": "Try breaking tasks into smaller chunks...",
    "data_explanation": "Your avg stress of 8.0/10 and 4h sleep suggests...",
    "supportive_note": "You are not alone in this. Take care of yourself.",
    "data_used": {
      "entries_analysed": 3,
      "avg_stress": "7.3",
      "avg_sleep": "4.5",
      "moods_logged": "sad, anxious, overwhelmed",
      "warnings": ["Stress consistently high for 3 entries"]
    }
  }
}

4. AI Approach
* Why Ollama + llama3.2

Reason       Detail

100% Free    No API key, no usage costs, runs indefinitely on local hardware

Full Privacy  Mood data is sensitive — nothing leaves the user's machine

No Internet   Works completely offline — ideal for mental health data

Quality       llama3.2 produces empathetic, coherent insights for this use case

Lightweight   2.0 GB model — runs comfortably on most modern laptops


*How the AI Integration Works
The AI pipeline in ollamaService.js follows these steps:

Build a structured data summary from the user's recent entries (mood, stress, sleep, notes, timestamps)
Compute averages for stress and sleep across the entries
Append any detected pattern warnings to the context
Send a carefully engineered prompt to Ollama's local API at http://localhost:11434/api/generate
Parse the JSON response, repairing missing closing braces if the model truncates output
Return the structured insight with data_used metadata attached for explainability

*Robustness — JSON Repair
Local models occasionally truncate output and forget to close the JSON object. The service handles this automatically by counting opening and closing braces and appending any missing ones before parsing:

const openBraces  = (cleaned.match(/{/g) || []).length;
const closeBraces = (cleaned.match(/}/g) || []).length;
const missing     = openBraces - closeBraces;
for (let i = 0; i < missing; i++) cleaned += "\n}


* Explainability
Every AI insight includes a data_used object that tells the user exactly what drove the analysis — number of entries, average stress, average sleep, moods logged, and any detected warnings. This is displayed directly in the UI as tagged chips so users always understand why they received a particular insight.

5. Setup & Running Locally

Prerequisites
Node.js v18 or higher
Ollama installed from ollama.com
llama3.2 model pulled: ollama pull llama3.2

Backend
cd backend
npm install
node index.js
# Server runs on http://localhost:5000

Frontend
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173

Ollama
# Ollama starts automatically — verify with:
curl http://localhost:11434
# Should return: Ollama is running
