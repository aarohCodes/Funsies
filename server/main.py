from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, random
import google.generativeai as genai

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8000", "http://localhost:8000"],
    allow_methods=["*"], allow_headers=["*"]
)

# ---------- Models ----------
class ChatIn(BaseModel):
    prompt: str

class TriagerIn(BaseModel):
    chi: int
    chi_trend: list[int]
    outages: list[dict]
    sentiment: dict
    incidents: list | None = None
    backlog: list | None = None

class SentIn(BaseModel):
    comments: list[dict]

# ---------- Routes ----------
@app.post("/ai/chat")
def ai_chat(body: ChatIn):
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = (
            "You are HarmoniQ, a PM copilot. Be concise. "
            "Use the data the user mentions (CHI, outages, sentiment) to suggest actions.\n\n"
            f"User: {body.prompt}"
        )
        resp = model.generate_content(prompt)
        out = resp.text if hasattr(resp, "text") else "OK."
        return {"reply": out.strip()}
    except Exception as e:
        return {"reply": f"(AI error) {e}"}

@app.post("/ai/triage")
def ai_triage(data: TriagerIn):
    # Very lightweight demo; replace with a real LLM chain as needed
    tasks = []
    for o in data.outages:
        pr = o.get("probability", 0)
        if pr >= 0.6:
            tasks.append({
                "priority": "P0",
                "title": f"Mitigate outage risk in {o['region']}",
                "why": f"Predicted probability {int(pr*100)}% in next 24h",
                "impact": "High", "effort": "Medium"
            })
        elif pr >= 0.4:
            tasks.append({
                "priority": "P1",
                "title": f"Prepare comms for {o['region']}",
                "why": f"Moderate probability {int(pr*100)}%",
                "impact": "Medium", "effort": "Low"
            })
    if data.chi < 80:
        tasks.append({
            "priority": "P1",
            "title": "Boost CHI by addressing top pain point",
            "why": "CHI below 80 and trending flat",
            "impact": "High", "effort": "Medium"
        })
    if not tasks:
        tasks.append({"priority": "P2", "title": "All clear – monitor", "why": "No spikes detected", "impact":"Low","effort":"Low"})
    return {"prioritized_tasks": tasks}

@app.get("/predict/outage")
def predict_outage(region: str = Query(...)):
    # Fake model: return consistent-but-random-ish result
    rnd = (sum(map(ord, region)) % 100) / 100
    prob = int((0.25 + 0.6 * rnd) * 100)  # 25–85%
    label = "low" if prob < 40 else ("medium" if prob < 65 else "high")
    return {"region": region, "probability": prob, "label": label}

@app.get("/sentiment/mock")
def sentiment_mock():
    samples = [
        {"source":"reddit","text":"T-Mobile 5G is blazing fast in Austin today!"},
        {"source":"twitter","text":"Outages again in north Dallas… this is getting old."},
        {"source":"reddit","text":"Customer support was helpful but wait time was long."},
        {"source":"twitter","text":"Signal much better after tower maintenance."},
    ]
    return samples

@app.post("/ai/sentiment")
def ai_sentiment(data: SentIn):
    model = genai.GenerativeModel("gemini-1.5-flash")
    out_items = []
    pos = neg = neu = 0
    for c in data.comments:
        text = c.get("text","")
        # Small prompt per row for demo; batch if needed
        r = model.generate_content(
            f"Label this as positive, negative, or neutral. Keep just the label and a 0–1 confidence.\nText: {text}"
        )
        msg = r.text.lower()
        label = "neutral"; score = 0.5
        if "positive" in msg: label="positive"
        if "negative" in msg: label="negative"
        # crude score scrape
        for tok in msg.split():
            if tok.replace(".","",1).isdigit():
                try: score = float(tok); break
                except: pass
        out_items.append({"text": text, "label": label, "score": score})
        pos += label=="positive"; neg += label=="negative"; neu += label=="neutral"
    summary = f"Pos {pos}, Neg {neg}, Neu {neu}. Focus on the top 2 negative themes."
    return {"items": out_items, "summary": summary}
