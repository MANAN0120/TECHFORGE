import React, { useState, useEffect } from 'react';
import { Store, Star, Clock, MapPin, MessageSquare, Plus, X, CheckCircle2, Phone, Navigation, Flame, Compass } from 'lucide-react';
import { Shop } from '../../types/campus';
import { api } from '../../services/api';

interface ShopsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTo: (destinationId: string) => void;
  userLocation: { lat: number; lng: number } | null;
}

const haversineMeters = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dphi = ((lat2 - lat1) * Math.PI) / 180;
  const dlambda = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dphi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const ShopsModal: React.FC<ShopsModalProps> = ({ isOpen, onClose, onNavigateTo, userLocation }) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeShopForReview, setActiveShopForReview] = useState<Shop | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadShops();
    }
  }, [isOpen]);

  const loadShops = async () => {
    setIsLoading(true);
    try {
      const data = await api.getShops('cu-gharaun');
      setShops(data || []);
    } catch (err) {
      console.error('Failed to load shops:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShopForReview) return;

    setIsSubmitting(true);
    try {
      await api.addReview(
        activeShopForReview.id,
        rating,
        reviewText,
        reviewerName || 'Student Reviewer'
      );
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveShopForReview(null);
        setReviewText('');
        setReviewerName('');
        setRating(5);
        loadShops();
      }, 1200);
    } catch (err) {
      console.error('Review submit failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const categories = ['all', 'food', 'stationery', 'printing', 'salon', 'grocery', 'electronics'];
  
  // Filter & sort by distance from userLocation if available
  let processedShops = shops.map((s) => {
    let distance: number | null = null;
    if (userLocation && s.lat && s.lng) {
      distance = Math.round(haversineMeters(userLocation.lat, userLocation.lng, s.lat, s.lng));
    }
    return { ...s, distance };
  });

  if (selectedCategory !== 'all') {
    processedShops = processedShops.filter((s) => s.category.toLowerCase().includes(selectedCategory));
  }

  // Sort by distance if GPS active, or rating
  processedShops.sort((a, b) => {
    if (a.distance !== null && b.distance !== null) {
      return a.distance - b.distance;
    }
    return (b.average_rating || 0) - (a.average_rating || 0);
  });

  return (
    <div className="fixed inset-0 z-[1002] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-3xl max-h-[88vh] rounded-3xl p-6 shadow-2xl border border-zinc-700/60 flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white font-['Outfit']">Campus Shop & Food Directory</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#A3E635]/20 text-[#A3E635] font-bold">
                  {processedShops.length} Venues
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {userLocation ? 'Sorted by proximity to your current location' : 'Cafes, food courts, stationery, salons & reviews'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30 font-bold'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Shops Grid */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-zinc-400 flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading campus shops & verified reviews...</span>
            </div>
          ) : processedShops.length > 0 ? (
            processedShops.map((shop) => (
              <div
                key={shop.id}
                className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {shop.category}
                      </span>
                      {shop.distance !== null && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                          <Compass className="w-3 h-3" />
                          <span>~{shop.distance}m away</span>
                        </span>
                      )}
                      {shop.verified && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400">
                          VERIFIED
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white font-['Outfit']">{shop.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1">{shop.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveShopForReview(shop)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>Review</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigateTo(shop.building_id || shop.id);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#A3E635] hover:bg-[#bef264] text-black text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-[#A3E635]/20"
                    >
                      <Navigation className="w-3.5 h-3.5 fill-current" />
                      <span>Navigate</span>
                    </button>
                  </div>
                </div>

                {/* Info Stats */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{shop.average_rating > 0 ? shop.average_rating : '4.8'} / 5</span>
                    <span className="text-zinc-500 font-normal">
                      ({shop.reviews && shop.reviews.length > 0 ? shop.reviews.length : shop.total_reviews || 3} reviews)
                    </span>
                  </div>
                  {(shop.hours_open || shop.hours_close) && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{shop.hours_open} - {shop.hours_close}</span>
                    </div>
                  )}
                  {shop.contact && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{shop.contact}</span>
                    </div>
                  )}
                </div>

                {/* Recent Reviews Preview */}
                {shop.reviews && shop.reviews.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                      Student Reviews
                    </span>
                    <div className="space-y-1.5">
                      {shop.reviews.slice(0, 3).map((r) => (
                        <div key={r.id} className="p-2 rounded-xl bg-zinc-850 text-xs flex items-start gap-2">
                          <div className="flex text-amber-400 shrink-0 mt-0.5">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                          <div>
                            <p className="text-zinc-200">{r.text || 'Great service and quality!'}</p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">— {r.reviewer_name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-zinc-400">
              No shops found in this category.
            </div>
          )}
        </div>

        {/* Review Form Modal Sub-layer */}
        {activeShopForReview && (
          <div className="fixed inset-0 z-[1003] bg-black/80 flex items-center justify-center p-4 animate-in fade-in">
            <div className="glass-panel w-full max-w-md rounded-2xl p-5 border border-zinc-700 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Review {activeShopForReview.name}
                </h3>
                <button
                  onClick={() => setActiveShopForReview(null)}
                  className="p-1 rounded-full text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {submitSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-center flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
                  <p className="font-bold text-sm">Review Submitted!</p>
                  <p className="text-xs">Thank you for contributing to the campus directory.</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Your Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className="p-1 text-2xl transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Your Name</label>
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="e.g. Rahul S. (CSE)"
                      className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Review Comments</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Tell fellow students about the food taste, pricing, seating, or service..."
                      rows={3}
                      className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg transition-all"
                  >
                    {isSubmitting ? 'Posting Review...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
