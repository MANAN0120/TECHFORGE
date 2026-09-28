import { Timetable, ClassEntry } from './types';
import { generateId, saveTimetable } from './storage';

export const SAMPLE_CLASSES: Omit<ClassEntry, 'id'>[] = [
  { day: 'mon', startTime: '09:00', endTime: '10:00', subject: 'CS201 — Data Structures', buildingId: 'block-b2', room: 'B2-204' },
  { day: 'mon', startTime: '11:00', endTime: '12:00', subject: 'MA101 — Linear Algebra', buildingId: 'block-c1', room: 'C1-102' },
  { day: 'mon', startTime: '14:00', endTime: '16:00', subject: 'CS201 Lab', buildingId: 'block-d2', room: 'D2-Lab-3' },
  { day: 'mon', startTime: '16:30', endTime: '17:30', subject: 'PHY101 — Physics', buildingId: 'block-a1', room: 'A1-Auditorium' },
  { day: 'tue', startTime: '09:30', endTime: '10:30', subject: 'EE102 — Electrical Science', buildingId: 'block-b1', room: 'B1-301' },
  { day: 'tue', startTime: '11:30', endTime: '13:00', subject: 'CS202 — Object Oriented Programming', buildingId: 'block-a1', room: 'A1-205' },
  { day: 'wed', startTime: '10:00', endTime: '11:30', subject: 'HU101 — Technical Communication', buildingId: 'block-c2', room: 'C2-105' },
  { day: 'wed', startTime: '14:00', endTime: '15:30', subject: 'CS203 — Database Management', buildingId: 'block-b2', room: 'B2-401' },
  { day: 'thu', startTime: '09:00', endTime: '10:30', subject: 'CS204 — Operating Systems', buildingId: 'block-b2', room: 'B2-202' },
  { day: 'thu', startTime: '11:00', endTime: '12:30', subject: 'EC201 — Digital Electronics', buildingId: 'block-d1', room: 'D1-104' },
  { day: 'fri', startTime: '09:00', endTime: '10:30', subject: 'CS205 — Computer Networks', buildingId: 'block-a1', room: 'A1-103' },
  { day: 'fri', startTime: '11:30', endTime: '13:00', subject: 'CS205 Lab', buildingId: 'block-d2', room: 'D2-Lab-1' },
];

export function seedSampleTimetable(): Timetable {
  const seededClasses: ClassEntry[] = SAMPLE_CLASSES.map((cls) => ({
    ...cls,
    id: generateId(),
  }));

  const sampleTimetable: Timetable = {
    version: 1,
    classes: seededClasses,
    notificationsEnabled: true,
    leadTimeMinutes: 15,
    lastUpdated: new Date().toISOString(),
  };

  saveTimetable(sampleTimetable);
  return sampleTimetable;
}
