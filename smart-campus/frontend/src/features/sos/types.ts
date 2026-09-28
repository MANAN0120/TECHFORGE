export interface SafePoint {
  name: string;
  category: string; // "security" | "medical" | "admin"
  lat: number;
  lng: number;
  distance_meters: number;
  walk_seconds: number;
  building_id?: string;
}

export interface EmergencyContact {
  label: string;
  phone: string;
}

export interface SOSRequest {
  campus_id: string;
  lat: number;
  lng: number;
  accuracy?: number;
  message?: string;
  device_id?: string;
}

export interface SOSResponse {
  alert_id: number;
  status: string;
  message: string;
  safe_points: SafePoint[];
  emergency_contacts: EmergencyContact[];
}
