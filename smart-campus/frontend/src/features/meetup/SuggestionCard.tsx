import React from 'react';
import { Coffee, BookOpen, Dumbbell, Store, Utensils, MapPin, CheckCircle, ChevronRight, Award } from 'lucide-react';
import { MeetupSuggestion } from '../../types/meetup';

interface SuggestionCardProps {
  suggestion: MeetupSuggestion;
  index: number;
  isSelected: boolean;
  onSelect: (suggestion: MeetupSuggestion) => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  index,
  isSelected,
  onSelect,
}) => {
  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('food') || c.includes('cafe')) return <Coffee className="w-5 h-5 text-amber-400" />;
    if (c.includes('library')) return <BookOpen className="w-5 h-5 text-sky-400" />;
    if (c.includes('sports')) return <Dumbbell className="w-5 h-5 text-purple-400" />;
    if (c.includes('shop')) return <Store className="w-5 h-5 text-emerald-400" />;
    return <Utensils className="w-5 h-5 text-[#A3E635]" />;
  };

  const walkMinA = Math.max(1, Math.round(suggestion.walk_time_a / 60));
  const walkMinB = Math.max(1, Math.round(suggestion.walk_time_b / 60));

  const reasonsList = suggestion.reason ? suggestion.reason.split(',').map((r) => r.trim()) : [];

  return (
    <div
      onClick={() => onSelect(suggestion)}
      className={`p-4 rounded-2xl bg-[#18181B] border transition-all duration-200 cursor-pointer shadow-xl relative overflow-hidden ${
        isSelected
          ? 'border-[#A3E635] ring-2 ring-[#A3E635]/40 bg-[#18181B]'
          : index === 0
          ? 'border-[#A3E635]/60 hover:border-[#A3E635]'
          : 'border-[#3F3F46] hover:border-zinc-500'
      }`}
    >
      {/* Top Match Rank Tag */}
      {index === 0 && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-[#A3E635] to-[#84cc16] text-black font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-md">
          <Award className="w-3 h-3 fill-current" />
          <span>Best Match</span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-[#27272A] border border-zinc-700/60 shrink-0 mt-0.5">
          {getCategoryIcon(suggestion.category)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-sm text-[#FAFAFA] font-['Outfit'] truncate">
              {suggestion.name}
            </h4>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            <span className="capitalize font-semibold text-zinc-300">{suggestion.category}</span>
            <span> · {suggestion.distance_a}m from you · {suggestion.distance_b}m from friend</span>
          </p>
        </div>
      </div>

      {/* Walk Time Grid */}
      <div className="mt-3 grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#27272A] border border-zinc-800">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">You</span>
          <span className="text-sm font-extrabold text-[#A3E635] font-['Outfit']">
            {walkMinA} min walk
          </span>
        </div>
        <div className="flex flex-col border-l border-zinc-700/60 pl-2.5">
          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Friend</span>
          <span className="text-sm font-extrabold text-blue-400 font-['Outfit']">
            {walkMinB} min walk
          </span>
        </div>
      </div>

      {/* Reason Badges */}
      {reasonsList.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {reasonsList.map((reason, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-full bg-[#27272A] text-zinc-300 border border-zinc-700 text-[11px] font-semibold flex items-center gap-1.5"
            >
              <CheckCircle className="w-3 h-3 text-[#A3E635]" />
              <span>{reason}</span>
            </span>
          ))}
        </div>
      )}

      {/* Select Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(suggestion);
        }}
        className={`w-full mt-3 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
          isSelected
            ? 'bg-[#A3E635] text-black shadow-lg shadow-[#A3E635]/25'
            : 'bg-zinc-800 hover:bg-[#A3E635] text-zinc-200 hover:text-black border border-zinc-700'
        }`}
      >
        <MapPin className="w-3.5 h-3.5 fill-current" />
        <span>{isSelected ? 'SPOT SELECTED' : 'SELECT THIS SPOT'}</span>
        <ChevronRight className="w-3.5 h-3.5 ml-auto" />
      </button>
    </div>
  );
};
