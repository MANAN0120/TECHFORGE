import React, { useState } from 'react';
import { Siren } from 'lucide-react';
import { SOSModal } from './SOSModal';
import { SafePoint } from './types';

interface SOSButtonProps {
  onSelectSafePointOnMap?: (sp: SafePoint) => void;
  className?: string;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ onSelectSafePointOnMap, className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        aria-label="Trigger emergency SOS"
        className={`group flex flex-row items-center justify-center gap-2.5 h-11 px-4.5 rounded-2xl bg-zinc-950 text-red-400 border-2 border-red-600/90 font-black shadow-2xl shadow-red-950/50 hover:bg-red-600 hover:text-white hover:border-red-500 transition-all duration-200 active:scale-95 cursor-pointer shrink-0 whitespace-nowrap ${className}`}
      >
        <Siren className="w-5 h-5 text-red-500 group-hover:text-white fill-red-500/20 animate-pulse shrink-0" />
        <span className="text-xs font-black tracking-wider uppercase text-red-400 group-hover:text-white whitespace-nowrap">
          EMERGENCY SOS
        </span>
      </button>

      <SOSModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectSafePointOnMap={onSelectSafePointOnMap}
      />
    </>
  );
};
