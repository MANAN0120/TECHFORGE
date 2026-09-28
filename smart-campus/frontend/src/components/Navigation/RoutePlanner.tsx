import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  ArrowUpDown, 
  Footprints, 
  Accessibility, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  X, 
  CornerDownRight, 
  CornerDownLeft, 
  ArrowUp, 
  CheckCircle2, 
  Building,
  LocateFixed,
  Radio
} from 'lucide-react';
import { Building as BuildingType, RouteData, TurnStep } from '../../types/campus';
import { api } from '../../services/api';

interface RoutePlannerProps {
  buildings: BuildingType[];
  prefilledDestination: string | null;
  activeRoute: RouteData | null;
  setActiveRoute: (route: RouteData | null) => void;
  accessibleMode: boolean;
  setAccessibleMode: (mode: boolean) => void;
  onClose: () => void;
  userLocation: { lat: number; lng: number } | null;
  onUpdateUserLocation: (loc: { lat: number; lng: number }) => void;
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({
  buildings,
  prefilledDestination,
  activeRoute,
  setActiveRoute,
  accessibleMode,
  setAccessibleMode,
  onClose,
  userLocation,
  onUpdateUserLocation,
}) => {
  const [origin, setOrigin] = useState<string>('my-location');
  const [destination, setDestination] = useState<string>('block-a1');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'success' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fetch user live location on mount or when opening route planner
  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  useEffect(() => {
    if (prefilledDestination) {
      setDestination(prefilledDestination);
    }
  }, [prefilledDestination]);

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setOrigin('main-gate');
      return;
    }

    setIsLocating(true);
    setGpsStatus('locating');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        onUpdateUserLocation(coords);
        setGpsStatus('success');
        setIsLocating(false);
        setOrigin('my-location');
      },
      (err) => {
        console.warn('Geolocation access issue:', err.message);
        setGpsStatus('error');
        setIsLocating(false);
        // Fallback default: Main Gate if user denies GPS or outside
        if (origin === 'my-location') {
          setOrigin('main-gate');
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  };

  const handleCalculateRoute = async () => {
    if (!origin || !destination) return;
    if (origin === destination && origin !== 'my-location') {
      setError('Origin and destination cannot be the same location.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const mode = accessibleMode ? 'accessible' : 'walk';
      let origParam: string | null = origin;
      let origCoords: { lat: number; lng: number } | null = null;

      if (origin === 'my-location') {
        if (userLocation) {
          origParam = null;
          origCoords = userLocation;
        } else {
          // If GPS wasn't ready yet, fallback to main-gate
          origParam = 'main-gate';
        }
      }

      const result = await api.calculateRoute(
        origParam,
        destination,
        mode,
        origCoords,
        null,
        'cu-gharaun'
      );

      if (!result.found) {
        setError(result.message || 'No available path found to this destination.');
        setActiveRoute(null);
      } else {
        setActiveRoute(result);
      }
    } catch (err) {
      console.error('Routing failed:', err);
      setError('Unable to compute route at this time.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const getStepIcon = (action: string, floorChange?: string) => {
    if (floorChange) {
      return <Building className="w-4 h-4 text-amber-400" />;
    }
    switch (action) {
      case 'turn_left':
        return <CornerDownLeft className="w-4 h-4 text-blue-400" />;
      case 'turn_right':
        return <CornerDownRight className="w-4 h-4 text-blue-400" />;
      case 'arrive':
        return <CheckCircle2 className="w-4 h-4 text-[#A3E635]" />;
      default:
        return <ArrowUp className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="absolute top-20 left-4 z-[999] w-full max-w-md glass-panel rounded-3xl p-4 shadow-2xl border border-zinc-700/60 max-h-[85vh] flex flex-col animate-in fade-in slide-in-from-left-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#A3E635]/20 text-[#A3E635]">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit']">Turn-by-Turn Navigation</h3>
            <p className="text-[11px] text-zinc-400">Live GPS & official campus walkways</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* GPS Live Status Bar */}
      <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          <Radio className={`w-3.5 h-3.5 ${gpsStatus === 'success' ? 'text-blue-400 animate-pulse' : gpsStatus === 'locating' ? 'text-amber-400 animate-spin' : 'text-zinc-500'}`} />
          <span className="text-zinc-300">
            {gpsStatus === 'locating'
              ? 'Detecting your real-time GPS location...'
              : gpsStatus === 'success'
              ? 'Live GPS Location Locked'
              : 'GPS offline (using campus starting points)'}
          </span>
        </div>
        <button
          onClick={fetchCurrentLocation}
          disabled={isLocating}
          className="text-[#A3E635] hover:underline font-bold flex items-center gap-1"
        >
          <LocateFixed className="w-3 h-3" />
          <span>{isLocating ? 'Locating...' : 'Refetch'}</span>
        </button>
      </div>

      {/* Inputs Form */}
      <div className="mt-3 space-y-2.5">
        {/* Origin Selector */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-zinc-400">Starting From</label>
            <button
              onClick={() => {
                setOrigin('my-location');
                fetchCurrentLocation();
              }}
              className="text-[11px] text-[#A3E635] font-bold hover:underline flex items-center gap-1"
            >
              <LocateFixed className="w-3 h-3" />
              <span>Use My Location</span>
            </button>
          </div>
          <div className="flex items-center gap-2 glass-input px-3 py-2 rounded-xl">
            <MapPin className={`w-4 h-4 shrink-0 ${origin === 'my-location' ? 'text-blue-400 animate-pulse' : 'text-[#A3E635]'}`} />
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs text-white cursor-pointer"
            >
              <option value="my-location" className="bg-zinc-900 text-blue-400 font-bold">
                📍 My Current Live Location {userLocation ? `(${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})` : ''}
              </option>
              {buildings.map((b) => (
                <option key={`orig-${b.id}`} value={b.id} className="bg-zinc-900 text-white">
                  {b.name} ({b.short_name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-1">
          <button
            onClick={handleSwap}
            className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-[#A3E635] transition-all border border-zinc-700 shadow-md"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination Selector */}
        <div className="relative">
          <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Destination</label>
          <div className="flex items-center gap-2 glass-input px-3 py-2 rounded-xl">
            <MapPin className="w-4 h-4 text-red-400 shrink-0" />
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs text-white cursor-pointer"
            >
              {buildings.map((b) => (
                <option key={`dest-${b.id}`} value={b.id} className="bg-zinc-900 text-white">
                  {b.name} ({b.short_name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setAccessibleMode(false)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              !accessibleMode
                ? 'bg-[#A3E635] text-black shadow-md shadow-[#A3E635]/20'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>Standard Walk</span>
          </button>

          <button
            onClick={() => setAccessibleMode(true)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              accessibleMode
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
            }`}
          >
            <Accessibility className="w-3.5 h-3.5" />
            <span>Wheelchair / Ramps</span>
          </button>
        </div>

        {/* Calculate Action */}
        <button
          onClick={handleCalculateRoute}
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#A3E635] to-[#84cc16] hover:brightness-110 active:scale-[0.98] text-black font-bold text-xs shadow-lg shadow-[#A3E635]/20 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              <span>Finding Best Route...</span>
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5 fill-current" />
              <span>Get Directions</span>
            </>
          )}
        </button>

        {error && (
          <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Route Result & Step-by-Step Directions */}
      {activeRoute && activeRoute.found && (
        <div className="mt-4 pt-3 border-t border-zinc-800 flex-1 overflow-y-auto space-y-3">
          {/* Summary Stats Card */}
          <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#A3E635]/15 text-[#A3E635]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-white font-['Outfit']">
                  ~{activeRoute.estimated_time_minutes} min walk
                </p>
                <p className="text-[11px] text-zinc-400">
                  {activeRoute.total_distance_meters} meters • {activeRoute.mode.toUpperCase()}
                </p>
              </div>
            </div>

            {activeRoute.is_accessible && (
              <span className="text-[10px] px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">
                Step-Free
              </span>
            )}
          </div>

          {/* Blocked Path Warnings Avoided */}
          {activeRoute.avoided_blocked_paths.length > 0 && (
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-300 text-[11px] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Rerouted around {activeRoute.avoided_blocked_paths.length} blocked segment(s).</span>
            </div>
          )}

          {/* Turn-by-Turn List */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Directions Step-by-Step</p>
            <div className="divide-y divide-zinc-850">
              {activeRoute.steps.map((step: TurnStep) => (
                <div key={step.step_index} className="py-2 flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700/60 mt-0.5">
                    {getStepIcon(step.action, step.floor_change)}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-zinc-200 font-medium">{step.instruction}</p>
                    {step.distance_meters > 0 && (
                      <p className="text-[10px] text-zinc-500 mt-0.5">{step.distance_meters}m</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveRoute(null)}
            className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Clear Route
          </button>
        </div>
      )}
    </div>
  );
};
