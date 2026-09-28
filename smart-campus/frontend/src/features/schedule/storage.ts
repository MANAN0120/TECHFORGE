import { Timetable, ScheduleSettings } from './types';

const TIMETABLE_STORAGE_KEY = 'smartcampus.timetable.v1';
const SETTINGS_STORAGE_KEY = 'smartcampus.schedule.settings.v1';

export const DEFAULT_TIMETABLE: Timetable = {
  version: 1,
  classes: [],
  notificationsEnabled: true,
  leadTimeMinutes: 15,
  lastUpdated: new Date().toISOString(),
};

export const DEFAULT_SETTINGS: ScheduleSettings = {
  notificationsEnabled: true,
  leadTimeMinutes: 15,
  bufferMinutes: 5,
  soundEnabled: true,
  notifiedClassIds: [],
};

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'cls-' + Math.random().toString(36).substring(2, 9);
}

export function loadTimetable(): Timetable {
  try {
    const raw = localStorage.getItem(TIMETABLE_STORAGE_KEY);
    if (!raw) return DEFAULT_TIMETABLE;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.classes)) {
      return {
        ...DEFAULT_TIMETABLE,
        ...parsed,
      };
    }
  } catch (err) {
    console.warn('Corrupt timetable in localStorage, returning defaults:', err);
  }
  return DEFAULT_TIMETABLE;
}

export function saveTimetable(timetable: Timetable): void {
  try {
    const updated = {
      ...timetable,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save timetable to localStorage:', err);
  }
}

export function loadSettings(): ScheduleSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      const todayDate = new Date().toISOString().split('T')[0];
      let notified = Array.isArray(parsed.notifiedClassIds) ? parsed.notifiedClassIds : [];
      // Reset notified IDs if date changed
      if (parsed.lastNotificationDate !== todayDate) {
        notified = [];
      }
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        notifiedClassIds: notified,
        lastNotificationDate: todayDate,
      };
    }
  } catch (err) {
    console.warn('Corrupt schedule settings in localStorage, returning defaults:', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: ScheduleSettings): void {
  try {
    const todayDate = new Date().toISOString().split('T')[0];
    const payload = {
      ...settings,
      lastNotificationDate: todayDate,
    };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('Failed to save schedule settings to localStorage:', err);
  }
}

export function clearAllStorage(): void {
  try {
    localStorage.removeItem(TIMETABLE_STORAGE_KEY);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear schedule storage:', err);
  }
}
