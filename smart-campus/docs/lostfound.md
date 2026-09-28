# Lost & Found Community Board

## Overview
The **Lost & Found Community Board** enables students and faculty at Chandigarh University to report missing or found items with photo attachments, spatial location markers, category tags, and direct contact options.

---

## Data Schema & Storage

### Table: `lost_items`
- `id`: Auto-incrementing primary key
- `campus_id`: Campus identifier (e.g., `cu-gharaun`)
- `type`: `lost` | `found`
- `title`: Short title
- `description`: Detailed item description
- `category`: `phone` | `wallet` | `id_card` | `keys` | `bag` | `other`
- `photo_url`: Path to uploaded photo stored under `/uploads/lostfound/`
- `last_seen_lat`, `last_seen_lng`: Coordinates where item was last seen
- `last_seen_label`: Human-readable location description
- `building_id`: Optional building manifest ID link
- `contact_info`: Phone, email, or handle
- `status`: `open` | `resolved`
- `created_at`, `resolved_at`: ISO datetimes

---

## Features & UX

1. **Photo Upload Support**
   - Supports camera capture on mobile devices and desktop image upload.
   - Files stored on static backend route `/uploads/lostfound/`.

2. **Distance & Map Integration**
   - Distance from user calculated via Haversine when GPS is enabled.
   - Items sorted by proximity to the user.
   - "Navigate to Location" button opens turn-by-turn navigation directly to the last-seen building/node.

3. **Rate Limiting & Abuse Prevention**
   - Rate limited to maximum 5 posts per hour per device / IP address.

4. **Resolution System**
   - "Mark as Resolved" action updates item status to `resolved` and sets timestamp.
