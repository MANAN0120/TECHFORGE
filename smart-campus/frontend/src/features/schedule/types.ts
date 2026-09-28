export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface ClassEntry {
  id: string;
  day: DayOfWeek;
  startTime: string;             // "09:00" (24-hour local)
  endTime: string;               // "10:00"
  subject: string;               // "CS201 — Data Structures"
  buildingId: string;            // "block-b2"
  room?: string;                 // "B2-204"
  notes?: string;
}

export interface Timetable {
  version: 1;
  classes: ClassEntry[];
  notificationsEnabled: boolean;
  leadTimeMinutes: number;       // default 15
  lastUpdated: string;           // ISO timestamp
}

export interface ScheduleSettings {
  notificationsEnabled: boolean;
  leadTimeMinutes: number;       // 10, 15, 20, 30
  bufferMinutes: number;         // default 5
  soundEnabled: boolean;
  lastNotificationDate?: string; // "2026-09-29"
  notifiedClassIds: string[];    // class IDs already notified today
}
