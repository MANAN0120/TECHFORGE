import React from 'react';
import { 
  Building2, 
  DoorOpen, 
  UtensilsCrossed, 
  CreditCard, 
  Bath, 
  HeartPulse, 
  BedDouble, 
  Dumbbell, 
  Store, 
  Truck, 
  CalendarHeart, 
  CircleParking,
  Layers as DefaultIcon 
} from 'lucide-react';
import { LayerDefinition } from './types';

interface LayerToggleRowProps {
  layer: LayerDefinition;
  enabled: boolean;
  count: number;
  onToggle: () => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Building2,
  DoorOpen,
  UtensilsCrossed,
  CreditCard,
  Bath,
  HeartPulse,
  BedDouble,
  Dumbbell,
  Store,
  Truck,
  CalendarHeart,
  CircleParking,
};

export const LayerToggleRow: React.FC<LayerToggleRowProps> = ({
  layer,
  enabled,
  count,
  onToggle,
}) => {
  const IconComponent = ICON_MAP[layer.icon] || DefaultIcon;

  return (
    <label className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-[#27272A] cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#A3E635] focus-within:ring-offset-2 focus-within:ring-offset-[#18181B] select-none">
      <input
        type="checkbox"
        checked={enabled}
        onChange={onToggle}
        className="w-4 h-4 accent-[#A3E635] bg-zinc-800 border-zinc-700 rounded cursor-pointer transition-colors focus:outline-none"
      />
      <IconComponent className={`w-4 h-4 ${enabled ? 'text-[#A3E635]' : 'text-zinc-400'}`} />
      <span className={`text-sm flex-1 ${enabled ? 'text-white font-medium' : 'text-zinc-300'}`}>
        {layer.label}
      </span>
      <span className="text-xs text-zinc-400 font-mono ml-auto">
        {count}
      </span>
    </label>
  );
};
