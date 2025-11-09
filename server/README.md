# HarmoniQ AI Backend Server

## Setup

1. Install Python dependencies:
```bash
cd server
pip install -r requirements.txt
```

2. Run the server:
```bash
python main.py
```

The server will start on `http://127.0.0.1:5001`

## API Endpoints

### 1. `/ai/chat` (POST)
Chat with Gemini AI assistant

**Request:**
```json
{
  "prompt": "How can I improve resource allocation?"
}
```

**Response:**
```json
{
  "reply": "AI response here..."
}
```

### 2. `/ai/suggestions` (POST)
Get AI-powered suggestions

**Request:**
```json
{
  "context": "User context or data"
}
```

**Response:**
```json
{
  "suggestions": ["suggestion1", "suggestion2", ...]
}
```

### 3. `/ai/analyze` (POST)
Analyze data with AI

**Request:**
```json
{
  "data": "Data to analyze",
  "type": "analysis type"
}
```

**Response:**
```json
{
  "analysis": "AI analysis here..."
}
```

### 4. `/health` (GET)
Health check endpoint

## Prompt Engineering

The AI is configured with a system context that makes it:
- Professional and project management focused
- Concise and actionable
- Data-driven
- Solution-oriented

You can modify the `SYSTEM_CONTEXT` variable in `main.py` to customize the AI's behavior.
