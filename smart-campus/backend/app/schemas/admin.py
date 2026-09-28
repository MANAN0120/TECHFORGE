"""Pydantic schemas for Admin operations, Conditions, and Notifications."""

from pydantic import BaseModel


class ConditionCreate(BaseModel):
    campus_id: str = "cu-gharaun"
    path_id: str
    reason: str | None = "Maintenance or event blockage"
    severity: str = "blocked"  # blocked, cautionary
    expires_at: str | None = None


class ConditionResponse(BaseModel):
    id: str
    campus_id: str
    path_id: str
    reason: str | None
    severity: str
    created_at: str
    expires_at: str | None
    active: int


class NotificationCreate(BaseModel):
    campus_id: str = "cu-gharaun"
    title: str
    body: str | None = None
    category: str = "general"
    target: str = "all"


class NotificationResponse(BaseModel):
    id: str
    campus_id: str
    title: str
    body: str | None
    category: str
    target: str
    read: int
    created_at: str
