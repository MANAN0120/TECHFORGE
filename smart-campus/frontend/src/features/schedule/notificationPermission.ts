import { ClassEntry } from './types';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<'granted' | 'denied' | 'default'> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
}

export interface ClassNotificationDetail {
  classEntry: ClassEntry;
  walkMinutes: number;
  timeStr: string;
}

export function showInAppBanner(cls: ClassEntry, walkMinutes: number, startAt?: Date): void {
  const timeStr = startAt
    ? startAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : cls.startTime;

  const event = new CustomEvent<ClassNotificationDetail>('smartcampus:class-notification', {
    detail: {
      classEntry: cls,
      walkMinutes,
      timeStr,
    },
  });
  window.dispatchEvent(event);
}
