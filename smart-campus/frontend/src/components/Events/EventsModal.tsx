import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Camera, Plus, X, Upload, CheckCircle2 } from 'lucide-react';
import { CampusEvent } from '../../types/campus';
import { api } from '../../services/api';

interface EventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTo: (destinationId: string) => void;
}

export const EventsModal: React.FC<EventsModalProps> = ({ isOpen, onClose, onNavigateTo }) => {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploaderName, setUploaderName] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadEvents();
    }
  }, [isOpen]);

  const loadEvents = async () => {
    try {
      const data = await api.getEvents('cu-gharaun');
      setEvents(data.events || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  };

  const handleUploadPhoto = async (eventId: string) => {
    if (!uploadFile) return;
    try {
      await api.uploadEventPhoto(eventId, uploadFile, uploaderName || 'Anonymous');
      setUploadSuccess(true);
      setTimeout(() => {
        setIsUploading(null);
        setUploadFile(null);
        setUploadSuccess(false);
        loadEvents();
      }, 1500);
    } catch (err) {
      console.error('Photo upload failed:', err);
    }
  };

  if (!isOpen) return null;

  const categories = ['all', 'tech', 'cultural', 'sports', 'workshop', 'hackathon'];
  const filteredEvents = selectedCategory === 'all'
    ? events
    : events.filter((e) => e.category.toLowerCase().includes(selectedCategory));

  return (
    <div className="fixed inset-0 z-[1002] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-2xl max-h-[85vh] rounded-3xl p-6 shadow-2xl border border-zinc-700/60 flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit']">Campus Events</h2>
              <p className="text-xs text-zinc-400">Live fests, tech talks, workshops, and student photos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {ev.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      ev.status === 'ongoing' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {ev.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">{ev.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{ev.description}</p>
                </div>

                <button
                  onClick={() => {
                    onNavigateTo(ev.building_id || ev.id);
                    onClose();
                  }}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-[#A3E635] hover:bg-[#bef264] text-black text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Navigate</span>
                </button>
              </div>

              {/* Event Details */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#A3E635]" />
                  <span>{ev.venue_name || 'Campus Venue'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>{new Date(ev.starts_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Live Photo Gallery & Upload */}
              <div className="pt-2 border-t border-zinc-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Live Photos ({ev.photos?.length || 0})</span>
                  </span>
                  <button
                    onClick={() => setIsUploading(ev.id)}
                    className="text-xs font-bold text-[#A3E635] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Photo</span>
                  </button>
                </div>

                {/* Photos stream */}
                {ev.photos && ev.photos.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {ev.photos.map((p) => (
                      <img
                        key={p.id}
                        src={p.url}
                        alt="Event live"
                        className="w-20 h-20 object-cover rounded-xl border border-zinc-700 shrink-0"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Photo Upload Modal Inner */}
              {isUploading === ev.id && (
                <div className="p-3 rounded-xl bg-zinc-800/90 border border-zinc-700 space-y-2.5 animate-in fade-in">
                  <p className="text-xs font-bold text-white">Upload a live photo for {ev.title}</p>
                  <input
                    type="text"
                    placeholder="Your Name (Optional)"
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    className="w-full glass-input px-3 py-1.5 rounded-lg text-xs"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:bg-zinc-700 file:text-white"
                  />
                  <div className="flex items-center gap-2 justify-end pt-1">
                    <button
                      onClick={() => setIsUploading(null)}
                      className="px-3 py-1 rounded-lg bg-zinc-700 text-xs text-zinc-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUploadPhoto(ev.id)}
                      disabled={!uploadFile}
                      className="px-3 py-1 rounded-lg bg-[#A3E635] text-black text-xs font-bold disabled:opacity-50 flex items-center gap-1"
                    >
                      {uploadSuccess ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Uploaded!</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
