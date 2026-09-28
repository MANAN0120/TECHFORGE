"""Tests for Shops and Reviews API."""


def test_get_shops(client):
    res = client.get("/api/shops?campus_id=cu-gharaun")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
