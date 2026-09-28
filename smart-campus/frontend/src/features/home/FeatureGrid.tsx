import React from 'react';
import { Map, Users, CalendarClock, Shield } from 'lucide-react';

interface FeatureGridProps {
  onLaunch: () => void;
}

const FEATURES = [
  {
    icon: Map,
    title: 'Navigation',
    body: 'Graph-based routing that works indoor and outdoor, from gate to classroom door.',
  },
  {
    icon: Users,
    title: 'Meetup',
    body: 'AI-optimized meeting points between two people — real landmarks, fair to both.',
  },
  {
    icon: CalendarClock,
    title: 'Class Auto-Pilot',
    body: 'Real walk times and notifications before every class. Never miss a room again.',
  },
  {
    icon: Shield,
    title: 'Safety',
    body: 'One-tap SOS plus a community Lost & Found board for the whole campus.',
  },
];

export const FeatureGrid: React.FC<FeatureGridProps> = ({ onLaunch }) => {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 border-t border-border/50">
      <div className="mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
          Everything a student actually needs
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {FEATURES.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              onClick={onLaunch}
              className="group bg-surface/80 backdrop-blur-md border border-border hover:border-primary/50 rounded-2xl p-6 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-primary/10"
            >
              <div className="w-10 h-10 rounded-lg bg-surface2 border border-border flex items-center justify-center text-primary mb-4 group-hover:border-primary/30 transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {feat.title}
              </h3>
              <p className="text-sm text-secondary leading-relaxed">
                {feat.body}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
