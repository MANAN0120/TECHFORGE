import React, { useState, useEffect } from 'react';
import { Layers, X, RotateCcw } from 'lucide-react';
import { useMapLayers } from './useMapLayers';
import { LayerToggleRow } from './LayerToggleRow';

export const MobileLayerButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { visibleLayers, enabled, counts, activeCount, toggle, reset } = useMapLayers();

  // Close bottom sheet on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Mobile Floating Trigger Button (md:hidden) */}
      <div className="md:hidden absolute left-4 bottom-24 z-[1000]">
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-12 h-12 rounded-full bg-[#18181B] border border-[#3F3F46] flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
          title="Map Layers & Filters"
        >
          <Layers className="w-5 h-5 text-[#A3E635] animate-pulse" />
          <span className="absolute -top-1 -right-1 bg-[#A3E635] text-black text-[10px] font-extrabold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center border-2 border-[#09090B]">
            {activeCount}
          </span>
        </button>
      </div>

      {/* Mobile Bottom Sheet Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[1100] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Backdrop Click */}
          <div className="flex-1" onClick={() => setIsOpen(false)} />

          {/* Bottom Sheet Container */}
          <div className="w-full max-h-[70vh] rounded-t-3xl bg-[#18181B] border-t border-[#3F3F46] p-5 shadow-2xl flex flex-col gap-3 animate-in slide-in-from-bottom duration-250">
            {/* Grab Handle */}
            <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-1" />

            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#A3E635]" />
                <h3 className="text-base font-extrabold text-white font-['Outfit']">Map Layers</h3>
                <span className="text-xs text-zinc-400">({activeCount} Active)</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Rows */}
            <div className="overflow-y-auto space-y-1 py-1 max-h-[48vh]">
              {visibleLayers.map((layer) => (
                <LayerToggleRow
                  key={layer.id}
                  layer={layer}
                  enabled={!!enabled[layer.id]}
                  count={counts[layer.id] || 0}
                  onToggle={() => toggle(layer.id)}
                />
              ))}
            </div>

            {/* Reset Button Footer */}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
              <button
                onClick={reset}
                className="text-xs text-zinc-400 hover:text-[#A3E635] font-semibold flex items-center gap-1.5 py-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to defaults</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="py-2 px-5 rounded-xl bg-[#A3E635] text-black font-extrabold text-xs shadow-md shadow-[#A3E635]/20"
              >
                Apply Layers
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
