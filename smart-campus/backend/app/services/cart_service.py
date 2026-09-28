"""Cart service — real-time campus cart tracking and ETA calculation."""

import math
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.cart import Cart
from app.schemas.cart import CartResponse, NearestCartResponse


def _haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Distance in meters."""
    R = 6371000
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)
    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def get_carts(db: Session, campus_id: str) -> list[CartResponse]:
    """Get all carts for a campus."""
    carts = db.query(Cart).filter(Cart.campus_id == campus_id).all()
    return [
        CartResponse(
            id=c.id,
            campus_id=c.campus_id,
            name=c.name,
            route_id=c.route_id,
            capacity=c.capacity,
            current_lat=c.current_lat,
            current_lng=c.current_lng,
            status=c.status,
            driver_name=c.driver_name,
            driver_phone=c.driver_phone,
            last_updated=c.last_updated,
        )
        for c in carts
    ]


def get_nearest_cart(db: Session, campus_id: str, lat: float, lng: float) -> NearestCartResponse | None:
    """Find the closest active cart and calculate ETA in minutes."""
    carts = db.query(Cart).filter(
        Cart.campus_id == campus_id,
        Cart.current_lat.isnot(None),
        Cart.current_lng.isnot(None),
    ).all()

    if not carts:
        return None

    best_cart = None
    min_distance = float("inf")

    for cart in carts:
        dist = _haversine(lat, lng, cart.current_lat, cart.current_lng)
        if dist < min_distance:
            min_distance = dist
            best_cart = cart

    if not best_cart:
        return None

    # Cart speed ~ 12 km/h = 3.33 m/s
    speed_mps = 3.33
    eta_seconds = min_distance / speed_mps
    eta_minutes = round(max(1.0, eta_seconds / 60.0), 1)

    cart_resp = CartResponse(
        id=best_cart.id,
        campus_id=best_cart.campus_id,
        name=best_cart.name,
        route_id=best_cart.route_id,
        capacity=best_cart.capacity,
        current_lat=best_cart.current_lat,
        current_lng=best_cart.current_lng,
        status=best_cart.status,
        driver_name=best_cart.driver_name,
        driver_phone=best_cart.driver_phone,
        last_updated=best_cart.last_updated,
    )

    return NearestCartResponse(
        cart=cart_resp,
        distance_meters=round(min_distance, 1),
        estimated_arrival_minutes=eta_minutes,
        user_lat=lat,
        user_lng=lng,
    )


def update_cart_position(db: Session, cart_id: str, lat: float, lng: float, status: str | None = None) -> CartResponse | None:
    """Update cart location and status."""
    cart = db.query(Cart).filter(Cart.id == cart_id).first()
    if not cart:
        return None

    cart.current_lat = lat
    cart.current_lng = lng
    if status:
        cart.status = status
    cart.last_updated = datetime.utcnow().isoformat()
    db.commit()
    db.refresh(cart)

    return CartResponse(
        id=cart.id,
        campus_id=cart.campus_id,
        name=cart.name,
        route_id=cart.route_id,
        capacity=cart.capacity,
        current_lat=cart.current_lat,
        current_lng=cart.current_lng,
        status=cart.status,
        driver_name=cart.driver_name,
        driver_phone=cart.driver_phone,
        last_updated=cart.last_updated,
    )
