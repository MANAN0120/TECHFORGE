"""Pydantic schemas for AI Campus Assistant."""

from typing import Any
from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str


class ChatRequest(BaseModel):
    campus_id: str = "cu-gharaun"
    message: str
    history: list[ChatMessage] = []
    user_location: dict[str, float] | None = None  # {"lat": ..., "lng": ...}


class ToolCallRecord(BaseModel):
    tool_name: str
    args: dict[str, Any]
    result: Any


class ChatResponse(BaseModel):
    campus_id: str
    reply: str
    tool_calls: list[ToolCallRecord] = []
    suggested_actions: list[str] = []
    related_entities: list[dict[str, Any]] = []
