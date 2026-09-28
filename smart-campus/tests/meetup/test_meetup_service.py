"""Unit tests for Smart Meetup Point calculation service."""

import pytest
from app.schemas.meetup import MeetupRequest, PersonLocation
from app.services.meetup_service import MeetupService


@pytest.fixture
def meetup_svc():
    return MeetupService()


def test_midpoint_calculation(meetup_svc):
    loc_a = PersonLocation(lat=30.7680, lng=76.5740, label="Block A")
    loc_b = PersonLocation(lat=30.7700, lng=76.5760, label="Block B")
    mid_lat, mid_lng = meetup_svc._compute_midpoint(loc_a, loc_b)
    assert abs(mid_lat - 30.7690) < 1e-5
    assert abs(mid_lng - 30.7750) < 1e-5 or abs(mid_lng - 76.5750) < 1e-5


def test_suggest_meetup_equidistant(meetup_svc):
    # Two locations near campus center
    loc_a = PersonLocation(lat=30.7695, lng=76.5748, label="Academic Block 1")
    loc_b = PersonLocation(lat=30.7674, lng=76.5740, label="D6 Food Court")

    req = MeetupRequest(
        campus_id="cu-gharaun",
        person_a=loc_a,
        person_b=loc_b,
        accessible=False,
        max_radius_meters=500,
        limit=3,
    )
    res = meetup_svc.suggest_meetup(req)

    assert res.midpoint["lat"] > 0
    assert len(res.suggestions) > 0
    assert len(res.suggestions) <= 3
    # Verify top suggestion has valid fields
    top = res.suggestions[0]
    assert top.name
    assert top.walk_time_a >= 0
    assert top.walk_time_b >= 0
    assert top.score > 0
    assert top.reason


def test_suggest_meetup_accessible_mode(meetup_svc):
    loc_a = PersonLocation(lat=30.7685, lng=76.5738, label="Library")
    loc_b = PersonLocation(lat=30.7695, lng=76.5748, label="Block A1")

    req = MeetupRequest(
        campus_id="cu-gharaun",
        person_a=loc_a,
        person_b=loc_b,
        accessible=True,
        max_radius_meters=400,
        limit=3,
    )
    res = meetup_svc.suggest_meetup(req)
    assert isinstance(res.suggestions, list)
    for sug in res.suggestions:
        assert sug.accessible is True or req.accessible is False


def test_suggest_meetup_empty_radius(meetup_svc):
    # Location far outside campus with small radius
    loc_a = PersonLocation(lat=31.0000, lng=77.0000, label="Far Away A")
    loc_b = PersonLocation(lat=31.0010, lng=77.0010, label="Far Away B")

    req = MeetupRequest(
        campus_id="cu-gharaun",
        person_a=loc_a,
        person_b=loc_b,
        accessible=False,
        max_radius_meters=50,
        limit=3,
    )
    res = meetup_svc.suggest_meetup(req)
    assert len(res.suggestions) == 0
    assert len(res.warnings) > 0
    assert "No suitable meetup spots" in res.warnings[0]
