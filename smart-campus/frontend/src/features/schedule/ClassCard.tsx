import React, { useState, useEffect } from 'react';
import { Navigation, Edit3, Trash2, Footprints, Clock, MapPin } from 'lucide-react';
import { ClassEntry } from './types';
import { getClassStatus, parseTimeToDate } from './scheduleUtils';
import { fetchWalkMinutes } from './useScheduleNotifier';

interface ClassCardProps {
  classEntry: ClassEntry;
  mode: 'today' | 'editor';
  leadTimeMinutes?: number;
  bufferMinutes?: number;
  userLocation?: { lat: number; lng: number } | null;
  onNavigate?: (buildingId: string) => void;
  onEdit?: (entry: ClassEntry) => void;
  onDelete?: (id: string) => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  classEntry,
  mode,
  leadTimeMinutes = 15,
  bufferMinutes = 5,
  userLocation,
  onNavigate,
  onEdit,
  onDelete,
}) => {
  const [walkMinutes, setWalkMinutes] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchWalkMinutes(classEntry.buildingId, userLocation).then((mins) => {
      if (isMounted) setWalkMinutes(mins);
    });
    return () => {
      isMounted = false;
    };
  }, [classEntry.buildingId, userLocation]);

  const status = getClassStatus(classEntry, new Date(), leadTimeMinutes);

  // Compute Leave-by time
  const startDate = parseTimeToDate(classEntry.startTime);
  let leaveByTimeStr = '';
  if (startDate && walkMinutes !== null) {
    const leaveDate = new Date(startDate.getTime() - (walkMinutes + bufferMinutes) * 60_000);
    leaveByTimeStr = leaveDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-[#A3E635]/20 text-[#A3E635] border border-[#A3E635]/30">
            In Progress
          </span>
        );
      case 'starting_soon':
        return (
          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/30 animate-pulse">
            Starts Soon
          </span>
        );
      case 'past':
        return (
          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-500">
            Past
          </span>
        );
      default:
        return (
          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-[#27272A] text-[#A1A1AA]">
            Upcoming
          </span>
        );
    }
  };

  if (mode === 'editor') {
    return (
      <div className="p-4 rounded-2xl bg-[#18181B] border border-[#3F3F46] hover:border-zinc-500 transition-all shadow-lg flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#A3E635] font-['Outfit']">
              {classEntry.startTime} – {classEntry.endTime}
            </span>
          </div>
          <h4 className="text-sm font-extrabold text-[#FAFAFA] font-['Outfit'] mt-0.5 truncate">
            {classEntry.subject}
          </h4>
          <p className="text-xs text-[#A1A1AA] mt-0.5 truncate">
            {classEntry.buildingId.toUpperCase()}{classEntry.room ? ` · Room ${classEntry.room}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(classEntry)}
              className="p-2 rounded-xl bg-[#27272A] hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all"
              title="Edit Class"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(classEntry.id)}
              className="p-2 rounded-xl bg-[#27272A] hover:bg-red-950/60 text-zinc-400 hover:text-red-400 transition-all"
              title="Delete Class"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-2xl bg-[#18181B] border transition-all shadow-xl space-y-3 ${
      status === 'in_progress'
        ? 'border-[#A3E635] ring-1 ring-[#A3E635]/30'
        : status === 'starting_soon'
        ? 'border-[#FBBF24] ring-1 ring-[#FBBF24]/30'
        : status === 'past'
        ? 'border-[#3F3F46] opacity-60'
        : 'border-[#3F3F46]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#A3E635]" />
          <span className="text-xs font-extrabold text-[#FAFAFA] font-['Outfit']">
            {classEntry.startTime} – {classEntry.endTime}
          </span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Subject & Location */}
      <div>
        <h4 className="text-base font-extrabold text-[#FAFAFA] font-['Outfit']">
          {classEntry.subject}
        </h4>
        <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA] mt-1 font-medium">
          <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>{classEntry.buildingId.toUpperCase()}{classEntry.room ? ` · Room ${classEntry.room}` : ''}</span>
        </div>
      </div>

      {/* Walk Time & Leave-by banner */}
      <div className="flex items-center justify-between pt-2 border-t border-[#27272A] text-xs">
        <div className="flex items-center gap-2">
          <Footprints className="w-4 h-4 text-[#A3E635]" />
          <span className="text-zinc-300 font-semibold">
            Walk: {walkMinutes !== null ? <strong className="text-[#A3E635]">{walkMinutes} min</strong> : <span className="animate-pulse text-zinc-500">...</span>}
            {leaveByTimeStr && (
              <span className="ml-2 text-zinc-400 font-medium">
                · Leave by <strong className="text-[#FBBF24]">{leaveByTimeStr}</strong>
              </span>
            )}
          </span>
        </div>

        {onNavigate && status !== 'past' && (
          <button
            onClick={() => onNavigate(classEntry.buildingId)}
            className="py-1.5 px-3 rounded-xl bg-[#A3E635] hover:bg-[#bef264] text-black font-extrabold text-xs shadow-md transition-all flex items-center gap-1"
          >
            <span>NAVIGATE</span>
            <Navigation className="w-3 h-3 fill-current" />
          </button>
        )}
      </div>
    </div>
  );
};
