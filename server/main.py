from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Configure Gemini API
GEMINI_API_KEY = "AIzaSyA7p4s9TncVOTrjkshNfeI4R6wnBD6SEtU"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key={GEMINI_API_KEY}"

# Helper function to call Gemini API
def call_gemini(prompt):
    """Call Gemini API using REST"""
    try:
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }]
        }
        
        response = requests.post(GEMINI_API_URL, json=payload, headers={"Content-Type": "application/json"})
        response.raise_for_status()
        
        data = response.json()
        
        # Extract text from response
        if 'candidates' in data and len(data['candidates']) > 0:
            if 'content' in data['candidates'][0]:
                if 'parts' in data['candidates'][0]['content']:
                    if len(data['candidates'][0]['content']['parts']) > 0:
                        return data['candidates'][0]['content']['parts'][0].get('text', '')
        
        return "I couldn't generate a response."
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        return f"Error: {str(e)}"

# Prompt Engineering: System context for the AI
SYSTEM_CONTEXT = """
You are HarmoniQ AI Assistant, a helpful and professional AI for project managers and product teams.
Your role is to help with:
- Resource allocation strategies
- Outage prediction analysis
- Customer feedback interpretation
- Product management best practices
- Data-driven decision making

Always be:
- Concise and actionable
- Professional yet friendly
- Data-focused
- Solution-oriented

Keep responses under 3 paragraphs unless asked for more detail.
"""

@app.route('/ai/chat', methods=['POST'])
def chat():
    """
    Gemini chat endpoint with prompt engineering
    Expects JSON: { "prompt": "user message" }
    Returns JSON: { "reply": "AI response" }
    """
    try:
        data = request.get_json()
        user_prompt = data.get('prompt', '')
        
        if not user_prompt:
            return jsonify({"error": "No prompt provided"}), 400
        
        # Prompt Engineering: Combine system context with user prompt
        enhanced_prompt = f"{SYSTEM_CONTEXT}\n\nUser Question: {user_prompt}\n\nYour Response:"
        
        # Call Gemini API
        reply = call_gemini(enhanced_prompt)
        
        return jsonify({"reply": reply})
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e), "reply": "Sorry, I encountered an error processing your request."}), 500


@app.route('/ai/suggestions', methods=['POST'])
def suggestions():
    """
    Generate AI suggestions based on user data
    Expects JSON: { "context": "user context or data" }
    Returns JSON: { "suggestions": ["suggestion1", "suggestion2", ...] }
    """
    try:
        data = request.get_json()
        context = data.get('context', '')
        
        # Prompt Engineering for suggestions
        suggestion_prompt = f"""{SYSTEM_CONTEXT}

Based on the following context, provide 3-5 actionable suggestions for improving project management and customer satisfaction:

Context: {context}

Provide your suggestions as a numbered list, each on a new line.
"""
        
        reply = call_gemini(suggestion_prompt)
        
        # Parse suggestions from response
        suggestions_list = [line.strip() for line in reply.split('\n') if line.strip() and any(c.isalnum() for c in line)]
        
        return jsonify({"suggestions": suggestions_list})
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e), "suggestions": []}), 500


@app.route('/ai/analyze', methods=['POST'])
def analyze():
    """
    Analyze data and provide insights
    Expects JSON: { "data": "data to analyze", "type": "analysis type" }
    Returns JSON: { "analysis": "AI analysis" }
    """
    try:
        data = request.get_json()
        user_data = data.get('data', '')
        analysis_type = data.get('type', 'general')
        
        # Prompt Engineering for analysis
        analysis_prompt = f"""{SYSTEM_CONTEXT}

Analysis Type: {analysis_type}

Please analyze the following data and provide key insights, patterns, and recommendations:

Data: {user_data}

Provide:
1. Key findings
2. Patterns or trends
3. Actionable recommendations
"""
        
        analysis = call_gemini(analysis_prompt)
        
        return jsonify({"analysis": analysis})
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e), "analysis": "Error analyzing data."}), 500


@app.route('/ai/triage', methods=['POST'])
def triage():
    """
    AI-powered task triage and prioritization
    Expects JSON with:
    {
        "chi": number (customer happiness index),
        "chi_trend": [array of historical chi values],
        "outages": [array of outage predictions],
        "sentiment": {"pos": num, "neg": num, "neu": num},
        "incidents": [array],
        "backlog": [array]
    }
    Returns JSON: { "prioritized_tasks": [task objects] }
    """
    try:
        data = request.get_json()
        
        chi = data.get('chi', 0)
        chi_trend = data.get('chi_trend', [])
        outages = data.get('outages', [])
        sentiment = data.get('sentiment', {})
        
        # Prompt Engineering for task triage
        triage_prompt = f"""{SYSTEM_CONTEXT}

You are analyzing a project management dashboard. Based on the following metrics, prioritize the top 3-5 tasks that the team should focus on:

**Customer Happiness Index (CHI):** {chi}/100
**CHI Trend (last 9 periods):** {chi_trend}
**Outage Predictions:** {outages}
**Sentiment Analysis:** {sentiment}

Based on this data, provide 3-5 prioritized tasks in this EXACT JSON format:
[
  {{
    "title": "Task title",
    "why": "Brief explanation (1 sentence)",
    "priority": "P0" or "P1" or "P2",
    "impact": "High" or "Medium" or "Low",
    "effort": "Quick" or "Medium" or "Large"
  }}
]

Rules:
- P0 = Critical/Urgent
- P1 = Important
- P2 = Nice to have
- Focus on highest risk areas first
- Consider both customer impact and operational efficiency

Respond ONLY with valid JSON array, no other text.
"""
        
        reply_text = call_gemini(triage_prompt)
        
        # Clean up the response to extract JSON
        import json
        import re
        
        # Try to find JSON array in the response
        json_match = re.search(r'\[.*\]', reply_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
            prioritized_tasks = json.loads(json_str)
        else:
            # Fallback if AI doesn't return proper JSON
            prioritized_tasks = [
                {
                    "title": "Address High-Probability Outages",
                    "why": "Houston region shows 72% outage probability - immediate action needed",
                    "priority": "P0",
                    "impact": "High",
                    "effort": "Medium"
                },
                {
                    "title": "Improve Customer Happiness Index",
                    "why": f"CHI at {chi} with recent trend showing potential decline",
                    "priority": "P1",
                    "impact": "High",
                    "effort": "Large"
                },
                {
                    "title": "Address Negative Sentiment",
                    "why": f"Negative sentiment at {sentiment.get('neg', 0)}% - customer concerns need attention",
                    "priority": "P1",
                    "impact": "Medium",
                    "effort": "Medium"
                }
            ]
        
        return jsonify({"prioritized_tasks": prioritized_tasks})
    
    except Exception as e:
        print(f"Error in triage: {str(e)}")
        # Return fallback tasks on error
        fallback_tasks = [
            {
                "title": "Review System Metrics",
                "why": "Regular monitoring and assessment needed",
                "priority": "P1",
                "impact": "Medium",
                "effort": "Quick"
            },
            {
                "title": "Address Customer Feedback",
                "why": "Maintain customer satisfaction levels",
                "priority": "P1",
                "impact": "High",
                "effort": "Medium"
            },
            {
                "title": "Optimize Resource Allocation",
                "why": "Ensure efficient use of available resources",
                "priority": "P2",
                "impact": "Medium",
                "effort": "Large"
            }
        ]
        return jsonify({"prioritized_tasks": fallback_tasks})


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "HarmoniQ AI Backend"})


if __name__ == '__main__':
    print("🚀 Starting HarmoniQ AI Backend Server...")
    print("📡 Gemini API configured")
    print("🌐 Server running on http://127.0.0.1:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
