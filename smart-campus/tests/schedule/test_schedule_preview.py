"""Unit tests for Class Schedule Auto-Pilot walk-time preview endpoint."""

import asyncio
import pytest
from app.schemas.schedule import SchedulePreviewRequest
from app.api.schedule import preview_class_route


def test_preview_class_route_valid_building():
    req = SchedulePreviewRequest(
        campus_id="cu-gharaun",
        building_id="block-b2",
        accessible=False,
    )
    res = asyncio.run(preview_class_route(req))
    assert res.building_id == "block-b2"
    assert res.walk_seconds > 0
    assert res.walk_minutes > 0
    assert res.distance_meters > 0


def test_preview_class_route_custom_origin():
    req = SchedulePreviewRequest(
        campus_id="cu-gharaun",
        building_id="block-a1",
        from_lat=30.7685,
        from_lng=76.5742,
        accessible=False,
    )
    res = asyncio.run(preview_class_route(req))
    assert res.building_id == "block-a1"
    assert res.walk_seconds > 0
    assert res.walk_minutes > 0


def test_preview_class_route_accessible_mode():
    req = SchedulePreviewRequest(
        campus_id="cu-gharaun",
        building_id="block-c1",
        accessible=True,
    )
    res = asyncio.run(preview_class_route(req))
    assert res.building_id == "block-c1"
    assert isinstance(res.accessible, bool)
