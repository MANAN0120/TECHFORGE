import React, { useState, useEffect } from 'react';
import { Clock, Navigation, AlertTriangle, CalendarCheck, Footprints, Sparkles } from 'lucide-react';
import { Timetable, ScheduleSettings, ClassEntry } from './types';
import { getTodayClasses, getNextClass, minutesUntil, formatCountdown, parseTimeToDate, getTodayKey } from './scheduleUtils';
import { ClassCard } from './ClassCard';
import { fetchWalkMinutes } from './useScheduleNotifier';

interface TodayScheduleProps {
  timetable: Timetable;
  settings: ScheduleSettings;
  userLocation?: { lat: number; lng: number } | null;
  onNavigateToBuilding: (buildingId: string) => void;
}

export const TodaySchedule: React.FC<TodayScheduleProps> = ({
  timetable,
  settings,
  userLocation,
  onNavigateToBuilding,
}) => {
  const [now, setNow] = useState<Date>(new Date());
  const [nextClassWalkMinutes, setNextClassWalkMinutes] = useState<number | null>(null);

  // Update `now` every 30 seconds for live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const todayClasses = getTodayClasses(timetable, getTodayKey());
  const nextClass = getNextClass(timetable, now);

  useEffect(() => {
    if (nextClass) {
      fetchWalkMinutes(nextClass.buildingId, userLocation).then((mins) => {
        setNextClassWalkMinutes(mins);
      });
    }
  }, [nextClass, userLocation]);

  // Format today's date
  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  let nextClassMinsUntil = 0;
  let leaveByTimeStr = '';
  let mustLeaveNow = false;

  if (nextClass) {
    nextClassMinsUntil = minutesUntil(nextClass.startTime, now);
    const startDate = parseTimeToDate(nextClass.startTime, now);
    const walkM = nextClassWalkMinutes !== null ? nextClassWalkMinutes : 5;

    if (startDate) {
      const leaveDate = new Date(startDate.getTime() - (walkM + settings.bufferMinutes) * 60_000);
      leaveByTimeStr = leaveDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      
      const minsUntilLeave = (leaveDate.getTime() - now.getTime()) / 60_000;
      if (minsUntilLeave <= 2 && minsUntilLeave >= -10) {
        mustLeaveNow = true;
      }
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 animate-in fade-in duration-200">
      {/* Date Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#FAFAFA] font-['Outfit']">
            Today's Schedule
          </h2>
          <p className="text-xs text-[#A1A1AA] font-semibold">{dateStr}</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#18181B] border border-[#3F3F46] text-[#A3E635]">
          {todayClasses.length} {todayClasses.length === 1 ? 'Class' : 'Classes'}
        </span>
      </div>

      {/* Next Class Hero Countdown Card */}
      {nextClass ? (
        <div className={`p-4 sm:p-5 rounded-3xl bg-[#18181B] border transition-all shadow-2xl space-y-3 ${
          mustLeaveNow
            ? 'border-[#FBBF24] ring-2 ring-[#FBBF24]/40 bg-[#18181B]'
            : 'border-[#A3E635]/60 ring-1 ring-[#A3E635]/20'
        }`}>
          {/* Leave Now Banner */}
          {mustLeaveNow && (
            <div className="p-2.5 rounded-2xl bg-[#FBBF24]/20 border border-[#FBBF24]/40 text-[#FBBF24] text-xs font-extrabold flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#FBBF24]" />
                <span>LEAVE NOW TO BE ON TIME!</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider bg-[#FBBF24] text-black px-2 py-0.5 rounded font-black">
                Urgent
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A3E635]" />
              <span className="text-xs font-bold text-[#A3E635] uppercase tracking-wider">
                Next Upcoming Class
              </span>
            </div>
            <span className="text-xs font-extrabold text-[#FAFAFA] font-['Outfit']">
              {formatCountdown(nextClassMinsUntil)}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-[#FAFAFA] font-['Outfit']">
              {nextClass.subject}
            </h3>
            <p className="text-xs text-[#A1A1AA] mt-1 font-medium">
              {nextClass.buildingId.toUpperCase()}{nextClass.room ? ` · Room ${nextClass.room}` : ''}
              {leaveByTimeStr && (
                <span className="ml-2 text-zinc-300">
                  · Leave by <strong className="text-[#FBBF24]">{leaveByTimeStr}</strong>
                </span>
              )}
            </p>
          </div>

          <button
            onClick={() => onNavigateToBuilding(nextClass.buildingId)}
            className="w-full py-3 px-4 rounded-2xl bg-[#A3E635] hover:bg-[#bef264] text-black font-extrabold text-xs shadow-lg shadow-[#A3E635]/20 transition-all flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4 fill-current" />
            <span>START NAVIGATION TO {nextClass.buildingId.toUpperCase()}</span>
          </button>
        </div>
      ) : (
        <div className="p-8 text-center border-2 border-dashed border-[#3F3F46] rounded-3xl bg-[#18181B]/60 space-y-2">
          <CalendarCheck className="w-10 h-10 text-[#A3E635] mx-auto" />
          <h3 className="text-base font-extrabold text-[#FAFAFA] font-['Outfit']">
            No remaining classes today 🎉
          </h3>
          <p className="text-xs text-zinc-400">
            You're all done with today's lectures. Enjoy your free time on campus!
          </p>
        </div>
      )}

      {/* Today's Classes List */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">
          All Today's Classes ({todayClasses.length})
        </h3>

        {todayClasses.length > 0 ? (
          todayClasses.map((cls) => (
            <ClassCard
              key={cls.id}
              classEntry={cls}
              mode="today"
              leadTimeMinutes={settings.leadTimeMinutes}
              bufferMinutes={settings.bufferMinutes}
              userLocation={userLocation}
              onNavigate={onNavigateToBuilding}
            />
          ))
        ) : (
          <div className="p-6 text-center rounded-2xl bg-[#18181B] border border-[#3F3F46] text-xs text-zinc-400">
            No classes scheduled for today.
          </div>
        )}
      </div>
    </div>
  );
};
