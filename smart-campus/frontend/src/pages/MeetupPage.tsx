import React, { useState } from 'react';
import { MeetupPanel } from '../features/meetup/MeetupPanel';
import { MeetupMapView } from '../features/meetup/MeetupMapView';
import { MeetupSuggestion, PersonLocation } from '../types/meetup';

interface MeetupPageProps {
  onNavigateToSpot: (spotId: string) => void;
}

export const MeetupPage: React.FC<MeetupPageProps> = ({ onNavigateToSpot }) => {
  const [selectedSpot, setSelectedSpot] = useState<MeetupSuggestion | null>(null);
  const [personA, setPersonA] = useState<PersonLocation | null>(null);
  const [personB, setPersonB] = useState<PersonLocation | null>(null);

  const handleSelectSuggestion = (
    spot: MeetupSuggestion,
    pA: PersonLocation,
    pB: PersonLocation
  ) => {
    setSelectedSpot(spot);
    setPersonA(pA);
    setPersonB(pB);
  };

  if (selectedSpot && personA && personB) {
    return (
      <div className="w-full h-full relative">
        <MeetupMapView
          personA={personA}
          personB={personB}
          selectedSpot={selectedSpot}
          onBack={() => setSelectedSpot(null)}
          onNavigateToSpot={onNavigateToSpot}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-[#09090B] overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-8 flex items-start justify-center">
      <MeetupPanel onSelectSuggestion={handleSelectSuggestion} />
    </div>
  );
};
