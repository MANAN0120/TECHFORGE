import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, LocateFixed, X, Building2, Store } from 'lucide-react';
import { PersonLocation } from '../../types/meetup';
import { api } from '../../services/api';
import { SearchItem } from '../../types/campus';

interface LocationInputProps {
  label: string;
  value: PersonLocation | null;
  onChange: (loc: PersonLocation) => void;
  placeholder?: string;
  allowGPS?: boolean;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Search building, POI, or landmark...',
  allowGPS = true,
}) => {
  const [query, setQuery] = useState(value?.label || '');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value?.label) {
      setQuery(value.label);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim() || query === value?.label) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await api.search(query.trim(), 'cu-gharaun');
        setResults((data.results || []).slice(0, 5));
        setIsOpen(true);
      } catch (err) {
        console.error('Location search failed:', err);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, value]);

  const handleUseGPS = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const loc: PersonLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: 'My Live GPS Location',
        };
        setQuery('My Live GPS Location');
        onChange(loc);
        setIsOpen(false);
      },
      (err) => {
        setIsLocating(false);
        console.warn('GPS location access error:', err.message);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const handleSelectResult = (item: SearchItem) => {
    if (item.lat && item.lng) {
      const loc: PersonLocation = {
        lat: item.lat,
        lng: item.lng,
        label: item.title,
      };
      setQuery(item.title);
      onChange(loc);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    onChange({ lat: 30.76858, lng: 76.57386, label: '' });
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-zinc-300">{label}</label>
        {allowGPS && (
          <button
            type="button"
            onClick={handleUseGPS}
            disabled={isLocating}
            className="text-[11px] text-[#A3E635] hover:underline font-bold flex items-center gap-1 transition-colors"
          >
            <LocateFixed className="w-3 h-3" />
            <span>{isLocating ? 'Locating...' : 'Use my location'}</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 bg-[#18181B] border border-[#3F3F46] px-3 py-2 rounded-xl focus-within:ring-2 focus-within:ring-[#A3E635]/50 transition-all">
        <MapPin className="w-4 h-4 text-[#A3E635] shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value) handleClear();
          }}
          onFocus={() => query.trim() && setResults.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none text-xs text-[#FAFAFA] placeholder:text-zinc-500 font-medium"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-[1100] bg-[#18181B] border border-[#3F3F46] rounded-xl shadow-2xl overflow-hidden divide-y divide-zinc-800/80">
          {results.map((item) => (
            <button
              type="button"
              key={`${item.type}-${item.id}`}
              onClick={() => handleSelectResult(item)}
              className="w-full p-2.5 hover:bg-[#27272A] text-left flex items-center gap-2.5 transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700/50 shrink-0 text-[#A3E635]">
                {item.type === 'building' ? <Building2 className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#FAFAFA] truncate">{item.title}</p>
                <p className="text-[10px] text-zinc-400 truncate">{item.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
