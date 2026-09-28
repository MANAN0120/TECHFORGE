"""Tests for Campus metadata and data endpoints."""


def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"


def test_get_campus_metadata(client):
    res = client.get("/api/campus/cu-gharaun")
    assert res.status_code == 200
    data = res.json()
    assert data["campus_id"] == "cu-gharaun"
    assert "name" in data
    assert "center" in data


def test_get_campus_buildings(client):
    res = client.get("/api/campus/cu-gharaun/buildings")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] > 0
    assert len(data["buildings"]) > 0


def test_get_campus_geojson(client):
    res = client.get("/api/campus/cu-gharaun/geojson")
    assert res.status_code == 200
    data = res.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) > 0


def test_get_campus_pois(client):
    res = client.get("/api/campus/cu-gharaun/pois")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] > 0
