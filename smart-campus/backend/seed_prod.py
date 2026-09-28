"""Production database seeder — creates tables and seeds data on Railway startup."""

import json
import sqlite3
import uuid
import os
from pathlib import Path


def seed():
    """Seed the database for production deployment."""
    # Resolve paths relative to the backend directory
    backend_dir = Path(__file__).resolve().parent
    project_root = backend_dir.parent
    schema_path = project_root / "database" / "schema.sql"
    db_url = os.environ.get("DATABASE_URL", "sqlite:///./smart_campus.db")

    # Extract the DB file path from sqlite:/// URL
    if db_url.startswith("sqlite:///"):
        db_path = db_url.replace("sqlite:///", "")
        if db_path.startswith("./"):
            db_path = backend_dir / db_path[2:]
        else:
            db_path = Path(db_path)
    else:
        db_path = backend_dir / "smart_campus.db"

    campus_data_dir = os.environ.get(
        "CAMPUS_DATA_DIR",
        str(project_root / "campus-data"),
    )
    campus_id = os.environ.get("DEFAULT_CAMPUS_ID", "cu-gharaun")

    print(f"[SEED] Production seeder running...")
    print(f"  DB: {db_path}")
    print(f"  Schema: {schema_path}")
    print(f"  Campus data: {campus_data_dir}/{campus_id}")

    conn = sqlite3.connect(str(db_path))
    try:
        # Create tables
        if schema_path.exists():
            schema = schema_path.read_text(encoding="utf-8")
            conn.executescript(schema)
            print("[OK] Tables created")
        else:
            print(f"[WARN] Schema not found at {schema_path}, skipping table creation")

        campus_path = Path(campus_data_dir) / campus_id

        # Seed events
        events_file = campus_path / "events.sample.json"
        if events_file.exists():
            events = json.loads(events_file.read_text(encoding="utf-8"))
            cursor = conn.cursor()
            for ev in events:
                cursor.execute(
                    """INSERT OR IGNORE INTO events
                    (id, campus_id, title, description, category, venue_name,
                     venue_lat, venue_lng, building_id, starts_at, ends_at,
                     organizer, cover_image, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        ev["id"], campus_id, ev["title"],
                        ev.get("description", ""), ev.get("category", "other"),
                        ev.get("venue_name", ""), ev.get("venue_lat"),
                        ev.get("venue_lng"), ev.get("building_id"),
                        ev["starts_at"], ev["ends_at"],
                        ev.get("organizer", ""), ev.get("cover_image"),
                        ev.get("status", "upcoming"),
                    ),
                )
            conn.commit()
            print(f"[OK] Seeded {len(events)} events")

        # Seed carts
        carts_file = campus_path / "carts.json"
        if carts_file.exists():
            carts = json.loads(carts_file.read_text(encoding="utf-8"))
            cursor = conn.cursor()
            for cart in carts:
                cursor.execute(
                    """INSERT OR IGNORE INTO carts
                    (id, campus_id, name, route_id, capacity, current_lat, current_lng,
                     status, driver_name, driver_phone)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        cart["id"], campus_id, cart["name"],
                        cart.get("route_id"), cart.get("capacity", 6),
                        cart.get("current_lat"), cart.get("current_lng"),
                        cart.get("status", "inactive"),
                        cart.get("driver_name"), cart.get("driver_phone"),
                    ),
                )
            conn.commit()
            print(f"[OK] Seeded {len(carts)} carts")

        # Seed shops
        shops_file = campus_path / "shops.json"
        if shops_file.exists():
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
                        shop["id"], campus_id, shop["name"],
                        shop.get("category", "other"), shop.get("lat"),
                        shop.get("lng"), shop.get("building_id"),
                        shop.get("floor"), shop.get("description", ""),
                        hours.get("open"), hours.get("close"),
                        shop.get("contact"),
                        1 if shop.get("verified", False) else 0,
                    ),
                )
            conn.commit()
            print(f"[OK] Seeded {len(shops)} shops")

        # Seed sample reviews
        sample_reviews = [
            ("shop-main-cafe", 5, "Best North Indian thali on campus!", "Rahul Sharma"),
            ("shop-main-cafe", 4, "Spacious seating, quick service.", "Simran Kaur"),
            ("shop-d6-cafe", 5, "Best cold coffee and grilled burgers!", "Aman Verma"),
            ("shop-juice-corner", 5, "Fresh fruit smoothies are 10/10.", "Priya Singh"),
            ("shop-maggi-point", 5, "Cheesy peri-peri maggi is unmatched.", "Karan Patel"),
            ("shop-stationery", 4, "Everything for engineering charts.", "Sneha Roy"),
            ("shop-quick-print", 5, "Super fast spiral binding!", "Ankit Gupta"),
            ("shop-chai-adda", 5, "Authentic masala chai and samosas.", "Jaspreet Singh"),
        ]
        cursor = conn.cursor()
        for s_id, rat, txt, rev_name in sample_reviews:
            cursor.execute(
                """INSERT OR IGNORE INTO reviews (id, shop_id, rating, text, reviewer_name, created_at)
                VALUES (?, ?, ?, ?, ?, ?)""",
                (str(uuid.uuid4()), s_id, rat, txt, rev_name, "2026-09-28T10:00:00"),
            )
        conn.commit()
        print(f"[OK] Seeded {len(sample_reviews)} sample reviews")

        # Seed notifications
        notifs = [
            ("Welcome to Smart Campus!", "Explore the map, search buildings, and navigate CU.", "general"),
            ("TechFest 2026 Registrations Open", "Hackathons, workshops, and more. Oct 5-7.", "event"),
        ]
        cursor = conn.cursor()
        for title, body, cat in notifs:
            cursor.execute(
                """INSERT OR IGNORE INTO notifications (id, campus_id, title, body, category, target)
                VALUES (?, ?, ?, ?, ?, ?)""",
                (str(uuid.uuid4()), campus_id, title, body, cat, "all"),
            )
        conn.commit()
        print(f"[OK] Seeded {len(notifs)} notifications")

        print("[DONE] Production database seeded successfully!")

    except Exception as e:
        print(f"[ERROR] Seed failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()


if __name__ == "__main__":
    seed()
