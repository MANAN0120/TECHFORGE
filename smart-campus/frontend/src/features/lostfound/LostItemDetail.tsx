import React, { useState } from 'react';
import { X, MapPin, Clock, Phone, Mail, Navigation, CheckCircle2, User } from 'lucide-react';
import { LostItem } from './types';
import { getCategoryMeta } from './categories';
import { formatTimeAgo } from './useLostFound';

interface LostItemDetailProps {
  item: LostItem | null;
  onClose: () => void;
  onResolve: (id: number) => Promise<void>;
  onNavigateToLocation?: (lat: number, lng: number, label: string) => void;
}

export const LostItemDetail: React.FC<LostItemDetailProps> = ({
  item,
  onClose,
  onResolve,
  onNavigateToLocation,
}) => {
  const [resolving, setResolving] = useState(false);

  if (!item) return null;

  const catMeta = getCategoryMeta(item.category);
  const CategoryIcon = catMeta.icon;

  const handleResolveClick = async () => {
    setResolving(true);
    try {
      await onResolve(item.id);
      onClose();
    } catch {
      setResolving(false);
    }
  };

  const isPhone = /^[+\d\s-]{7,15}$/.test(item.contact_info.trim());
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.contact_info.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface2">
          <div className="flex items-center space-x-2">
            {item.type === 'lost' ? (
              <span className="px-2.5 py-1 text-xs font-black tracking-wider uppercase bg-warning text-black rounded-lg">
                LOST ITEM
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-black tracking-wider uppercase bg-primary text-black rounded-lg">
                FOUND ITEM
              </span>
            )}
            <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border ${catMeta.colorClass}`}>
              {catMeta.label}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-secondary hover:text-foreground rounded-full hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Photo banner */}
          {item.photo_url ? (
            <div className="w-full max-h-64 rounded-xl overflow-hidden bg-surface2 border border-border">
              <img src={item.photo_url} alt={item.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full py-8 rounded-xl bg-surface2 border border-border flex flex-col items-center justify-center space-y-2 text-secondary">
              <CategoryIcon className="w-12 h-12 text-secondary/60" />
              <span className="text-xs">No photo provided</span>
            </div>
          )}

          {/* Title & Description */}
          <div>
            <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
            <p className="text-sm text-secondary mt-2 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* Location & Navigation */}
          <div className="p-3.5 bg-surface2 rounded-xl border border-border/70 space-y-3">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-secondary uppercase tracking-wider">Last Seen Location</div>
                <div className="text-sm font-medium text-foreground mt-0.5">
                  {item.last_seen_label || item.building_id || 'Near Campus'}
                </div>
                {item.distance_from_user_meters !== null && item.distance_from_user_meters !== undefined && (
                  <div className="text-xs text-primary font-semibold mt-1">
                    {item.distance_from_user_meters} meters away from you
                  </div>
                )}
              </div>
            </div>

            {onNavigateToLocation && item.last_seen_lat && item.last_seen_lng && (
              <button
                onClick={() => {
                  onNavigateToLocation(item.last_seen_lat!, item.last_seen_lng!, item.last_seen_label || item.title);
                  onClose();
                }}
                className="w-full py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Navigate to Last-Seen Spot</span>
              </button>
            )}
          </div>

          {/* Contact Info */}
          <div className="p-3.5 bg-surface2 rounded-xl border border-border/70 space-y-2">
            <div className="text-xs font-semibold text-secondary uppercase tracking-wider">Contact Information</div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-foreground">{item.contact_info}</span>
              </div>

              {isPhone && (
                <a
                  href={`tel:${item.contact_info}`}
                  className="px-3 py-1.5 bg-primary text-black font-bold text-xs rounded-lg flex items-center space-x-1 hover:bg-primary/90"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              )}
              {isEmail && (
                <a
                  href={`mailto:${item.contact_info}`}
                  className="px-3 py-1.5 bg-primary text-black font-bold text-xs rounded-lg flex items-center space-x-1 hover:bg-primary/90"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
              )}
            </div>
          </div>

          {/* Reported Time */}
          <div className="flex items-center space-x-1 text-xs text-secondary">
            <Clock className="w-3.5 h-3.5" />
            <span>Reported {formatTimeAgo(item.created_at)}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-surface2 flex space-x-3">
          <button
            onClick={handleResolveClick}
            disabled={resolving || item.status === 'resolved'}
            className="flex-1 py-3 bg-surface hover:bg-surface/80 border border-primary/40 text-primary font-bold rounded-xl transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{resolving ? 'Resolving...' : item.status === 'resolved' ? 'Item Resolved' : 'Mark as Resolved'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
