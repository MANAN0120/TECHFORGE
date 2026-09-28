import React from 'react';
import { LostFoundBoard } from '../features/lostfound/LostFoundBoard';

interface LostFoundPageProps {
  onNavigateToLocation?: (lat: number, lng: number, label: string) => void;
}

export const LostFoundPage: React.FC<LostFoundPageProps> = ({ onNavigateToLocation }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <LostFoundBoard onNavigateToLocation={onNavigateToLocation} />
    </div>
  );
};
