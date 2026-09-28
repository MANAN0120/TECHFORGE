import { ClassEntry, DayOfWeek, Timetable } from './types';

export function getTodayKey(): DayOfWeek {
  const days: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayIdx = new Date().getDay();
  return days[dayIdx];
}

export function parseTimeToDate(timeStr: string, baseDate: Date = new Date()): Date | null {
  if (!timeStr || !timeStr.includes(':')) return null;
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return null;

  const d = new Date(baseDate);
  d.setHours(h, m, 0, 0);
  return d;
}

export function minutesUntil(targetTimeStr: string, now: Date = new Date()): number {
  const targetDate = parseTimeToDate(targetTimeStr, now);
  if (!targetDate) return 0;
  const diffMs = targetDate.getTime() - now.getTime();
  return Math.floor(diffMs / 60000);
}

export function formatCountdown(minutes: number): string {
  if (minutes > 0) {
    if (minutes < 60) return `in ${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `in ${hrs}h ${mins}m`;
  } else if (minutes === 0) {
    return 'starting now';
  } else {
    const pastMin = Math.abs(minutes);
    return `started ${pastMin} min ago`;
  }
}

export function getTodayClasses(timetable: Timetable, dayKey: DayOfWeek = getTodayKey()): ClassEntry[] {
  if (!timetable || !Array.isArray(timetable.classes)) return [];
  const filtered = timetable.classes.filter((c) => c.day === dayKey);
  return filtered.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function getClassStatus(
  cls: ClassEntry,
  now: Date = new Date(),
  leadTimeMinutes: number = 15
): 'upcoming' | 'starting_soon' | 'in_progress' | 'past' {
  const startDate = parseTimeToDate(cls.startTime, now);
  const endDate = parseTimeToDate(cls.endTime, now);

  if (!startDate || !endDate) return 'upcoming';

  if (now > endDate) return 'past';
  if (now >= startDate && now <= endDate) return 'in_progress';

  const minsLeft = minutesUntil(cls.startTime, now);
  if (minsLeft <= leadTimeMinutes && minsLeft >= 0) return 'starting_soon';
  return 'upcoming';
}

export function getNextClass(timetable: Timetable, now: Date = new Date()): ClassEntry | null {
  const todayClasses = getTodayClasses(timetable, getTodayKey());
  for (const cls of todayClasses) {
    const endDate = parseTimeToDate(cls.endTime, now);
    if (endDate && now <= endDate) {
      return cls;
    }
  }
  return null;
}
