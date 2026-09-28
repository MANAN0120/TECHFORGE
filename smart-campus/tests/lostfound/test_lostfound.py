"""Unit tests for Lost & Found Feature backend endpoints and repository."""

import pytest
from app.core.database import engine, Base, SessionLocal
from app.schemas.lostfound import LostItemCreate
from app.services.lostfound_service import lostfound_service


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield


def test_create_and_list_lost_item():
    db = SessionLocal()
    try:
        item_in = LostItemCreate(
            campus_id="cu-gharaun",
            type="lost",
            title="Black Leather Wallet",
            description="Lost near D6 Food Court around 2 PM. Has student ID card.",
            category="wallet",
            contact_info="9876543210",
            last_seen_lat=30.7674,
            last_seen_lng=76.5740,
            last_seen_label="D6 Food Court",
            building_id="block-d6",
        )
        created = lostfound_service.create_item(db, item_in)
        assert created.id > 0
        assert created.title == "Black Leather Wallet"
        assert created.type == "lost"
        assert created.status == "open"

        # List items with user coordinates
        res = lostfound_service.list_items(db, "cu-gharaun", user_lat=30.7680, user_lng=76.5742)
        assert res.total >= 1
        found_item = next(i for i in res.items if i.id == created.id)
        assert found_item.distance_from_user_meters is not None
        assert found_item.distance_from_user_meters > 0

        # Resolve item
        resolved = lostfound_service.resolve_item(db, created.id)
        assert resolved.status == "resolved"
        assert resolved.resolved_at is not None
    finally:
        db.close()
