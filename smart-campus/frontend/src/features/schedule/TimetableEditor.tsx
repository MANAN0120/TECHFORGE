import React, { useState, useEffect } from 'react';
import { Plus, X, Building2, Clock, BookOpen, MapPin, Save, AlertCircle } from 'lucide-react';
import { ClassEntry, DayOfWeek } from './types';
import { ClassCard } from './ClassCard';
import { api } from '../../services/api';
import { Building } from '../../types/campus';

interface TimetableEditorProps {
  classes: ClassEntry[];
  onAddClass: (entry: Omit<ClassEntry, 'id'>) => void;
  onUpdateClass: (id: string, updates: Partial<ClassEntry>) => void;
  onRemoveClass: (id: string) => void;
}

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

export const TimetableEditor: React.FC<TimetableEditorProps> = ({
  classes,
  onAddClass,
  onUpdateClass,
  onRemoveClass,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('mon');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassEntry | null>(null);

  // Form State
  const [subject, setSubject] = useState('');
  const [day, setDay] = useState<DayOfWeek>('mon');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [buildingId, setBuildingId] = useState('block-b2');
  const [room, setRoom] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Buildings list for picker
  const [buildings, setBuildings] = useState<Building[]>([]);

  useEffect(() => {
    api.getBuildings('cu-gharaun').then((res) => {
      setBuildings(res.buildings || []);
    }).catch((err) => console.warn('Failed to load buildings for schedule picker:', err));
  }, []);

  const openAddModal = () => {
    setEditingClass(null);
    setSubject('');
    setDay(selectedDay);
    setStartTime('09:00');
    setEndTime('10:00');
    setBuildingId(buildings.length > 0 ? buildings[0].id : 'block-b2');
    setRoom('');
    setNotes('');
    setValidationError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (entry: ClassEntry) => {
    setEditingClass(entry);
    setSubject(entry.subject);
    setDay(entry.day);
    setStartTime(entry.startTime);
    setEndTime(entry.endTime);
    setBuildingId(entry.buildingId);
    setRoom(entry.room || '');
    setNotes(entry.notes || '');
    setValidationError(null);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!subject.trim()) {
      setValidationError('Subject name cannot be empty.');
      return;
    }
    if (!buildingId) {
      setValidationError('Please select a campus building.');
      return;
    }
    if (startTime >= endTime) {
      setValidationError('Start time must be before End time.');
      return;
    }

    if (editingClass) {
      onUpdateClass(editingClass.id, {
        subject: subject.trim(),
        day,
        startTime,
        endTime,
        buildingId,
        room: room.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      onAddClass({
        subject: subject.trim(),
        day,
        startTime,
        endTime,
        buildingId,
        room: room.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const dayClasses = classes
    .filter((c) => c.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Day Selector Tabs */}
      <div className="flex items-center justify-between gap-1 p-1.5 rounded-2xl bg-[#18181B] border border-[#3F3F46] overflow-x-auto">
        {DAYS.map(({ key, label }) => {
          const count = classes.filter((c) => c.day === key).length;
          return (
            <button
              key={key}
              onClick={() => setSelectedDay(key)}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 min-w-[44px] ${
                selectedDay === key
                  ? 'bg-[#A3E635] text-black shadow-md shadow-[#A3E635]/20'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]'
              }`}
            >
              <span>{label}</span>
              <span className={`text-[9px] font-extrabold ${selectedDay === key ? 'text-black' : 'text-zinc-500'}`}>
                {count > 0 ? `${count} cls` : '-'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Classes List */}
      <div className="space-y-3">
        {dayClasses.length > 0 ? (
          dayClasses.map((cls) => (
            <ClassCard
              key={cls.id}
              classEntry={cls}
              mode="editor"
              onEdit={openEditModal}
              onDelete={onRemoveClass}
            />
          ))
        ) : (
          <div className="p-8 text-center border-2 border-dashed border-[#3F3F46] rounded-2xl bg-[#18181B]/50 space-y-2">
            <BookOpen className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-400 font-medium">No classes scheduled for {DAYS.find((d) => d.key === selectedDay)?.label}.</p>
          </div>
        )}
      </div>

      {/* Add Class Button */}
      <button
        onClick={openAddModal}
        className="w-full py-3.5 px-4 rounded-2xl bg-[#A3E635] hover:bg-[#bef264] text-black font-extrabold text-xs shadow-lg shadow-[#A3E635]/20 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        <span>ADD CLASS FOR {DAYS.find((d) => d.key === selectedDay)?.label.toUpperCase()}</span>
      </button>

      {/* Add / Edit Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-[#18181B] border border-[#3F3F46] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-extrabold text-[#FAFAFA] font-['Outfit']">
                {editingClass ? 'Edit Class' : 'Add New Class'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {validationError && (
              <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              {/* Subject */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Subject Name *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. CS201 — Data Structures"
                  className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-3 py-2 text-[#FAFAFA] outline-none focus:ring-2 focus:ring-[#A3E635]/50 font-medium"
                />
              </div>

              {/* Day & Times Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Day</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value as DayOfWeek)}
                    className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-2 py-2 text-[#FAFAFA] outline-none font-medium cursor-pointer"
                  >
                    {DAYS.map((d) => (
                      <option key={d.key} value={d.key} className="bg-[#18181B]">
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Start Time *</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-2 py-2 text-[#FAFAFA] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">End Time *</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-2 py-2 text-[#FAFAFA] outline-none font-medium"
                  />
                </div>
              </div>

              {/* Building Selector */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Building / Block *</label>
                <div className="relative">
                  <select
                    value={buildingId}
                    onChange={(e) => setBuildingId(e.target.value)}
                    className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-3 py-2 text-[#FAFAFA] outline-none font-medium cursor-pointer"
                  >
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id} className="bg-[#18181B]">
                        {b.name} ({b.short_name || b.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Room & Notes */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Room No (Optional)</label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. B2-204"
                    className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-3 py-2 text-[#FAFAFA] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Notes (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Bring lab file"
                    className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-3 py-2 text-[#FAFAFA] outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#27272A] hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-[#A3E635] hover:bg-[#bef264] text-black font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{editingClass ? 'Update Class' : 'Save Class'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
