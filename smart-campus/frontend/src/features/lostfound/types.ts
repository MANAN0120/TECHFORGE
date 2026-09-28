export type ItemType = 'lost' | 'found';

export type ItemCategory = 'phone' | 'wallet' | 'id_card' | 'keys' | 'bag' | 'other';

export interface LostItem {
  id: number;
  campus_id: string;
  type: ItemType;
  title: string;
  description: string;
  category: ItemCategory;
  photo_url?: string | null;
  last_seen_lat?: number | null;
  last_seen_lng?: number | null;
  last_seen_label?: string | null;
  building_id?: string | null;
  contact_info: string;
  reported_by?: string | null;
  status: 'open' | 'resolved';
  created_at: string;
  resolved_at?: string | null;
  distance_from_user_meters?: number | null;
}

export interface LostItemListResponse {
  items: LostItem[];
  total: number;
}
