import React, { useState } from 'react';
import { Users, Accessibility, Sparkles, AlertTriangle, Loader2, Plus, Trash2, ShieldCheck, EyeOff } from 'lucide-react';
import { LocationInput } from './LocationInput';
import { SuggestionCard } from './SuggestionCard';
import { useMeetupSuggestions } from './useMeetupSuggestions';
import { PersonLocation, MeetupSuggestion } from '../../types/meetup';

interface MeetupPanelProps {
  onSelectSuggestion: (suggestion: MeetupSuggestion, participants: PersonLocation[]) => void;
}

export const MeetupPanel: React.FC<MeetupPanelProps> = ({ onSelectSuggestion }) => {
  const [participants, setParticipants] = useState<PersonLocation[]>([
    { lat: 30.7695, lng: 76.5748, label: 'You (A1 Block)' },
    { lat: 30.7674, lng: 76.5740, label: 'Alex (D6 Hub)' },
  ]);
  const [accessible, setAccessible] = useState<boolean>(false);
  const [preferLowCrowd, setPreferLowCrowd] = useState<boolean>(false);
  const [radius, setRadius] = useState<number>(500);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);

  const { loading, suggestions, error, suggest } = useMeetupSuggestions();

  const handleUpdateParticipant = (index: number, loc: PersonLocation) => {
    const updated = [...participants];
    updated[index] = loc;
    setParticipants(updated);
  };

  const handleAddFriend = () => {
    if (participants.length >= 8) return;
    setParticipants([
      ...participants,
      {
        lat: 30.76858 + (participants.length * 0.0005),
        lng: 76.57386 + (participants.length * 0.0005),
        label: `Friend ${participants.length}`,
      },
    ]);
  };

  const handleRemoveFriend = (index: number) => {
    if (participants.length <= 2) return;
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleFindMeetup = () => {
    if (participants.some((p) => !p.lat || !p.lng)) return;
    suggest({
      campus_id: 'cu-gharaun',
      participants,
      accessible,
      prefer_low_crowd: preferLowCrowd,
      max_radius_meters: radius,
      limit: 3,
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-[#18181B] border border-[#3F3F46] rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#A3E635]/20 text-[#A3E635]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#FAFAFA] font-['Outfit']">
              Group Meetup Finder
            </h2>
            <p className="text-xs text-zinc-400">
              Find a common equidistant meeting spot for {participants.length} friends
            </p>
          </div>
        </div>

        {/* Add Friend Button */}
        {participants.length < 8 && (
          <button
            type="button"
            onClick={handleAddFriend}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#27272A] hover:bg-zinc-700 text-[#A3E635] font-bold text-xs border border-zinc-700 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Friend</span>
          </button>
        )}
      </div>

      {/* Dynamic Participants Locations Form */}
      <div className="space-y-3.5">
        {participants.map((p, idx) => (
          <div key={idx} className="relative bg-[#27272A]/50 p-3 rounded-2xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#A3E635]">
                {idx === 0 ? '📍 You (Host)' : `👥 Participant ${idx + 1}`}
              </span>
              {idx >= 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveFriend(idx)}
                  className="text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1 p-1 hover:bg-red-950/40 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            <LocationInput
              label=""
              value={p}
              onChange={(loc) => handleUpdateParticipant(idx, loc)}
              placeholder={idx === 0 ? 'Search your location or use GPS...' : `Search Friend ${idx + 1}'s location...`}
              allowGPS={idx === 0}
            />
          </div>
        ))}

        {/* Preferences: Low Crowd / Accessible / Radius */}
        <div className="p-3.5 rounded-2xl bg-[#27272A]/80 border border-zinc-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Low Crowd Preference Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={preferLowCrowd}
                onChange={(e) => setPreferLowCrowd(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-[#A3E635] focus:ring-[#A3E635]"
              />
              <span className="text-xs text-zinc-300 font-semibold flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Prefer Less Crowded / Quiet Public Spot</span>
              </span>
            </label>

            {/* Step-free Accessible */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={accessible}
                onChange={(e) => setAccessible(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-[#A3E635] focus:ring-[#A3E635]"
              />
              <span className="text-xs text-zinc-300 font-semibold flex items-center gap-1.5">
                <Accessibility className="w-3.5 h-3.5 text-blue-400" />
                <span>Step-Free Accessible</span>
              </span>
            </label>
          </div>

          {/* Radius Selector */}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
            <span className="text-xs font-semibold text-zinc-400">Search Radius:</span>
            <div className="flex items-center gap-1.5">
              {[400, 600, 800].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadius(r)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    radius === r
                      ? 'bg-[#A3E635] text-black shadow-md shadow-[#A3E635]/25'
                      : 'bg-[#18181B] text-zinc-400 hover:text-white border border-zinc-700'
                  }`}
                >
                  {r}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Action Button */}
        <button
          type="button"
          onClick={handleFindMeetup}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#A3E635] to-[#84cc16] hover:brightness-110 active:scale-[0.99] text-black font-extrabold text-sm shadow-xl shadow-[#A3E635]/20 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>Computing group centroid & best routes...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-current text-black" />
              <span>FIND GROUP MEETUP POINT</span>
            </>
          )}
        </button>
      </div>

      {/* Error / Warning Alert */}
      {error && (
        <div className="p-3 rounded-2xl bg-[#27272A] border border-[#FBBF24]/50 text-[#FBBF24] text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#FBBF24]" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-4 rounded-2xl bg-[#27272A] border border-zinc-800 animate-pulse h-28 flex flex-col justify-between">
              <div className="w-1/2 h-4 bg-zinc-700 rounded-md"></div>
              <div className="w-3/4 h-3 bg-zinc-700/60 rounded-md"></div>
              <div className="w-full h-8 bg-zinc-700/40 rounded-xl"></div>
            </div>
          ))}
        </div>
      )}

      {/* Results List */}
      {!loading && suggestions.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Top Group Meetup Spots
            </h3>
            <span className="text-[11px] text-[#A3E635] font-semibold">
              {suggestions.length} Locations Found
            </span>
          </div>

          <div className="space-y-3">
            {suggestions.map((spot, idx) => (
              <SuggestionCard
                key={spot.poi_id}
                suggestion={spot}
                index={idx}
                isSelected={selectedSpotId === spot.poi_id}
                onSelect={(selected) => {
                  setSelectedSpotId(selected.poi_id);
                  onSelectSuggestion(selected, participants);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && suggestions.length === 0 && !error && (
        <div className="p-8 text-center border-2 border-dashed border-[#3F3F46] rounded-2xl bg-[#27272A]/40 flex flex-col items-center justify-center space-y-2">
          <div className="p-3 rounded-full bg-[#27272A] text-zinc-400">
            <Users className="w-8 h-8 text-zinc-500" />
          </div>
          <h4 className="text-sm font-extrabold text-[#FAFAFA] font-['Outfit']">
            Find the common spot for your group
          </h4>
          <p className="text-xs text-zinc-400 max-w-sm">
            Add your friends' locations above to calculate a central, public or low-crowd meeting spot for everyone!
          </p>
        </div>
      )}
    </div>
  );
};
