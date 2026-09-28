"""Lightweight in-memory rate limiter for Lost & Found postings."""

import time
from typing import Dict, List

_rate_limit_store: Dict[str, List[float]] = {}


def check_rate_limit(key: str, max_requests: int = 5, window_seconds: int = 3600) -> bool:
    """
    Check if key (IP or device_id) has exceeded max_requests within window_seconds.
    Returns True if request is allowed, False if rate-limited.
    """
    now = time.time()
    timestamps = _rate_limit_store.get(key, [])

    # Filter out timestamps outside window
    timestamps = [t for t in timestamps if now - t < window_seconds]

    if len(timestamps) >= max_requests:
        _rate_limit_store[key] = timestamps
        return False

    timestamps.append(now)
    _rate_limit_store[key] = timestamps
    return True
