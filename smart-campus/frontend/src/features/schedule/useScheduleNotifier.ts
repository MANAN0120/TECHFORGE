import { useEffect, useRef } from 'react';
import { ClassEntry, Timetable, ScheduleSettings } from './types';
import { getTodayKey, parseTimeToDate } from './scheduleUtils';
import { showInAppBanner, isNotificationSupported } from './notificationPermission';
import { api } from '../../services/api';

const walkCache = new Map<string, { minutes: number; at: number }>();

export async function fetchWalkMinutes(
  buildingId: string,
  userLocation?: { lat: number; lng: number } | null
): Promise<number> {
  const cached = walkCache.get(buildingId);
  if (cached && Date.now() - cached.at < 5 * 60_000) {
    return cached.minutes;
  }

  try {
    const res = await api.previewClassRoute({
      campus_id: 'cu-gharaun',
      building_id: buildingId,
      from_lat: userLocation?.lat,
      from_lng: userLocation?.lng,
      accessible: false,
    });
    const minutes = res.walk_minutes || 4;
    walkCache.set(buildingId, { minutes, at: Date.now() });
    return minutes;
  } catch (err) {
    console.warn('Failed to fetch walk minutes for building', buildingId, err);
    return 5; // Default fallback walk time in minutes
  }
}

export function fireClassNotification(
  cls: ClassEntry,
  walkMinutes: number,
  startAt: Date,
  onNavigate?: (buildingId: string) => void
): void {
  const timeStr = startAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      const notif = new Notification(`${cls.subject} at ${timeStr}`, {
        body: `Walk time: ${walkMinutes} min · ${cls.buildingId}${cls.room ? ` · ${cls.room}` : ''}`,
        icon: '/favicon.ico',
        tag: `class-${cls.id}`,
        requireInteraction: true,
      });

      notif.onclick = () => {
        window.focus();
        if (onNavigate) {
          onNavigate(cls.buildingId);
        } else {
          window.location.href = `/?to=${cls.buildingId}`;
        }
      };
      return;
    } catch (err) {
      console.warn('Browser Notification construction failed, falling back to in-app banner:', err);
    }
  }

  // Fallback in-app banner
  showInAppBanner(cls, walkMinutes, startAt);
}

export function useScheduleNotifier(
  timetable: Timetable,
  settings: ScheduleSettings,
  onUpdateSettings: (updates: Partial<ScheduleSettings>) => void,
  userLocation?: { lat: number; lng: number } | null,
  onNavigate?: (buildingId: string) => void
) {
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const timetableRef = useRef(timetable);
  timetableRef.current = timetable;

  useEffect(() => {
    const checkSchedule = async () => {
      const currSettings = settingsRef.current;
      const currTimetable = timetableRef.current;

      if (!currSettings.notificationsEnabled) return;

      const now = new Date();
      const today = getTodayKey();
      const todayClasses = currTimetable.classes.filter((c) => c.day === today);

      const newlyNotifiedIds: string[] = [...currSettings.notifiedClassIds];
      let hasNewNotif = false;

      for (const cls of todayClasses) {
        if (newlyNotifiedIds.includes(cls.id)) continue;

        const startAt = parseTimeToDate(cls.startTime, now);
        if (!startAt) continue;

        const walkMinutes = await fetchWalkMinutes(cls.buildingId, userLocation);
        const leaveAt = new Date(startAt.getTime() - (walkMinutes + currSettings.bufferMinutes) * 60_000);

        const minutesUntilLeave = (leaveAt.getTime() - now.getTime()) / 60_000;

        // Fire notification when within leadTime window and not past starting time
        if (minutesUntilLeave <= currSettings.leadTimeMinutes && minutesUntilLeave > -5) {
          fireClassNotification(cls, walkMinutes, startAt, onNavigate);
          newlyNotifiedIds.push(cls.id);
          hasNewNotif = true;
        }
      }

      if (hasNewNotif) {
        onUpdateSettings({ notifiedClassIds: newlyNotifiedIds });
      }
    };

    // Run check immediately on mount and then every 30 seconds
    checkSchedule();
    const interval = setInterval(checkSchedule, 30_000);

    return () => clearInterval(interval);
  }, [userLocation, onUpdateSettings, onNavigate]);
}
