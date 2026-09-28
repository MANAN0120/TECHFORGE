import React from 'react';
import { 
  Building2, 
  MapPin, 
  Layers, 
  DoorOpen, 
  Accessibility, 
  Navigation, 
  X, 
  BookOpen, 
  CheckCircle2 
} from 'lucide-react';
import { Building } from '../../types/campus';

interface BuildingDetailModalProps {
  building: Building | null;
  onClose: () => void;
  onNavigateTo: (buildingId: string) => void;
}

export const BuildingDetailModal: React.FC<BuildingDetailModalProps> = ({
  building,
  onClose,
  onNavigateTo,
}) => {
  if (!building) return null;

  return (
    <div className="fixed inset-0 z-[1002] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4">
      <div className="glass-panel w-full sm:max-w-lg max-h-[92vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-zinc-700/60 flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 pb-20 sm:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#A3E635]/20 text-[#A3E635] flex items-center justify-center font-black text-xl font-['Outfit'] shadow-md shadow-[#A3E635]/20">
              {building.short_name || 'B'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white font-['Outfit']">{building.name}</h2>
                {building.verified && (
                  <span title="Verified Campus Building">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 capitalize">{building.category} Block • {building.floors} Floors</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Description */}
          <div>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
              Overview
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed">{building.description}</p>
          </div>

          {/* Accessibility Highlights */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Accessibility className="w-4 h-4 text-blue-400" />
              <span>Accessibility & Inclusivity</span>
            </span>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className={`p-2 rounded-xl text-center text-xs font-semibold ${
                building.accessibility?.has_ramp ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40' : 'bg-zinc-850 text-zinc-500'
              }`}>
                {building.accessibility?.has_ramp ? '✓ Wheelchair Ramp' : '✕ No Ramp'}
              </div>
              <div className={`p-2 rounded-xl text-center text-xs font-semibold ${
                building.accessibility?.has_elevator ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40' : 'bg-zinc-850 text-zinc-500'
              }`}>
                {building.accessibility?.has_elevator ? '✓ Elevators' : '✕ No Elevator'}
              </div>
              <div className={`p-2 rounded-xl text-center text-xs font-semibold ${
                building.accessibility?.accessible_entrance ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40' : 'bg-zinc-850 text-zinc-500'
              }`}>
                {building.accessibility?.accessible_entrance ? '✓ Step-Free Entry' : '✕ Standard Entry'}
              </div>
            </div>
          </div>

          {/* Entrances */}
          {building.entrances && building.entrances.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">
                Gates & Entrances ({building.entrances.length})
              </span>
              <div className="space-y-1.5">
                {building.entrances.map((e) => (
                  <div
                    key={e.id}
                    className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <DoorOpen className="w-4 h-4 text-[#A3E635]" />
                      <span className="text-zinc-200 font-medium">Entrance ID: {e.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {e.is_primary && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                          PRIMARY
                        </span>
                      )}
                      {e.accessible && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                          ACCESSIBLE
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Departments */}
          {building.departments && building.departments.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">
                Departments & Academic Units
              </span>
              <div className="flex flex-wrap gap-1.5">
                {building.departments.map((d) => (
                  <span
                    key={d}
                    className="px-2.5 py-1 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{d}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="pt-4 border-t border-zinc-800">
          <button
            onClick={() => {
              onNavigateTo(building.id);
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#A3E635] to-[#84cc16] hover:brightness-110 active:scale-[0.98] text-black font-bold text-sm shadow-xl shadow-[#A3E635]/25 transition-all flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4 fill-current" />
            <span>Navigate to this Building</span>
          </button>
        </div>
      </div>
    </div>
  );
};
