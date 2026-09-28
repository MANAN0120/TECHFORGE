"""Unit tests for Emergency SOS Safety Layer backend service."""

import pytest
from app.core.database import engine, Base, SessionLocal
from app.schemas.sos import SOSRequest
from app.services.sos_service import sos_service


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield


def test_trigger_sos_and_safe_points():
    db = SessionLocal()
    try:
        req = SOSRequest(
            campus_id="cu-gharaun",
            lat=30.7685,
            lng=76.5742,
            accuracy=5.0,
            message="Test Emergency SOS Alert",
            device_id="device-test-123",
        )
        res = sos_service.trigger(db, req)

        assert res.alert_id > 0
        assert res.status == "received"
        assert len(res.safe_points) > 0
        assert len(res.safe_points) <= 3
        top_safe = res.safe_points[0]
        assert top_safe.name
        assert top_safe.walk_seconds >= 0

        assert len(res.emergency_contacts) > 0
        assert "phone" in res.emergency_contacts[0]
    finally:
        db.close()
