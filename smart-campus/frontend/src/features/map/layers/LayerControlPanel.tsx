import React, { useState, useEffect } from 'react';
import { Layers, ChevronDown, ChevronUp, RotateCcw, Sparkles } from 'lucide-react';
import { useMapLayers } from './useMapLayers';
import { LayerToggleRow } from './LayerToggleRow';
import { MobileLayerButton } from './MobileLayerButton';

export const LayerControlPanel: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const { visibleLayers, enabled, counts, activeCount, toggle, reset } = useMapLayers();

  // Show first visit hint bubble once
  useEffect(() => {
    const hintDismissed = localStorage.getItem('smartcampus.map.hint_dismissed');
    if (!hintDismissed) {
      setShowHint(true);
      const timer = setTimeout(() => {
        setShowHint(false);
        localStorage.setItem('smartcampus.map.hint_dismissed', 'true');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismissHint = () => {
    setShowHint(false);
    localStorage.setItem('smartcampus.map.hint_dismissed', 'true');
  };

  return (
    <>
      {/* Mobile Layer Control Button & Drawer */}
      <MobileLayerButton />

      {/* Desktop Floating Layer Control Panel (hidden on mobile) */}
      <div className="hidden md:block absolute left-6 bottom-6 z-[1000] w-64 bg-[#18181B]/95 border border-[#3F3F46] rounded-2xl p-3 shadow-2xl backdrop-blur-xl pointer-events-auto transition-all">
        {/* First Visit Hint Bubble */}
        {showHint && (
          <div 
            onClick={handleDismissHint}
            className="absolute -top-12 left-0 right-0 bg-[#A3E635] text-black text-xs font-bold py-1.5 px-3 rounded-xl shadow-lg flex items-center justify-between cursor-pointer animate-bounce"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-black" />
              <span>Toggle categories to see more!</span>
            </div>
          </div>
        )}

        {/* Panel Header */}
        <header className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#A3E635]" />
            <span className="text-sm font-extrabold text-white font-['Outfit']">Layers</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#A3E635]/20 text-[#A3E635] font-extrabold font-mono">
              {activeCount}
            </span>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800"
            title={isCollapsed ? "Expand Layers Panel" : "Collapse Layers Panel"}
          >
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </header>

        {/* Panel Content (when not collapsed) */}
        {!isCollapsed && (
          <>
            <div className="border-t border-[#3F3F46] my-2" />

            {/* Checkbox Row List */}
            <ul className="space-y-0.5 max-h-[45vh] overflow-y-auto pr-1">
              {visibleLayers.map((layer) => (
                <LayerToggleRow
                  key={layer.id}
                  layer={layer}
                  enabled={!!enabled[layer.id]}
                  count={counts[layer.id] || 0}
                  onToggle={() => toggle(layer.id)}
                />
              ))}
            </ul>

            <div className="border-t border-[#3F3F46] my-2" />

            {/* Footer Reset */}
            <button
              onClick={reset}
              className="w-full text-xs text-zinc-400 hover:text-[#A3E635] text-left px-2 py-1 flex items-center gap-1.5 font-semibold transition-colors rounded-lg hover:bg-zinc-800/60"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to defaults</span>
            </button>
          </>
        )}
      </div>
    </>
  );
};
