export interface PersonLocation {
  lat: number;
  lng: number;
  label?: string;
}

export interface MeetupRequest {
  campus_id: string;
  person_a: PersonLocation;
  person_b: PersonLocation;
  accessible?: boolean;
  max_radius_meters?: number;
  limit?: number;
}

export interface MeetupSuggestion {
  poi_id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  walk_time_a: number;   // seconds
  walk_time_b: number;   // seconds
  distance_a: number;    // meters
  distance_b: number;    // meters
  equidistance_delta: number;
  score: number;
  reason: string;
  accessible: boolean;
}

export interface MeetupResponse {
  midpoint: { lat: number; lng: number };
  suggestions: MeetupSuggestion[];
  warnings?: string[];
}
