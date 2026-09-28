"""Tests for Routing Engine and Path Calculation."""


def test_walking_route_between_buildings(client):
    req_data = {
        "campus_id": "cu-gharaun",
        "origin": "main-gate",
        "destination": "block-a",
        "mode": "walk",
    }
    res = client.post("/api/route", json=req_data)
    assert res.status_code == 200
    data = res.json()
    assert data["found"] is True
    assert data["total_distance_meters"] > 0
    assert len(data["steps"]) > 0
    assert len(data["path_coordinates"]) > 0


def test_accessible_route_mode(client):
    req_data = {
        "campus_id": "cu-gharaun",
        "origin": "main-gate",
        "destination": "block-a1",
        "mode": "accessible",
    }
    res = client.post("/api/route", json=req_data)
    assert res.status_code == 200
    data = res.json()
    assert data["found"] is True
    assert data["is_accessible"] is True


def test_route_with_coordinates(client):
    req_data = {
        "campus_id": "cu-gharaun",
        "origin_coords": {"lat": 30.7710, "lng": 76.5735},
        "destination_coords": {"lat": 30.7695, "lng": 76.5725},
        "mode": "walk",
    }
    res = client.post("/api/route", json=req_data)
    assert res.status_code == 200
    data = res.json()
    assert data["found"] is True
