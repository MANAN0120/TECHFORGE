-- Smart Campus Database Schema (SQLite MVP, PostgreSQL-ready)
-- This schema covers user-generated content stored in the database.
-- Static campus data (buildings, nodes, paths, POIs) is loaded from JSON manifests.

-- ============================================================
-- EVENTS (Admin-created, stored in DB for CRUD operations)
-- ============================================================

CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    campus_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'other',
    venue_name TEXT,
    venue_lat REAL,
    venue_lng REAL,
    building_id TEXT,
    starts_at TEXT NOT NULL,
    ends_at TEXT NOT NULL,
    organizer TEXT,
    cover_image TEXT,
    status TEXT NOT NULL DEFAULT 'upcoming',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- EVENT PHOTOS (User-uploaded live photos during events)
-- ============================================================

CREATE TABLE IF NOT EXISTS event_photos (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    url TEXT NOT NULL,
    uploaded_by TEXT NOT NULL DEFAULT 'Anonymous',
    uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- ============================================================
-- CAMPUS CONDITIONS (Admin-managed path blockages)
-- ============================================================

CREATE TABLE IF NOT EXISTS conditions (
    id TEXT PRIMARY KEY,
    campus_id TEXT NOT NULL,
    path_id TEXT NOT NULL,
    reason TEXT,
    severity TEXT NOT NULL DEFAULT 'blocked',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT,
    active INTEGER NOT NULL DEFAULT 1
);

-- ============================================================
-- CARTS (Dynamic cart positions, synced from manifest + live updates)
-- ============================================================

CREATE TABLE IF NOT EXISTS carts (
    id TEXT PRIMARY KEY,
    campus_id TEXT NOT NULL,
    name TEXT NOT NULL,
    route_id TEXT,
    capacity INTEGER DEFAULT 6,
    current_lat REAL,
    current_lng REAL,
    status TEXT NOT NULL DEFAULT 'inactive',
    driver_name TEXT,
    driver_phone TEXT,
    last_updated TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- SHOPS (Synced from manifest, enriched with reviews)
-- ============================================================

CREATE TABLE IF NOT EXISTS shops (
    id TEXT PRIMARY KEY,
    campus_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'other',
    lat REAL,
    lng REAL,
    building_id TEXT,
    floor INTEGER,
    description TEXT,
    hours_open TEXT,
    hours_close TEXT,
    contact TEXT,
    verified INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- REVIEWS (User-submitted shop reviews)
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT,
    reviewer_name TEXT NOT NULL DEFAULT 'Anonymous',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

-- ============================================================
-- REVIEW PHOTOS (Photos attached to reviews)
-- ============================================================

CREATE TABLE IF NOT EXISTS review_photos (
    id TEXT PRIMARY KEY,
    review_id TEXT NOT NULL,
    url TEXT NOT NULL,
    uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

-- ============================================================
-- SHOP PHOTOS (User-uploaded photos of shops — camera section)
-- ============================================================

CREATE TABLE IF NOT EXISTS shop_photos (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL,
    url TEXT NOT NULL,
    uploaded_by TEXT NOT NULL DEFAULT 'Anonymous',
    uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

-- ============================================================
-- NOTIFICATIONS (In-app notifications)
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    campus_id TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    target TEXT NOT NULL DEFAULT 'all',
    read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_events_campus ON events(campus_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_event_photos_event ON event_photos(event_id);
CREATE INDEX IF NOT EXISTS idx_conditions_campus ON conditions(campus_id);
CREATE INDEX IF NOT EXISTS idx_conditions_active ON conditions(active);
CREATE INDEX IF NOT EXISTS idx_carts_campus ON carts(campus_id);
CREATE INDEX IF NOT EXISTS idx_shops_campus ON shops(campus_id);
CREATE INDEX IF NOT EXISTS idx_reviews_shop ON reviews(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_photos_shop ON shop_photos(shop_id);
CREATE INDEX IF NOT EXISTS idx_notifications_campus ON notifications(campus_id);
