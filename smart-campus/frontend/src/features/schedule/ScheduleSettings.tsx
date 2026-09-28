import React, { useState } from 'react';
import { Bell, Clock, ShieldAlert, Volume2, VolumeX, Trash2, CheckCircle2, Sparkles } from 'lucide-react';
import { ScheduleSettings as ScheduleSettingsType, Timetable } from './types';
import { requestNotificationPermission, isNotificationSupported } from './notificationPermission';
import { fireClassNotification } from './useScheduleNotifier';
import { seedSampleTimetable } from './seedTimetable';

interface ScheduleSettingsProps {
  settings: ScheduleSettingsType;
  onUpdateSettings: (updates: Partial<ScheduleSettingsType>) => void;
  onTimetableUpdate: (timetable: Timetable) => void;
  onClearAll: () => void;
  onNavigateToBuilding: (buildingId: string) => void;
}

export const ScheduleSettings: React.FC<ScheduleSettingsProps> = ({
  settings,
  onUpdateSettings,
  onTimetableUpdate,
  onClearAll,
  onNavigateToBuilding,
}) => {
  const [testSuccess, setTestSuccess] = useState(false);
  const [permissionState, setPermissionState] = useState<string>(
    isNotificationSupported() ? Notification.permission : 'denied'
  );

  const handleToggleNotifications = async () => {
    if (!settings.notificationsEnabled) {
      const perm = await requestNotificationPermission();
      setPermissionState(perm);
      onUpdateSettings({ notificationsEnabled: true });
    } else {
      onUpdateSettings({ notificationsEnabled: false });
    }
  };

  const handleTestNotification = () => {
    const sampleClass = {
      id: 'test-class',
      day: 'mon' as const,
      startTime: '09:00',
      endTime: '10:00',
      subject: 'CS201 — Data Structures (Demo Test)',
      buildingId: 'block-b2',
      room: 'B2-204',
    };

    fireClassNotification(sampleClass, 8, new Date(), onNavigateToBuilding);
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 3000);
  };

  const handleSeedSample = () => {
    const sample = seedSampleTimetable();
    onTimetableUpdate(sample);
  };

  const handleConfirmClear = () => {
    if (window.confirm('Are you sure you want to clear all timetable classes and settings? This cannot be undone.')) {
      onClearAll();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-3">
        <h2 className="text-lg sm:text-xl font-extrabold text-[#FAFAFA] font-['Outfit']">
          Schedule Settings
        </h2>
        <p className="text-xs text-[#A1A1AA]">
          Configure lead-time alerts, safety margins, and notification preferences
        </p>
      </div>

      {/* Settings Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#18181B] border border-[#3F3F46] shadow-2xl space-y-5">
        {/* Enable Notifications */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#27272A]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#A3E635]/20 text-[#A3E635]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#FAFAFA] font-['Outfit']">
                Class Reminders
              </h4>
              <p className="text-xs text-[#A1A1AA]">
                Receive notifications before lectures based on walk time
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={handleToggleNotifications}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#27272A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A3E635]"></div>
          </label>
        </div>

        {/* Permission Warning if denied */}
        {settings.notificationsEnabled && permissionState === 'denied' && (
          <div className="p-3 rounded-2xl bg-[#27272A] border border-[#FBBF24]/50 text-[#FBBF24] text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-[#FBBF24]" />
            <span>Browser notifications are blocked. Reminders will display as in-app top banners.</span>
          </div>
        )}

        {/* Lead Time Selector Pills */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#FAFAFA] flex items-center gap-1.5 font-['Outfit']">
            <Clock className="w-4 h-4 text-[#A3E635]" />
            <span>Notification Lead Time</span>
          </label>
          <p className="text-xs text-[#A1A1AA]">How early to notify you before walk time starts</p>
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[10, 15, 20, 30].map((mins) => (
              <button
                key={mins}
                onClick={() => onUpdateSettings({ leadTimeMinutes: mins })}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all ${
                  settings.leadTimeMinutes === mins
                    ? 'bg-[#A3E635] text-black shadow-md shadow-[#A3E635]/20'
                    : 'bg-[#27272A] text-zinc-400 hover:text-white border border-[#3F3F46]'
                }`}
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>

        {/* Buffer Time Slider */}
        <div className="space-y-2 pt-2 border-t border-[#27272A]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#FAFAFA] font-['Outfit']">
              Safety Margin Buffer: <span className="text-[#A3E635]">{settings.bufferMinutes} min</span>
            </label>
          </div>
          <p className="text-xs text-[#A1A1AA]">Extra minutes added to walk time for safety margin</p>
          <input
            type="range"
            min="0"
            max="15"
            step="1"
            value={settings.bufferMinutes}
            onChange={(e) => onUpdateSettings({ bufferMinutes: parseInt(e.target.value, 10) })}
            className="w-full accent-[#A3E635] bg-[#27272A] rounded-lg h-2 cursor-pointer"
          />
        </div>

        {/* Sound Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-[#27272A]">
          <div className="flex items-center gap-2">
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-[#A3E635]" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
            <span className="text-xs font-bold text-[#FAFAFA] font-['Outfit']">Notification Sound Alert</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#27272A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#A3E635]"></div>
          </label>
        </div>
      </div>

      {/* Dev & Demo Actions */}
      <div className="p-4 rounded-3xl bg-[#18181B] border border-[#3F3F46] shadow-xl space-y-3">
        <h4 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">
          Demo & Testing Controls
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Test Notification Button */}
          <button
            onClick={handleTestNotification}
            className="py-2.5 px-3 rounded-xl bg-[#27272A] hover:bg-zinc-700 text-[#FAFAFA] font-bold text-xs border border-[#3F3F46] transition-all flex items-center justify-center gap-2"
          >
            {testSuccess ? <CheckCircle2 className="w-4 h-4 text-[#A3E635]" /> : <Bell className="w-4 h-4 text-[#A3E635]" />}
            <span>{testSuccess ? 'Notification Fired!' : 'Test Notification'}</span>
          </button>

          {/* Seed Sample Timetable Button */}
          <button
            onClick={handleSeedSample}
            className="py-2.5 px-3 rounded-xl bg-[#27272A] hover:bg-zinc-700 text-[#FAFAFA] font-bold text-xs border border-[#3F3F46] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Load Sample CU Timetable</span>
          </button>
        </div>

        {/* Clear All Data */}
        <div className="pt-2 border-t border-[#27272A]">
          <button
            onClick={handleConfirmClear}
            className="w-full py-2.5 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-[#F87171] font-bold text-xs border border-red-900/50 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Timetable & Settings Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
