"""Seed the database with schema and initial data from campus manifests."""

import json
import sqlite3
import sys
import uuid
from pathlib import Path

# Project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent
SCHEMA_PATH = PROJECT_ROOT / "database" / "schema.sql"
DB_PATH = PROJECT_ROOT / "backend" / "smart_campus.db"
CAMPUS_DATA_DIR = PROJECT_ROOT / "campus-data"


def create_tables(conn: sqlite3.Connection):
    """Execute schema.sql to create all tables."""
    schema = SCHEMA_PATH.read_text(encoding="utf-8")
    conn.executescript(schema)
    print(f"[OK] Tables created from {SCHEMA_PATH}")


def seed_events(conn: sqlite3.Connection, campus_id: str):
    """Seed events from events.sample.json."""
    events_file = CAMPUS_DATA_DIR / campus_id / "events.sample.json"
    if not events_file.exists():
        print(f"  [WARN] No events.sample.json found for {campus_id}")
        return

    events = json.loads(events_file.read_text(encoding="utf-8"))
    cursor = conn.cursor()

    for event in events:
        cursor.execute(
            """INSERT OR IGNORE INTO events
            (id, campus_id, title, description, category, venue_name,
             venue_lat, venue_lng, building_id, starts_at, ends_at,
             organizer, cover_image, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                event["id"],
                campus_id,
                event["title"],
                event.get("description", ""),
                event.get("category", "other"),
                event.get("venue_name", ""),
                event.get("venue_lat"),
                event.get("venue_lng"),
                event.get("building_id"),
                event["starts_at"],
                event["ends_at"],
                event.get("organizer", ""),
                event.get("cover_image"),
                event.get("status", "upcoming"),
            ),
        )

    conn.commit()
    print(f"  [OK] Seeded {len(events)} events for {campus_id}")


def seed_carts(conn: sqlite3.Connection, campus_id: str):
    """Seed carts from carts.json."""
    carts_file = CAMPUS_DATA_DIR / campus_id / "carts.json"
    if not carts_file.exists():
        print(f"  [WARN] No carts.json found for {campus_id}")
        return

    carts = json.loads(carts_file.read_text(encoding="utf-8"))
    cursor = conn.cursor()

    for cart in carts:
        cursor.execute(
            """INSERT OR IGNORE INTO carts
            (id, campus_id, name, route_id, capacity, current_lat, current_lng,
             status, driver_name, driver_phone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                cart["id"],
                campus_id,
                cart["name"],
                cart.get("route_id"),
                cart.get("capacity", 6),
                cart.get("current_lat"),
                cart.get("current_lng"),
                cart.get("status", "inactive"),
                cart.get("driver_name"),
                cart.get("driver_phone"),
            ),
        )

    conn.commit()
    print(f"  [OK] Seeded {len(carts)} carts for {campus_id}")


def seed_shops(conn: sqlite3.Connection, campus_id: str):
    """Seed shops from shops.json."""
    shops_file = CAMPUS_DATA_DIR / campus_id / "shops.json"
    if not shops_file.exists():
        print(f"  [WARN] No shops.json found for {campus_id}")
        return

    shops = json.loads(shops_file.read_text(encoding="utf-8"))
    cursor = conn.cursor()

    for shop in shops:
        hours = shop.get("hours", {})
        cursor.execute(
            """INSERT OR IGNORE INTO shops
            (id, campus_id, name, category, lat, lng, building_id, floor,
             description, hours_open, hours_close, contact, verified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                shop["id"],
                campus_id,
                shop["name"],
                shop.get("category", "other"),
                shop.get("lat"),
                shop.get("lng"),
                shop.get("building_id"),
                shop.get("floor"),
                shop.get("description", ""),
                hours.get("open"),
                hours.get("close"),
                shop.get("contact"),
                1 if shop.get("verified", False) else 0,
            ),
        )

    conn.commit()
    print(f"  [OK] Seeded {len(shops)} shops for {campus_id}")


def seed_sample_notifications(conn: sqlite3.Connection, campus_id: str):
    """Seed a few sample notifications."""
    notifications = [
        {
            "id": str(uuid.uuid4()),
            "campus_id": campus_id,
            "title": "Welcome to Smart Campus!",
            "body": "Explore the campus map, search for buildings, and find your way around CU.",
            "category": "general",
            "target": "all",
        },
        {
            "id": str(uuid.uuid4()),
            "campus_id": campus_id,
            "title": "TechFest 2026 Registrations Open",
            "body": "Register for CU TechFest 2026! Hackathons, workshops, and more. Oct 5-7.",
            "category": "event",
            "target": "all",
        },
    ]

    cursor = conn.cursor()
    for notif in notifications:
        cursor.execute(
            """INSERT INTO notifications (id, campus_id, title, body, category, target)
            VALUES (?, ?, ?, ?, ?, ?)""",
            (
                notif["id"],
                notif["campus_id"],
                notif["title"],
                notif["body"],
                notif["category"],
                notif["target"],
            ),
        )

    conn.commit()
    print(f"  [OK] Seeded {len(notifications)} sample notifications")


def main():
    campus_id = sys.argv[1] if len(sys.argv) > 1 else "cu-gharaun"
    print(f"\n[SEED] Seeding Smart Campus database for '{campus_id}'...\n")

    conn = sqlite3.connect(str(DB_PATH))
    try:
        create_tables(conn)
        seed_events(conn, campus_id)
        seed_carts(conn, campus_id)
        seed_shops(conn, campus_id)
        seed_sample_notifications(conn, campus_id)
        print(f"\n[DONE] Database seeded successfully at {DB_PATH}\n")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
