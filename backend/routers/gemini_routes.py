from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.gemini_service import get_gemini_service, PromptType

router = APIRouter()

class EmpatheticReplyRequest(BaseModel):
    user_message: str
    conversation_history: list = []
    user_context: dict = {}

class JournalSummaryRequest(BaseModel):
    entries: list

class SuggestActionRequest(BaseModel):
    state: dict

class ClassifyEmotionRequest(BaseModel):
    text: str

class DetectCrisisRequest(BaseModel):
    text: str

@router.post("/empathetic-reply")
async def empathetic_reply(data: EmpatheticReplyRequest):
    """Get empathetic response from Gemini"""
    try:
        gemini_service = get_gemini_service()
        context = {
            'message': data.user_message,
            'context': str(data.conversation_history[-3:] if data.conversation_history else 'First message')
        }
        response = await gemini_service.generate_response(
            prompt_type=PromptType.THERAPY_RESPONSE,
            context=context
        )
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize-journal")
async def summarize_journal(data: JournalSummaryRequest):
    """Summarize journal entries"""
    try:
        gemini_service = get_gemini_service()
        context = {
            'mood_data': str(data.entries),
            'days': len(data.entries)
        }
        summary = await gemini_service.generate_response(
            prompt_type=PromptType.MOOD_SUMMARY,
            context=context
        )
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suggest-action")
async def suggest_action(data: SuggestActionRequest):
    """Suggest next wellness action"""
    try:
        gemini_service = get_gemini_service()
        context = {
            'message': f"User state: {data.state}",
            'context': 'Suggest a wellness action'
        }
        suggestion = await gemini_service.generate_response(
            prompt_type=PromptType.THERAPY_RESPONSE,
            context=context
        )
        return {"suggestion": suggestion}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/classify-emotion")
async def classify_emotion(data: ClassifyEmotionRequest):
    """Classify emotion from text"""
    try:
        gemini_service = get_gemini_service()
        context = {
            'content': data.text
        }
        result = await gemini_service.generate_response(
            prompt_type=PromptType.EMOTION_ANALYSIS,
            context=context
        )
        return {"emotion": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect-crisis")
async def detect_crisis(data: DetectCrisisRequest):
    """Detect crisis indicators"""
    try:
        # Simple keyword-based crisis detection
        crisis_keywords = ['suicide', 'kill myself', 'end my life', 'want to die', 'hurt myself', 'self-harm']
        text_lower = data.text.lower()
        
        crisis_detected = any(keyword in text_lower for keyword in crisis_keywords)
        
        return {
            "crisis_detected": crisis_detected,
            "message": "Please reach out to a crisis helpline immediately. National Suicide Prevention Lifeline: 988 (US)" if crisis_detected else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
