import { useState, useEffect, useCallback } from 'react';
import { ClassEntry, Timetable } from './types';
import { loadTimetable, saveTimetable, generateId, DEFAULT_TIMETABLE } from './storage';

export function useTimetable() {
  const [timetable, setTimetable] = useState<Timetable>(() => loadTimetable());

  useEffect(() => {
    saveTimetable(timetable);
  }, [timetable]);

  const addClass = useCallback((entry: Omit<ClassEntry, 'id'>) => {
    const newClass: ClassEntry = {
      ...entry,
      id: generateId(),
    };
    setTimetable((prev) => ({
      ...prev,
      classes: [...prev.classes, newClass],
    }));
  }, []);

  const updateClass = useCallback((id: string, updates: Partial<ClassEntry>) => {
    setTimetable((prev) => ({
      ...prev,
      classes: prev.classes.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, []);

  const removeClass = useCallback((id: string) => {
    setTimetable((prev) => ({
      ...prev,
      classes: prev.classes.filter((c) => c.id !== id),
    }));
  }, []);

  const setEntireTimetable = useCallback((newTimetable: Timetable) => {
    setTimetable(newTimetable);
  }, []);

  const clearAll = useCallback(() => {
    setTimetable(DEFAULT_TIMETABLE);
  }, []);

  return {
    timetable,
    addClass,
    updateClass,
    removeClass,
    setEntireTimetable,
    clearAll,
  };
}
