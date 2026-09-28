import { useState, useEffect, useCallback } from 'react';
import { ScheduleSettings } from './types';
import { loadSettings, saveSettings } from './storage';

export function useScheduleSettings() {
  const [settings, setSettings] = useState<ScheduleSettings>(() => loadSettings());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<ScheduleSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  return { settings, updateSettings };
}
