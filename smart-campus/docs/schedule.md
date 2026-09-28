# Class Schedule Auto-Pilot Documentation

## Overview

**Class Schedule Auto-Pilot** turns Smart Campus Navigator into a daily student routine companion. Students store their weekly timetable in `localStorage`, and the app computes real campus walking times to each class, firing intelligent reminders before lectures begin with one-tap live navigation.

---

## Architectural & Data Model

### 1. Timetable Storage (`smartcampus.timetable.v1`)
Stored in browser `localStorage`:

```typescript
interface ClassEntry {
  id: string;                    // uuid / unique string
  day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  startTime: string;             // "09:00" (24-hour local)
  endTime: string;               // "10:00"
  subject: string;               // "CS201 — Data Structures"
  buildingId: string;            // "block-b2" (matches campus manifest)
  room?: string;                 // "B2-204"
  notes?: string;
}

interface Timetable {
  version: 1;
  classes: ClassEntry[];
  notificationsEnabled: boolean;
  leadTimeMinutes: number;       // default 15
  lastUpdated: string;           // ISO timestamp
}
```

### 2. Settings Storage (`smartcampus.schedule.settings.v1`)

```typescript
interface ScheduleSettings {
  notificationsEnabled: boolean;
  leadTimeMinutes: number;       // 10, 15, 20, 30
  bufferMinutes: number;         // default 5
  soundEnabled: boolean;
  lastNotificationDate?: string; // "2026-09-29"
  notifiedClassIds: string[];    // class IDs already notified today
}
```

---

## Backend API Specification

### `POST /api/schedule/preview`

Calculates exact walk time and distance to a class building from user GPS or campus default entrance.

**Request Body**:
```json
{
  "campus_id": "cu-gharaun",
  "building_id": "block-b2",
  "from_lat": 30.7685,
  "from_lng": 76.5742,
  "accessible": false
}
```

**Response Body**:
```json
{
  "building_id": "block-b2",
  "building_name": "Academic Block 2 (B2)",
  "distance_meters": 420,
  "walk_seconds": 300,
  "walk_minutes": 5,
  "accessible": true
}
```

---

## Notification & Deep Link Flow

1. **Lead-Time Calculation**:
   $$\text{leaveAt} = \text{startTime} - (\text{walkMinutes} + \text{bufferMinutes})$$
2. **Notifier Loop**: Checks every 30s (`useScheduleNotifier.ts`). When $\text{minutesUntilLeave} \le \text{leadTimeMinutes}$, fires reminder notification or in-app top banner fallback.
3. **Notification Click**: Triggers deep-link navigation `/?to={buildingId}`.

---

## Testing & Verification

1. **Backend Unit Tests**:
   Run `pytest tests/schedule/test_schedule_preview.py`
2. **Frontend Compilation**:
   Run `npm run build` in `frontend/`
3. **Demo Seed**:
   Seed sample CU timetable using the dev button in Settings or query parameter `?seed=1`.
