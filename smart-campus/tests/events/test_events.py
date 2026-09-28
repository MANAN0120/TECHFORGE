"""Tests for Events API."""


def test_create_and_get_events(client):
    event_payload = {
        "campus_id": "cu-gharaun",
        "title": "AI Innovation Summit",
        "description": "Annual hackathon and keynote sessions.",
        "category": "hackathon",
        "venue_name": "Main Auditorium",
        "venue_lat": 30.7688,
        "venue_lng": 76.5754,
        "building_id": "b1",
        "starts_at": "2026-10-15T10:00:00Z",
        "ends_at": "2026-10-16T18:00:00Z",
        "organizer": "Tech Club",
        "status": "upcoming",
    }
    create_res = client.post("/api/events", json=event_payload)
    assert create_res.status_code == 201
    created_event = create_res.json()
    assert created_event["title"] == "AI Innovation Summit"

    list_res = client.get("/api/events?campus_id=cu-gharaun")
    assert list_res.status_code == 200
    events_data = list_res.json()
    assert events_data["count"] >= 1
