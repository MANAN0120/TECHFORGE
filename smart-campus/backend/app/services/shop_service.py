"""Shop service — shop directory, user reviews, photo galleries, and rating computations."""

import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.shop import Shop, ShopPhoto
from app.models.review import Review, ReviewPhoto
from app.schemas.shop import (
    ShopResponse,
    ReviewResponse,
    ReviewCreate,
    ReviewPhotoResponse,
    ShopPhotoResponse,
)


def _build_shop_response(shop: Shop) -> ShopResponse:
    """Helper to convert Shop ORM model to ShopResponse schema with reviews and ratings."""
    reviews_list = []
    total_rating = 0
    for r in shop.reviews:
        total_rating += r.rating
        review_photos = [
            ReviewPhotoResponse(
                id=rp.id,
                review_id=rp.review_id,
                url=rp.url,
                uploaded_at=rp.uploaded_at,
            )
            for rp in r.photos
        ]
        reviews_list.append(
            ReviewResponse(
                id=r.id,
                shop_id=r.shop_id,
                rating=r.rating,
                text=r.text,
                reviewer_name=r.reviewer_name,
                created_at=r.created_at,
                photos=review_photos,
            )
        )

    total_reviews = len(reviews_list)
    avg_rating = round(total_rating / total_reviews, 1) if total_reviews > 0 else 0.0

    shop_photos = [
        ShopPhotoResponse(
            id=sp.id,
            shop_id=sp.shop_id,
            url=sp.url,
            uploaded_by=sp.uploaded_by,
            uploaded_at=sp.uploaded_at,
        )
        for sp in shop.photos
    ]

    return ShopResponse(
        id=shop.id,
        campus_id=shop.campus_id,
        name=shop.name,
        category=shop.category,
        lat=shop.lat,
        lng=shop.lng,
        building_id=shop.building_id,
        floor=shop.floor,
        description=shop.description,
        hours_open=shop.hours_open,
        hours_close=shop.hours_close,
        contact=shop.contact,
        verified=bool(shop.verified),
        average_rating=avg_rating,
        total_reviews=total_reviews,
        reviews=reviews_list,
        photos=shop_photos,
    )


def get_shops(db: Session, campus_id: str, category: str | None = None) -> list[ShopResponse]:
    """Get all shops for a campus, optionally filtered by category."""
    query = db.query(Shop).filter(Shop.campus_id == campus_id)
    if category:
        query = query.filter(Shop.category == category)
    shops = query.all()
    return [_build_shop_response(s) for s in shops]


def get_shop(db: Session, shop_id: str) -> ShopResponse | None:
    """Get a single shop with reviews and photos."""
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if not shop:
        return None
    return _build_shop_response(shop)


def add_review(db: Session, shop_id: str, review_data: ReviewCreate, photo_urls: list[str] | None = None) -> ReviewResponse:
    """Add a review with optional photos to a shop."""
    review_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    review = Review(
        id=review_id,
        shop_id=shop_id,
        rating=review_data.rating,
        text=review_data.text,
        reviewer_name=review_data.reviewer_name,
        created_at=now,
    )
    db.add(review)

    photos_resp = []
    if photo_urls:
        for url in photo_urls:
            p_id = str(uuid.uuid4())
            rp = ReviewPhoto(id=p_id, review_id=review_id, url=url, uploaded_at=now)
            db.add(rp)
            photos_resp.append(ReviewPhotoResponse(id=p_id, review_id=review_id, url=url, uploaded_at=now))

    db.commit()
    db.refresh(review)

    return ReviewResponse(
        id=review.id,
        shop_id=review.shop_id,
        rating=review.rating,
        text=review.text,
        reviewer_name=review.reviewer_name,
        created_at=review.created_at,
        photos=photos_resp,
    )


def add_shop_photo(db: Session, shop_id: str, url: str, uploaded_by: str = "Anonymous") -> ShopPhotoResponse:
    """Upload a photo directly to a shop showcase."""
    photo_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    photo = ShopPhoto(
        id=photo_id,
        shop_id=shop_id,
        url=url,
        uploaded_by=uploaded_by,
        uploaded_at=now,
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)

    return ShopPhotoResponse(
        id=photo.id,
        shop_id=photo.shop_id,
        url=photo.url,
        uploaded_by=photo.uploaded_by,
        uploaded_at=photo.uploaded_at,
    )
