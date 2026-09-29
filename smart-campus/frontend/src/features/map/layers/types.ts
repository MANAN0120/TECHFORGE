export type LayerId =
  | "buildings"
  | "gates"
  | "food"
  | "banks"
  | "washrooms"
  | "medical"
  | "hostels"
  | "sports"
  | "shops"
  | "carts"
  | "events"
  | "parking";

export interface LayerDefinition {
  id: LayerId;
  label: string;
  icon: string;              // lucide-react icon name
  source: "buildings" | "pois" | "carts" | "shops" | "events" | "nodes";
  filter?: { field: string; value: string };  // e.g. category=hostel
  defaultEnabled: boolean;
}

export interface LayerState {
  enabled: Record<LayerId, boolean>;
  version: number;
}
