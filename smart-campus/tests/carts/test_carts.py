"""Tests for Campus Carts API."""


def test_get_carts(client):
    res = client.get("/api/carts?campus_id=cu-gharaun")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
