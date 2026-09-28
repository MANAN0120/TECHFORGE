import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';

interface HomeTopBarProps {
  onSkip: () => void;
}

export const HomeTopBar: React.FC<HomeTopBarProps> = ({ onSkip }) => {
  return (
    <>
      <a
        href="#main-cta"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-primary focus:text-black focus:px-4 focus:py-2 focus:rounded-lg focus:z-[100] font-bold text-xs shadow-lg"
      >
        Skip to demo
      </a>

      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-black font-extrabold shadow-md shadow-primary/20">
            <MapPin className="w-4 h-4 fill-current" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-base tracking-tight text-foreground font-['Outfit']">
              SmartCampus
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/30">
              CU
            </span>
          </div>
        </div>

        <button
          onClick={onSkip}
          className="flex items-center space-x-1 text-sm font-medium text-secondary hover:text-foreground transition-colors group"
        >
          <span>Skip to app</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </header>
    </>
  );
};
