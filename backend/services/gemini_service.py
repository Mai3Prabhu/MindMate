import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY must be set in environment variables")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('models/gemini-flash-latest') # this is free and good to use

async def get_empathetic_reply(user_message: str, conversation_history: list, user_context: dict) -> str:
    """
    Generate empathetic therapy response using Gemini
    """
    system_prompt = """You are a warm, empathetic mental wellness companion.
Your role is to:
1. Validate the person's feelings without judgment
2. Reflect what you heard with compassion
3. Ask ONE gentle, open-ended question
4. Optionally suggest ONE small, accessible practice

Never diagnose, give medical advice, or be overly prescriptive.
Respond in 2-4 sentences maximum."""

    # Build conversation context
    context_str = ""
    if conversation_history:
        context_str = "\n\nRecent conversation:\n"
        for msg in conversation_history[-5:]:  # Last 5 messages
            role = msg.get("role", "user")
            content = msg.get("content", "")
            context_str += f"{role}: {content}\n"
    
    prompt = f"""{system_prompt}

{context_str}

User: {user_message}

Therapist:"""

    response = model.generate_content(prompt)
    return response.text

async def summarize_journal_entries(entries: list) -> str:
    """
    Summarize journal entries with key themes
    """
    prompt = f"""Summarize these journal entries with:
1. Key emotional themes (2-3)
2. Notable patterns or shifts
3. One gentle insight or affirmation

Keep it warm, non-judgmental, and under 4 sentences.

Entries:
{json.dumps(entries, indent=2)}

Summary:"""

    response = model.generate_content(prompt)
    return response.text

async def suggest_next_action(state: dict) -> dict:
    """
    Suggest personalized next action based on emotional state
    """
    prompt = f"""Based on the user's current state, suggest:
1. A specific, actionable next step (meditation, journaling, movement, etc.)
2. Brief reasoning (1 sentence)
3. Estimated duration in minutes

User state:
{json.dumps(state, indent=2)}

Return ONLY valid JSON in this format:
{{
    "action": "specific action",
    "reasoning": "brief reasoning",
    "duration": 10
}}"""

    response = model.generate_content(prompt)
    text = response.text.strip()
    
    # Extract JSON from response
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()
    
    try:
        return json.loads(text)
    except:
        return {
            "action": "Take a few deep breaths",
            "reasoning": "Centering yourself can help restore balance",
            "duration": 5
        }

async def classify_emotion_from_text(text: str) -> dict:
    """
    Classify emotion from text
    """
    prompt = f"""Analyze the text and return:
1. Primary emotion (happy/sad/anxious/calm/energetic/stressed/neutral)
2. Intensity (0-100)
3. Up to 2 secondary emotions if present

Return ONLY valid JSON:
{{
    "label": "primary emotion",
    "intensity": 50,
    "secondary": ["emotion1", "emotion2"]
}}

Text: {text}

JSON:"""

    response = model.generate_content(prompt)
    text = response.text.strip()
    
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()
    
    try:
        return json.loads(text)
    except:
        return {
            "label": "neutral",
            "intensity": 50,
            "secondary": []
        }

async def detect_crisis_indicators(text: str) -> dict:
    """
    Detect crisis indicators in text
    """
    keywords = ["suicide", "kill myself", "end it", "self-harm", "hurt myself", "no point living"]
    
    has_keywords = any(keyword in text.lower() for keyword in keywords)
    
    if has_keywords:
        return {
            "detected": True,
            "severity": "high",
            "message": "Crisis indicators detected. Please reach out to a professional immediately."
        }
    
    # Use Gemini for nuanced detection
    prompt = f"""Analyze this text for mental health crisis indicators (suicidal ideation, self-harm intent, severe distress).

Text: {text}

Return ONLY valid JSON:
{{
    "detected": true/false,
    "severity": "low/medium/high",
    "message": "brief message"
}}

JSON:"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        
        return json.loads(text)
    except:
        return {"detected": False}

async def generate_content_summary(content: dict) -> str:
    """
    Generate one-line summary for content library items
    """
    prompt = f"""Create a single engaging sentence summary for this content:

Title: {content.get('title', '')}
Description: {content.get('description', '')}

Summary:"""

    response = model.generate_content(prompt)
    return response.text.strip()
