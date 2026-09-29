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
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-950 text-red-400 border-2 border-red-600/90 font-black shadow-2xl hover:bg-red-950 hover:border-red-500 hover:text-white transition-all active:scale-95 cursor-pointer shrink-0 min-w-max ${className}`}
      >
        <Siren className="w-5 h-5 text-red-500 fill-red-500/30 animate-pulse shrink-0" />
        <span className="text-xs font-black tracking-wider uppercase text-red-400">SOS</span>
      </button>

      <SOSModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectSafePointOnMap={onSelectSafePointOnMap}
      />
    </>
  );
};
