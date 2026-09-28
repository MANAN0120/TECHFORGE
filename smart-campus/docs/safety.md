# Emergency SOS & Campus Safety Layer

## Overview
The **Emergency SOS Safety Layer** is a campus-agnostic emergency response feature embedded in Smart Campus Navigator. It allows students, faculty, and visitors to instantly request campus emergency assistance with a single tap while automatically delivering spatial context to campus security.

---

## Key Features

1. **Persistent Top-Bar SOS Button**
   - Accessible globally across all pages and views (`SOSButton.tsx`).
   - Red alert palette token (`#F87171`), animated siren icon, touch-friendly 44px+ hit area.

2. **Accidental Trigger Prevention**
   - Requires explicit confirmation via modal.
   - Includes a 1.5-second countdown on the **SEND ALERT** button allowing cancellation if tapped by mistake.

3. **Dynamic Safe Points Engine**
   - Calculates the top 3 nearest safe points dynamically from the campus manifest using the NetworkX Dijkstra routing engine (`routing_service.py`).
   - Categories evaluated: `medical`, `security`, `admin`, and any POI with `metadata.safe_point: true`.
   - Never hardcodes coordinates or static distances.

4. **Emergency Contact Directory**
   - Displays tap-to-call direct `tel:` links for Campus Security Plaza, Health Centre, and Helpline.

5. **Privacy Preserving**
   - SOS alerts are logged to `sos_alerts` backend database for audit logs only.
   - Alerts are not visible publicly.

---

## Technical Flow

```
[User Taps SOS] -> [Confirmation Modal + 1.5s Countdown]
                       |
               [User Confirms]
                       |
     POST /api/sos/alert { campus_id, lat, lng, device_id }
                       |
 1. Log alert to sos_alerts table
 2. Compute 3 nearest safe points via NetworkX walk routing
 3. Load campus emergency contacts from campus.json
                       |
 [Return SOSResponse to Frontend] -> [Show Safe Points & Contacts]
```
