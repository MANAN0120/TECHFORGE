"""Tests for AI Assistant API."""


def test_assistant_chat_query(client):
    payload = {
        "campus_id": "cu-gharaun",
        "message": "Where is the library?",
        "history": [],
    }
    res = client.post("/api/assistant/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "reply" in data
    assert len(data["reply"]) > 0
    assert len(data["tool_calls"]) > 0
