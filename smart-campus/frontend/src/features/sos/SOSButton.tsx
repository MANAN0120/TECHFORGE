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
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-error/15 hover:bg-error/25 text-error border border-error/40 shadow-sm transition-all active:scale-95 ${className}`}
      >
        <Siren className="w-4 h-4 animate-pulse shrink-0" />
        <span className="text-xs font-bold tracking-wide hidden sm:inline">SOS</span>
        <span className="text-xs font-bold tracking-wide sm:hidden">SOS</span>
      </button>

      <SOSModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectSafePointOnMap={onSelectSafePointOnMap}
      />
    </>
  );
};
