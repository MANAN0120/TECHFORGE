import { Building, POI, Department, RouteData, Cart, CampusEvent, Shop, Condition, NotificationItem, SearchItem } from '../types/campus';

const API_BASE = '/api';

export const api = {
  // Campus Data
  getCampusInfo: async (campusId: string = 'cu-gharaun') => {
    const res = await fetch(`${API_BASE}/campus/${campusId}`);
    return res.json();
  },

  getBuildings: async (campusId: string = 'cu-gharaun'): Promise<{ buildings: Building[] }> => {
    const res = await fetch(`${API_BASE}/campus/${campusId}/buildings`);
    return res.json();
  },

  getPOIs: async (campusId: string = 'cu-gharaun', category?: string): Promise<{ pois: POI[] }> => {
    const url = category ? `${API_BASE}/campus/${campusId}/pois?category=${category}` : `${API_BASE}/campus/${campusId}/pois`;
    const res = await fetch(url);
    return res.json();
  },

  getDepartments: async (campusId: string = 'cu-gharaun'): Promise<{ departments: Department[] }> => {
    const res = await fetch(`${API_BASE}/campus/${campusId}/departments`);
    return res.json();
  },

  getGeoJSON: async (campusId: string = 'cu-gharaun') => {
    const res = await fetch(`${API_BASE}/campus/${campusId}/geojson`);
    return res.json();
  },

  // Search
  search: async (query: string, campusId: string = 'cu-gharaun', category?: string): Promise<{ results: SearchItem[] }> => {
    const url = new URL(`${window.location.origin}${API_BASE}/search`);
    url.searchParams.append('q', query);
    url.searchParams.append('campus_id', campusId);
    if (category) url.searchParams.append('category', category);
    const res = await fetch(url.toString());
    return res.json();
  },

  // Routing
  calculateRoute: async (
    origin?: string | null,
    destination?: string | null,
    mode: 'walk' | 'accessible' = 'walk',
    originCoords?: { lat: number; lng: number } | null,
    destinationCoords?: { lat: number; lng: number } | null,
    campusId: string = 'cu-gharaun'
  ): Promise<RouteData> => {
    const payload: any = { campus_id: campusId, mode };
    if (origin) payload.origin = origin;
    if (destination) payload.destination = destination;
    if (originCoords) payload.origin_coords = originCoords;
    if (destinationCoords) payload.destination_coords = destinationCoords;

    const res = await fetch(`${API_BASE}/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Events
  getEvents: async (campusId: string = 'cu-gharaun'): Promise<{ events: CampusEvent[] }> => {
    const res = await fetch(`${API_BASE}/events?campus_id=${campusId}`);
    return res.json();
  },

  uploadEventPhoto: async (eventId: string, file: File, uploadedBy: string = 'Anonymous') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploaded_by', uploadedBy);
    const res = await fetch(`${API_BASE}/events/${eventId}/photos`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  // Carts
  getCarts: async (campusId: string = 'cu-gharaun'): Promise<Cart[]> => {
    const res = await fetch(`${API_BASE}/carts?campus_id=${campusId}`);
    return res.json();
  },

  getNearestCart: async (lat: number, lng: number, campusId: string = 'cu-gharaun') => {
    const res = await fetch(`${API_BASE}/carts/nearest?lat=${lat}&lng=${lng}&campus_id=${campusId}`);
    return res.json();
  },

  // Shops & Reviews
  getShops: async (campusId: string = 'cu-gharaun', category?: string): Promise<Shop[]> => {
    const url = category ? `${API_BASE}/shops?campus_id=${campusId}&category=${category}` : `${API_BASE}/shops?campus_id=${campusId}`;
    const res = await fetch(url);
    return res.json();
  },

  getShop: async (shopId: string): Promise<Shop> => {
    const res = await fetch(`${API_BASE}/shops/${shopId}`);
    return res.json();
  },

  addReview: async (shopId: string, rating: number, text: string, reviewerName: string = 'Anonymous') => {
    const res = await fetch(`${API_BASE}/shops/${shopId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, text, reviewer_name: reviewerName }),
    });
    return res.json();
  },

  // Admin Conditions
  getConditions: async (campusId: string = 'cu-gharaun'): Promise<Condition[]> => {
    const res = await fetch(`${API_BASE}/admin/conditions?campus_id=${campusId}`);
    return res.json();
  },

  createCondition: async (pathId: string, reason: string, campusId: string = 'cu-gharaun') => {
    const res = await fetch(`${API_BASE}/admin/conditions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campus_id: campusId, path_id: pathId, reason }),
    });
    return res.json();
  },

  deleteCondition: async (conditionId: string) => {
    const res = await fetch(`${API_BASE}/admin/conditions/${conditionId}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Notifications
  getNotifications: async (campusId: string = 'cu-gharaun'): Promise<NotificationItem[]> => {
    const res = await fetch(`${API_BASE}/notifications?campus_id=${campusId}`);
    return res.json();
  },

  // AI Assistant
  chatAssistant: async (message: string, history: { role: string; content: string }[] = [], userLocation?: { lat: number; lng: number }, campusId: string = 'cu-gharaun') => {
    const res = await fetch(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campus_id: campusId,
        message,
        history,
        user_location: userLocation,
      }),
    });
    return res.json();
  },

  // Meetup Point
  suggestMeetup: async (req: any) => {
    const res = await fetch(`${API_BASE}/meetup/suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return res.json();
  },

  // Class Schedule Walk Time Preview
  previewClassRoute: async (req: {
    campus_id?: string;
    building_id: string;
    from_lat?: number;
    from_lng?: number;
    accessible?: boolean;
  }) => {
    const res = await fetch(`${API_BASE}/schedule/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campus_id: req.campus_id || 'cu-gharaun',
        building_id: req.building_id,
        from_lat: req.from_lat,
        from_lng: req.from_lng,
        accessible: req.accessible || false,
      }),
    });
    return res.json();
  },
};
