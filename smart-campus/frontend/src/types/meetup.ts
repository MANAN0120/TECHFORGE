export interface PersonLocation {
  lat: number;
  lng: number;
  label?: string;
}

export interface ParticipantRouteInfo {
  label: string;
  walk_time_seconds: number;
  distance_meters: number;
}

export interface MeetupRequest {
  campus_id: string;
  person_a?: PersonLocation;
  person_b?: PersonLocation;
  participants?: PersonLocation[];
  accessible?: boolean;
  prefer_low_crowd?: boolean;
  max_radius_meters?: number;
  limit?: number;
}

export interface MeetupSuggestion {
  poi_id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  walk_time_a: number;
  walk_time_b: number;
  distance_a: number;
  distance_b: number;
  equidistance_delta: number;
  score: number;
  reason: string;
  accessible: boolean;
  participant_routes?: ParticipantRouteInfo[];
  max_walk_time_minutes?: number;
  avg_walk_time_minutes?: number;
}

export interface MeetupResponse {
  midpoint: { lat: number; lng: number };
  suggestions: MeetupSuggestion[];
  warnings?: string[];
}
