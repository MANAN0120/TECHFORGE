import React, { useState, useEffect } from 'react';
import { Car, MapPin, Phone, Users, Clock, X, Navigation } from 'lucide-react';
import { Cart } from '../../types/campus';
import { api } from '../../services/api';

interface CartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlyTo: (lat: number, lng: number) => void;
}

export const CartsModal: React.FC<CartsModalProps> = ({ isOpen, onClose, onFlyTo }) => {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [nearestInfo, setNearestInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCarts();
    }
  }, [isOpen]);

  const loadCarts = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCarts('cu-gharaun');
      setCarts(data);

      // Default user location (e.g. near Main Gate)
      const nearest = await api.getNearestCart(30.7710, 76.5735, 'cu-gharaun');
      setNearestInfo(nearest);
    } catch (err) {
      console.error('Failed to load carts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1002] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4">
      <div className="glass-panel w-full sm:max-w-xl max-h-[92vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-zinc-700/60 flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 pb-20 sm:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#A3E635]/20 text-[#A3E635] flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit']">Campus E-Carts</h2>
              <p className="text-xs text-zinc-400">Live cart tracking & estimated arrival times</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nearest Cart Highlight Banner */}
        {nearestInfo && (
          <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-zinc-900 border border-emerald-800/50 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Nearest Available Cart
              </span>
              <h3 className="text-base font-bold text-white font-['Outfit']">{nearestInfo.cart.name}</h3>
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#A3E635]" />
                  ETA: <b className="text-white">~{nearestInfo.estimated_arrival_minutes} mins</b>
                </span>
                <span>•</span>
                <span>~{nearestInfo.distance_meters}m away</span>
              </div>
            </div>

            {nearestInfo.cart.current_lat && nearestInfo.cart.current_lng && (
              <button
                onClick={() => {
                  onFlyTo(nearestInfo.cart.current_lat, nearestInfo.cart.current_lng);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-[#A3E635] hover:bg-[#bef264] text-black font-bold text-xs transition-all shadow-md shadow-[#A3E635]/20"
              >
                Track Live
              </button>
            )}
          </div>
        )}

        {/* Carts List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {carts.map((cart) => (
            <div
              key={cart.id}
              className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3 hover:border-zinc-700 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white font-['Outfit']">{cart.name}</h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      cart.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {cart.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    Capacity: {cart.capacity} seats
                  </span>
                  <span>•</span>
                  <span>Driver: {cart.driver_name || 'Assigned'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cart.driver_phone && (
                  <a
                    href={`tel:${cart.driver_phone}`}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white transition-colors"
                    title="Call Driver"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
                {cart.current_lat && cart.current_lng && (
                  <button
                    onClick={() => {
                      onFlyTo(cart.current_lat!, cart.current_lng!);
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-[#A3E635] text-zinc-300 hover:text-black transition-all"
                    title="Focus on Map"
                  >
                    <Navigation className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
