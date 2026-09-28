import React, { useState, useEffect } from 'react';
import { Bell, Navigation, X, Footprints } from 'lucide-react';
import { ClassNotificationDetail } from './notificationPermission';

interface NotificationBannerProps {
  onNavigateToBuilding: (buildingId: string) => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ onNavigateToBuilding }) => {
  const [activeNotification, setActiveNotification] = useState<ClassNotificationDetail | null>(null);

  useEffect(() => {
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent<ClassNotificationDetail>;
      if (customEvent.detail) {
        setActiveNotification(customEvent.detail);
      }
    };

    window.addEventListener('smartcampus:class-notification', handleNotification);
    return () => window.removeEventListener('smartcampus:class-notification', handleNotification);
  }, []);

  useEffect(() => {
    if (activeNotification) {
      const timer = setTimeout(() => {
        setActiveNotification(null);
      }, 60000); // Auto-dismiss after 60s
      return () => clearTimeout(timer);
    }
  }, [activeNotification]);

  if (!activeNotification) return null;

  const { classEntry, walkMinutes, timeStr } = activeNotification;

  return (
    <div className="fixed top-16 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md z-[2000] bg-[#18181B] border-2 border-[#FBBF24] rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top duration-300 backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-[#FBBF24]/20 text-[#FBBF24] shrink-0 mt-0.5 animate-bounce">
          <Bell className="w-5 h-5 fill-current" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-extrabold text-sm text-[#FAFAFA] font-['Outfit'] truncate">
              {classEntry.subject} at {timeStr}
            </h4>
            <button
              onClick={() => setActiveNotification(null)}
              className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-zinc-300 mt-1 flex items-center gap-1.5 font-medium">
            <Footprints className="w-3.5 h-3.5 text-[#A3E635]" />
            <span>Walk time: <strong className="text-[#A3E635]">{walkMinutes} min</strong></span>
            <span>·</span>
            <span className="truncate">{classEntry.buildingId.toUpperCase()}{classEntry.room ? ` · ${classEntry.room}` : ''}</span>
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => {
                onNavigateToBuilding(classEntry.buildingId);
                setActiveNotification(null);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-[#A3E635] hover:bg-[#bef264] text-black font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5 fill-current" />
              <span>START NAVIGATION</span>
            </button>
            <button
              onClick={() => setActiveNotification(null)}
              className="py-2 px-3 rounded-xl bg-[#27272A] hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
