"""Tests for Campus Search API."""


def test_search_building(client):
    res = client.get("/api/search?q=Academic&campus_id=cu-gharaun")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    assert any("academic" in r["title"].lower() or "block" in r["title"].lower() for r in data["results"])


def test_search_poi(client):
    res = client.get("/api/search?q=ATM&campus_id=cu-gharaun")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    assert any(r["type"] == "poi" for r in data["results"])


def test_search_with_category_filter(client):
    res = client.get("/api/search?q=food&campus_id=cu-gharaun&category=food")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data["results"], list)
