import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import { LostItem } from './types';
import { getCategoryMeta } from './categories';
import { formatTimeAgo } from './useLostFound';

interface LostItemCardProps {
  item: LostItem;
  onClick: () => void;
}

export const LostItemCard: React.FC<LostItemCardProps> = ({ item, onClick }) => {
  const catMeta = getCategoryMeta(item.category);
  const CategoryIcon = catMeta.icon;

  return (
    <div
      onClick={onClick}
      className="group bg-surface hover:bg-surface2/70 border border-border hover:border-primary/50 rounded-2xl p-3.5 transition-all duration-200 cursor-pointer shadow-md flex flex-col justify-between"
    >
      <div>
        {/* Thumbnail / Image container */}
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-surface2 mb-3 border border-border/40 flex items-center justify-center">
          {item.photo_url ? (
            <img
              src={item.photo_url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className={`p-4 rounded-full ${catMeta.colorClass}`}>
              <CategoryIcon className="w-8 h-8 opacity-80" />
            </div>
          )}

          {/* Type Badge (LOST / FOUND) */}
          <div className="absolute top-2 left-2">
            {item.type === 'lost' ? (
              <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase bg-warning text-black rounded-md shadow-md">
                LOST
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase bg-primary text-black rounded-md shadow-md">
                FOUND
              </span>
            )}
          </div>

          {/* Category Chip */}
          <div className="absolute bottom-2 right-2">
            <span className={`px-2 py-0.5 text-[10px] font-medium rounded-md backdrop-blur-md border ${catMeta.colorClass}`}>
              {catMeta.label}
            </span>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
          {item.title}
        </h4>

        {/* Description snippet */}
        <p className="text-xs text-secondary line-clamp-2 mt-1 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-secondary">
        <div className="flex items-center space-x-1 truncate max-w-[60%]">
          <MapPin className="w-3 h-3 text-primary shrink-0" />
          <span className="truncate">{item.last_seen_label || item.building_id || 'Campus Area'}</span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {item.distance_from_user_meters !== null && item.distance_from_user_meters !== undefined && (
            <span className="text-primary font-semibold">{item.distance_from_user_meters}m</span>
          )}
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(item.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
