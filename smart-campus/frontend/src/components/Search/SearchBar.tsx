import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Building2, Store, Calendar, ArrowRight, CreditCard, Utensils, BookOpen, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { SearchItem } from '../../types/campus';

interface SearchBarProps {
  onSelectItem: (item: SearchItem) => void;
  onNavigateTo: (id: string) => void;
}

const CATEGORIES = [
  { id: '', label: 'All' },
  { id: 'academic', label: 'Academic' },
  { id: 'food', label: 'Food & Cafes' },
  { id: 'library', label: 'Library' },
  { id: 'atm', label: 'ATMs' },
  { id: 'event', label: 'Events' },
];

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectItem, onNavigateTo }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // If no query and no category, clear results
    if (!query.trim() && !category) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await api.search(query.trim(), 'cu-gharaun', category || undefined);
        setResults(data.results || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, category]);

  const getItemIcon = (type: string, itemCat?: string) => {
    if (itemCat === 'atm') return <CreditCard className="w-4 h-4 text-emerald-400" />;
    if (itemCat === 'food' || itemCat === 'cafeteria') return <Utensils className="w-4 h-4 text-amber-400" />;
    if (itemCat === 'library') return <BookOpen className="w-4 h-4 text-sky-400" />;
    switch (type) {
      case 'building':
        return <Building2 className="w-4 h-4 text-[#A3E635]" />;
      case 'shop':
        return <Store className="w-4 h-4 text-amber-400" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-purple-400" />;
      default:
        return <MapPin className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div ref={searchRef} className="absolute top-16 lg:top-20 left-3 right-3 sm:left-4 sm:right-auto z-[999] w-auto sm:w-full sm:max-w-md pointer-events-auto">
      {/* Search Input Box */}
      <div className="glass-panel p-2 rounded-2xl shadow-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-[#A3E635]/50 border border-zinc-700/60">
        <div className="flex items-center gap-2 px-3 py-1.5">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => (query.trim() || category) && setIsOpen(true)}
            placeholder={
              category === 'atm'
                ? 'Search ATMs (e.g. SBI, PNB, A Block, Gate 1)...'
                : category === 'food'
                ? 'Search food courts, cafes, thali, juices...'
                : category === 'academic'
                ? 'Search academic blocks, departments, labs...'
                : 'Search buildings, food, ATMs, events, shops...'
            }
            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder:text-zinc-500 font-medium"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                if (!category) setResults([]);
              }}
              className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-1.5 pt-2 px-1 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id || 'all'}
                onClick={() => {
                  const nextCat = isSelected ? '' : cat.id;
                  setCategory(nextCat);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#A3E635] text-black shadow-md shadow-[#A3E635]/30'
                    : 'bg-zinc-800/80 hover:bg-zinc-750 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="mt-2 glass-panel rounded-2xl shadow-2xl overflow-hidden max-h-[380px] overflow-y-auto border border-zinc-700/60 animate-in fade-in slide-in-from-top-2 duration-200">
          {isLoading ? (
            <div className="p-4 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-[#A3E635] border-t-transparent rounded-full animate-spin"></div>
              <span>Searching campus directory...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-zinc-800/60">
              {results.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="p-3 hover:bg-zinc-800/70 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                  onClick={() => {
                    onSelectItem(item);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-xl bg-zinc-800 border border-zinc-700/50 mt-0.5 group-hover:border-[#A3E635]/50 transition-colors shrink-0">
                      {getItemIcon(item.type, item.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white group-hover:text-[#A3E635] transition-colors truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase font-bold tracking-wider shrink-0">
                          {item.category || item.type}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{item.subtitle}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateTo(item.building_id || item.id);
                      setIsOpen(false);
                    }}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-[#A3E635] text-zinc-300 hover:text-black transition-all shrink-0"
                    title="Get Walking Directions"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-zinc-400">
              No matching locations or facilities found. Try another search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
