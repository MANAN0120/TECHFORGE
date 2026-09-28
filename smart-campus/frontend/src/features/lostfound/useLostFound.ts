import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { LostItem, ItemType, ItemCategory } from './types';

export function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function useLostFound() {
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ type?: ItemType; category?: ItemCategory }>({});

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let userLat: number | undefined;
      let userLng: number | undefined;

      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => {
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 });
          });
          userLat = pos.coords.latitude;
          userLng = pos.coords.longitude;
        } catch {
          // GPS unavailable fallback
        }
      }

      const data = await api.getLostItems({
        campus_id: 'cu-gharaun',
        type: filter.type,
        category: filter.category,
        status: 'open',
        user_lat: userLat,
        user_lng: userLng,
      });

      setItems(data.items || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch lost & found items.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const reportItem = async (formData: FormData) => {
    const newItem = await api.createLostItem(formData);
    fetchItems();
    return newItem;
  };

  const resolveItem = async (id: number) => {
    const updated = await api.resolveLostItem(id);
    fetchItems();
    return updated;
  };

  return {
    items,
    loading,
    error,
    filter,
    setFilter,
    reportItem,
    resolveItem,
    refresh: fetchItems,
  };
}
