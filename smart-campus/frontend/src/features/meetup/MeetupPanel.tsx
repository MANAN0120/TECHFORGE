import React, { useState } from 'react';
import { Users, Accessibility, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import { LocationInput } from './LocationInput';
import { SuggestionCard } from './SuggestionCard';
import { useMeetupSuggestions } from './useMeetupSuggestions';
import { PersonLocation, MeetupSuggestion } from '../../types/meetup';

interface MeetupPanelProps {
  onSelectSuggestion: (suggestion: MeetupSuggestion, personA: PersonLocation, personB: PersonLocation) => void;
}

export const MeetupPanel: React.FC<MeetupPanelProps> = ({ onSelectSuggestion }) => {
  const [personA, setPersonA] = useState<PersonLocation>({
    lat: 30.7695,
    lng: 76.5748,
    label: 'Academic Block 1 (A1)',
  });
  const [personB, setPersonB] = useState<PersonLocation>({
    lat: 30.7674,
    lng: 76.5740,
    label: 'D6 Student Hub',
  });
  const [accessible, setAccessible] = useState<boolean>(false);
  const [radius, setRadius] = useState<number>(400);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);

  const { loading, suggestions, error, suggest } = useMeetupSuggestions();

  const handleFindMeetup = () => {
    if (!personA.lat || !personB.lat) return;
    suggest({
      campus_id: 'cu-gharaun',
      person_a: personA,
      person_b: personB,
      accessible,
      max_radius_meters: radius,
      limit: 3,
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-[#18181B] border border-[#3F3F46] rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
        <div className="p-3 rounded-2xl bg-[#A3E635]/20 text-[#A3E635]">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#FAFAFA] font-['Outfit']">
            Find a Meetup Point
          </h2>
          <p className="text-xs text-zinc-400">
            Equidistant, accessible landmark spots for two people on campus
          </p>
        </div>
      </div>

      {/* Locations Form */}
      <div className="space-y-4">
        {/* Person A */}
        <LocationInput
          label="You are starting at"
          value={personA}
          onChange={(loc) => setPersonA(loc)}
          placeholder="Select your location or tap Use my location..."
          allowGPS={true}
        />

        {/* Person B */}
        <LocationInput
          label="Friend is starting at"
          value={personB}
          onChange={(loc) => setPersonB(loc)}
          placeholder="Search friend's building or landmark..."
          allowGPS={false}
        />

        {/* Options: Accessibility & Radius */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Accessible Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={accessible}
              onChange={(e) => setAccessible(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-[#A3E635] focus:ring-[#A3E635]"
            />
            <span className="text-xs text-zinc-300 font-semibold flex items-center gap-1.5">
              <Accessibility className="w-3.5 h-3.5 text-blue-400" />
              <span>Step-Free Accessible Route</span>
            </span>
          </label>

          {/* Radius Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-zinc-400 mr-1">Radius:</span>
            {[400, 600, 800].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadius(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  radius === r
                    ? 'bg-[#A3E635] text-black shadow-md shadow-[#A3E635]/25'
                    : 'bg-[#27272A] text-zinc-400 hover:text-white border border-zinc-700'
                }`}
              >
                {r}m
              </button>
            ))}
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
              <span>Finding best meetup spots...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-current text-black" />
              <span>FIND MEETUP POINT</span>
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
              Top Recommended Meetup Landmarks
            </h3>
            <span className="text-[11px] text-[#A3E635] font-semibold">
              {suggestions.length} Spots Found
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
                  onSelectSuggestion(selected, personA, personB);
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
            Find the perfect spot to meet
          </h4>
          <p className="text-xs text-zinc-400 max-w-sm">
            We'll suggest central campus landmarks that are fair and roughly equidistant for both of you.
          </p>
        </div>
      )}
    </div>
  );
};
