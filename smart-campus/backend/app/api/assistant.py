"""AI Assistant API router."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.assistant import ChatRequest, ChatResponse
from app.ai import assistant_service

router = APIRouter(prefix="/api/assistant", tags=["assistant"])


@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    request: ChatRequest,
    db: Session = Depends(get_db),
):
    """Chat with the AI Campus Assistant powered by Google Gemini and real-time campus tools."""
    return await assistant_service.generate_chat_response(request, db=db)
