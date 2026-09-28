import React, { useState, useEffect } from 'react';
import { Calendar, CalendarClock, Settings as SettingsIcon, BookOpen, Sparkles } from 'lucide-react';
import { useTimetable } from '../features/schedule/useTimetable';
import { useScheduleSettings } from '../features/schedule/useScheduleSettings';
import { useScheduleNotifier } from '../features/schedule/useScheduleNotifier';
import { TodaySchedule } from '../features/schedule/TodaySchedule';
import { TimetableEditor } from '../features/schedule/TimetableEditor';
import { ScheduleSettings } from '../features/schedule/ScheduleSettings';
import { NotificationBanner } from '../features/schedule/NotificationBanner';
import { isOnboarded, markOnboarded } from '../features/schedule/onboarding';
import { seedSampleTimetable } from '../features/schedule/seedTimetable';

interface SchedulePageProps {
  userLocation?: { lat: number; lng: number } | null;
  onNavigateToBuilding: (buildingId: string) => void;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({
  userLocation,
  onNavigateToBuilding,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'today' | 'editor' | 'settings'>('today');
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => isOnboarded());

  const { timetable, addClass, updateClass, removeClass, setEntireTimetable, clearAll } = useTimetable();
  const { settings, updateSettings } = useScheduleSettings();

  // Run live schedule notifier interval
  useScheduleNotifier(timetable, settings, updateSettings, userLocation, onNavigateToBuilding);

  // Check URL query params for seed=1 or tab=editor
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('seed') === '1') {
      const sample = seedSampleTimetable();
      setEntireTimetable(sample);
      markOnboarded();
      setHasOnboarded(true);
    }
  }, [setEntireTimetable]);

  const handleStartOnboardingManual = () => {
    markOnboarded();
    setHasOnboarded(true);
    setActiveSubTab('editor');
  };

  const handleStartOnboardingSeed = () => {
    const sample = seedSampleTimetable();
    setEntireTimetable(sample);
    markOnboarded();
    setHasOnboarded(true);
    setActiveSubTab('today');
  };

  // If user has no classes and hasn't onboarded yet
  if (!hasOnboarded && timetable.classes.length === 0) {
    return (
      <div className="w-full h-full relative bg-[#09090B] overflow-y-auto p-4 sm:p-6 pb-24 flex items-center justify-center">
        <NotificationBanner onNavigateToBuilding={onNavigateToBuilding} />

        <div className="w-full max-w-md bg-[#18181B] border border-[#3F3F46] p-6 sm:p-8 rounded-3xl shadow-2xl text-center space-y-5 animate-in fade-in duration-300">
          <div className="p-4 rounded-3xl bg-[#A3E635]/15 text-[#A3E635] w-16 h-16 mx-auto flex items-center justify-center shadow-lg shadow-[#A3E635]/20">
            <CalendarClock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#FAFAFA] font-['Outfit']">
              Set Up Your Class Schedule
            </h2>
            <p className="text-xs text-[#A1A1AA] mt-1.5 leading-relaxed">
              Never be late to lectures again. Get intelligent reminders before every class calculated from real campus walking times.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleStartOnboardingManual}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#A3E635] hover:bg-[#bef264] text-black font-extrabold text-xs shadow-xl shadow-[#A3E635]/20 transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Add Your First Class</span>
            </button>

            <button
              onClick={handleStartOnboardingSeed}
              className="w-full py-3 px-4 rounded-2xl bg-[#27272A] hover:bg-zinc-700 text-[#FAFAFA] font-bold text-xs border border-[#3F3F46] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Load Sample CU Timetable (Demo)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-[#09090B] overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-8 flex flex-col items-center">
      {/* Top Floating In-App Banner Fallback */}
      <NotificationBanner onNavigateToBuilding={onNavigateToBuilding} />

      {/* Sub-Tabs Navigation Header */}
      <div className="w-full max-w-xl flex items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-[#18181B] border border-[#3F3F46] shadow-xl mb-5">
        <button
          onClick={() => setActiveSubTab('today')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'today'
              ? 'bg-[#A3E635] text-black shadow-md shadow-[#A3E635]/20'
              : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Today</span>
        </button>

        <button
          onClick={() => setActiveSubTab('editor')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'editor'
              ? 'bg-[#A3E635] text-black shadow-md shadow-[#A3E635]/20'
              : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Timetable</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'settings'
              ? 'bg-[#A3E635] text-black shadow-md shadow-[#A3E635]/20'
              : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* Sub-Tab Content Views */}
      <div className="w-full flex-1">
        {activeSubTab === 'today' && (
          <TodaySchedule
            timetable={timetable}
            settings={settings}
            userLocation={userLocation}
            onNavigateToBuilding={onNavigateToBuilding}
          />
        )}

        {activeSubTab === 'editor' && (
          <TimetableEditor
            classes={timetable.classes}
            onAddClass={addClass}
            onUpdateClass={updateClass}
            onRemoveClass={removeClass}
          />
        )}

        {activeSubTab === 'settings' && (
          <ScheduleSettings
            settings={settings}
            onUpdateSettings={updateSettings}
            onTimetableUpdate={setEntireTimetable}
            onClearAll={clearAll}
            onNavigateToBuilding={onNavigateToBuilding}
          />
        )}
      </div>
    </div>
  );
};
