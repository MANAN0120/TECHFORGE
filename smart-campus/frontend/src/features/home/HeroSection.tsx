import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onLaunch: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onLaunch }) => {
  return (
    <section className="relative min-h-[90vh] pt-16 flex flex-col items-center justify-center px-4 sm:px-6 text-center overflow-hidden">
      {/* Subtle radial glow behind headline */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[500px] md:w-[600px] h-[220px] sm:h-[300px] bg-primary/10 blur-3xl rounded-full -z-10 pointer-events-none" />

      <div className="max-w-3xl space-y-4 sm:space-y-6">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight text-foreground">
          The campus app that works <span className="text-primary font-bold">when GPS doesn't.</span>
        </h1>

        <p className="text-sm sm:text-lg md:text-xl text-secondary font-medium tracking-wide flex items-center justify-center flex-wrap gap-1.5 sm:gap-2">
          <span>Navigation</span>
          <span className="text-border">·</span>
          <span>Safety</span>
          <span className="text-border">·</span>
          <span>Coordination</span>
          <span className="text-border">·</span>
          <span>Every campus</span>
        </p>

        <div className="pt-4">
          <button
            id="main-cta"
            onClick={onLaunch}
            aria-label="Launch the live SmartCampus demo"
            className="inline-flex items-center space-x-2.5 px-7 py-3.5 sm:px-8 sm:py-4 rounded-xl bg-primary text-black font-extrabold text-base sm:text-lg hover:opacity-95 active:scale-98 transition-all shadow-xl shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background cursor-pointer"
          >
            <span>LAUNCH LIVE DEMO</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-secondary font-medium tracking-wide">
          Built for Chandigarh University
        </p>
      </div>
    </section>
  );
};
