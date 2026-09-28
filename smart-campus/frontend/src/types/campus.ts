export interface Coordinates {
  lat: floatNumber;
  lng: floatNumber;
}

type floatNumber = number;

export interface Entrance {
  id: string;
  lat: number;
  lng: number;
  is_primary: boolean;
  accessible: boolean;
}

export interface AccessibilityInfo {
  has_ramp: boolean;
  has_elevator: boolean;
  accessible_entrance: boolean;
}

export interface Building {
  id: string;
  name: string;
  short_name: string;
  category: string;
  center: Coordinates;
  geometry?: any;
  floors: number;
  entrances: Entrance[];
  departments: string[];
  accessibility: AccessibilityInfo;
  description: string;
  verified: boolean;
}

export interface POI {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  building_id?: string;
  floor?: number;
  description: string;
  wheelchair_accessible: boolean;
  verified: boolean;
}

export interface Department {
  id: string;
  name: string;
  building_id: string;
  floor?: number;
  description: string;
}

export interface TurnStep {
  step_index: number;
  instruction: string;
  distance_meters: number;
  duration_seconds: number;
  from_node: string;
  to_node: string;
  lat?: number;
  lng?: number;
  action: string;
  floor_change?: string;
}

export interface RouteData {
  found: boolean;
  mode: string;
  total_distance_meters: number;
  estimated_time_minutes: number;
  node_ids: string[];
  path_coordinates: [number, number][];
  steps: TurnStep[];
  is_accessible: boolean;
  avoided_blocked_paths: string[];
  message?: string;
}

export interface Cart {
  id: string;
  campus_id: string;
  name: string;
  route_id?: string;
  capacity: number;
  current_lat?: number;
  current_lng?: number;
  status: string;
  driver_name?: string;
  driver_phone?: string;
  last_updated: string;
}

export interface EventPhoto {
  id: string;
  url: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface CampusEvent {
  id: string;
  campus_id: string;
  title: string;
  description?: string;
  category: string;
  venue_name?: string;
  venue_lat?: number;
  venue_lng?: number;
  building_id?: string;
  starts_at: string;
  ends_at: string;
  organizer?: string;
  cover_image?: string;
  status: string;
  photos: EventPhoto[];
}

export interface ReviewPhoto {
  id: string;
  url: string;
  uploaded_at: string;
}

export interface Review {
  id: string;
  shop_id: string;
  rating: number;
  text?: string;
  reviewer_name: string;
  created_at: string;
  photos: ReviewPhoto[];
}

export interface ShopPhoto {
  id: string;
  url: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface Shop {
  id: string;
  campus_id: string;
  name: string;
  category: string;
  lat?: number;
  lng?: number;
  building_id?: string;
  floor?: number;
  description?: string;
  hours_open?: string;
  hours_close?: string;
  contact?: string;
  verified: boolean;
  average_rating: number;
  total_reviews: number;
  reviews: Review[];
  photos: ShopPhoto[];
}

export interface Condition {
  id: string;
  campus_id: string;
  path_id: string;
  reason?: string;
  severity: string;
  created_at: string;
  active: number;
}

export interface NotificationItem {
  id: string;
  campus_id: string;
  title: string;
  body?: string;
  category: string;
  read: number;
  created_at: string;
}

export interface SearchItem {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  category?: string;
  building_id?: string;
  lat?: number;
  lng?: number;
  floor?: number;
  score: number;
  metadata?: any;
}
