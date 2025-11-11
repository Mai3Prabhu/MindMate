from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timedelta
import logging
import json

from services.supabase_client import get_supabase
from services.gemini_service import get_gemini_service, PromptType
from middleware import get_current_user, limiter, get_rate_limit
from supabase import Client

router = APIRouter()
logger = logging.getLogger(__name__)


# Pydantic Models
class ScoreSubmitRequest(BaseModel):
    game_type: str = Field(..., pattern="^(memory_match|recall|pattern|reaction)$")
    score: int = Field(..., ge=0)


class GameScore(BaseModel):
    id: str
    game_type: str
    score: int
    timestamp: datetime


class GameTrends(BaseModel):
    game_type: str
    scores: List[dict]
    average_score: float
    best_score: int
    total_plays: int
    ai_insight: str


# Helper Functions
async def generate_cognitive_insight(game_type: str, scores: List[dict], user_id: str) -> str:
    """
    Generate AI insight about cognitive performance using centralized Gemini service.
    Always uses positive framing - never mentions decline.
    
    Args:
        game_type: Type of game
        scores: List of score entries
        user_id: User ID for logging
        
    Returns:
        One-line encouraging insight
    """
    if not scores or len(scores) < 2:
        return "Great start! Keep playing to track your cognitive progress."
    
    # Calculate statistics
    recent_scores = [s['score'] for s in scores[:5]]
    older_scores = [s['score'] for s in scores[5:10]] if len(scores) > 5 else recent_scores
    
    recent_avg = sum(recent_scores) / len(recent_scores)
    older_avg = sum(older_scores) / len(older_scores)
    best_score = max(s['score'] for s in scores)
    total_plays = len(scores)
    
    # Use centralized Gemini service
    gemini = get_gemini_service()
    
    insight = await gemini.generate_response(
        prompt_type=PromptType.COGNITIVE_INSIGHT,
        context={
            'game_type': game_type.replace('_', ' ').title(),
            'total_plays': total_plays,
            'best_score': best_score,
            'recent_avg': f"{recent_avg:.1f}",
            'older_avg': f"{older_avg:.1f}"
        },
        user_id=user_id,
        use_cache=True
    )
    
    return insight


# Endpoints
@router.get("/games")
async def get_available_games():
    """
    Get list of available Brain Gym games.
    """
    return {
        "games": [
            {
                "id": "memory_match",
                "name": "Memory Match",
                "description": "Match pairs of cards by remembering their positions",
                "icon": "🎴"
            },
            {
                "id": "recall",
                "name": "Recall Game",
                "description": "Remember and retype sequences of numbers or letters",
                "icon": "🔢"
            },
            {
                "id": "pattern",
                "name": "Pattern Game",
                "description": "Repeat color and button sequences",
                "icon": "🎨"
            },
            {
                "id": "reaction",
                "name": "Reaction Tap",
                "description": "Tap when the color changes",
                "icon": "⚡"
            }
        ]
    }


@router.post("/score", response_model=GameScore)
@limiter.limit(get_rate_limit("braingym_score"))
async def submit_score(
    request: Request,
    score_request: ScoreSubmitRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Submit a game score.
    """
    try:
        user_id = current_user['id']
        
        # Store score
        score_data = {
            'user_id': user_id,
            'game_type': score_request.game_type,
            'score': score_request.score
        }
        
        result = supabase.table('braingym_scores').insert(score_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to save score")
        
        entry = result.data[0]
        
        logger.info(f"Brain Gym score saved: {score_request.game_type} - {score_request.score}")
        
        return GameScore(
            id=entry['id'],
            game_type=entry['game_type'],
            score=entry['score'],
            timestamp=entry['timestamp']
        )
        
    except Exception as e:
        logger.error(f"Error submitting score: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit score")


@router.get("/scores", response_model=List[GameScore])
async def get_scores(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    game_type: Optional[str] = None,
    limit: int = 50
):
    """
    Get game scores with optional game type filtering.
    """
    try:
        user_id = current_user['id']
        
        query = supabase.table('braingym_scores').select('*').eq('user_id', user_id)
        
        if game_type:
            query = query.eq('game_type', game_type)
        
        result = query.order('timestamp', desc=True).limit(limit).execute()
        
        if not result.data:
            return []
        
        return [
            GameScore(
                id=entry['id'],
                game_type=entry['game_type'],
                score=entry['score'],
                timestamp=entry['timestamp']
            )
            for entry in result.data
        ]
        
    except Exception as e:
        logger.error(f"Error retrieving scores: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve scores")


@router.get("/trends/{game_type}", response_model=GameTrends)
async def get_game_trends(
    game_type: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    days: int = 30
):
    """
    Get trends and AI insights for a specific game.
    """
    try:
        user_id = current_user['id']
        
        # Validate game type
        valid_games = ['memory_match', 'recall', 'pattern', 'reaction']
        if game_type not in valid_games:
            raise HTTPException(status_code=400, detail="Invalid game type")
        
        # Get scores
        cutoff_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
        
        result = supabase.table('braingym_scores') \
            .select('*') \
            .eq('user_id', user_id) \
            .eq('game_type', game_type) \
            .gte('timestamp', cutoff_date) \
            .order('timestamp', desc=False) \
            .execute()
        
        scores = result.data if result.data else []
        
        if not scores:
            return GameTrends(
                game_type=game_type,
                scores=[],
                average_score=0,
                best_score=0,
                total_plays=0,
                ai_insight="Start playing to track your cognitive progress!"
            )
        
        # Calculate statistics
        score_values = [s['score'] for s in scores]
        average_score = sum(score_values) / len(score_values)
        best_score = max(score_values)
        total_plays = len(scores)
        
        # Format scores for response
        formatted_scores = [
            {
                'score': s['score'],
                'timestamp': s['timestamp']
            }
            for s in scores
        ]
        
        # Generate AI insight
        ai_insight = await generate_cognitive_insight(game_type, scores, user_id)
        
        logger.info(f"Generated trends for {game_type}: {total_plays} plays")
        
        return GameTrends(
            game_type=game_type,
            scores=formatted_scores,
            average_score=round(average_score, 1),
            best_score=best_score,
            total_plays=total_plays,
            ai_insight=ai_insight
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting game trends: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get game trends")


@router.delete("/{score_id}")
async def delete_score(
    score_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Delete a game score.
    """
    try:
        user_id = current_user['id']
        
        result = supabase.table('braingym_scores') \
            .delete() \
            .eq('id', score_id) \
            .eq('user_id', user_id) \
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Score not found")
        
        logger.info(f"Brain Gym score deleted: {score_id}")
        
        return {"message": "Score deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting score: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete score")
