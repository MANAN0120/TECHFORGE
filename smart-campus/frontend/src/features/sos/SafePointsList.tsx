import React from 'react';
import { Shield, Heart, Building, Navigation } from 'lucide-react';
import { SafePoint } from './types';

interface SafePointsListProps {
  safePoints: SafePoint[];
  onSelectSafePoint?: (sp: SafePoint) => void;
}

export const SafePointsList: React.FC<SafePointsListProps> = ({ safePoints, onSelectSafePoint }) => {
  if (!safePoints || safePoints.length === 0) {
    return (
      <div className="text-secondary text-xs p-3 text-center bg-surface2 rounded-lg border border-border">
        No safe points configured for this campus area.
      </div>
    );
  }

  const getIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'medical':
        return <Heart className="w-4 h-4 text-error" />;
      case 'security':
        return <Shield className="w-4 h-4 text-primary" />;
      default:
        return <Building className="w-4 h-4 text-warning" />;
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-secondary uppercase tracking-wider">Nearest Safe Points</h4>
      <div className="space-y-2">
        {safePoints.map((sp, idx) => {
          const minutes = Math.max(1, Math.ceil(sp.walk_seconds / 60));
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-surface2 rounded-xl border border-border/60 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-surface border border-border">
                  {getIcon(sp.category)}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{sp.name}</div>
                  <div className="text-xs text-primary font-medium mt-0.5">
                    {sp.distance_meters} m · {minutes} min walk
                  </div>
                </div>
              </div>
              {onSelectSafePoint && (
                <button
                  onClick={() => onSelectSafePoint(sp)}
                  className="flex items-center space-x-1 text-xs text-primary hover:underline px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Map</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
