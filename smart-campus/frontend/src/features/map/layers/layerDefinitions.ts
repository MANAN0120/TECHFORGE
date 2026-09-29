import { LayerDefinition } from './types';

export const LAYER_DEFINITIONS: LayerDefinition[] = [
  {
    id: "buildings",
    label: "Buildings",
    icon: "Building2",
    source: "buildings",
    defaultEnabled: true,
  },
  {
    id: "gates",
    label: "Gates",
    icon: "DoorOpen",
    source: "nodes",
    filter: { field: "type", value: "gate" },
    defaultEnabled: true,
  },
  {
    id: "food",
    label: "Food & Cafes",
    icon: "UtensilsCrossed",
    source: "pois",
    filter: { field: "category", value: "food" },
    defaultEnabled: false,
  },
  {
    id: "banks",
    label: "ATMs & Banks",
    icon: "CreditCard",
    source: "pois",
    filter: { field: "category", value: "atm" },
    defaultEnabled: false,
  },
  {
    id: "washrooms",
    label: "Washrooms",
    icon: "Bath",
    source: "pois",
    filter: { field: "category", value: "washroom" },
    defaultEnabled: false,
  },
  {
    id: "medical",
    label: "Medical",
    icon: "HeartPulse",
    source: "pois",
    filter: { field: "category", value: "medical" },
    defaultEnabled: false,
  },
  {
    id: "hostels",
    label: "Hostels",
    icon: "BedDouble",
    source: "buildings",
    filter: { field: "category", value: "hostel" },
    defaultEnabled: false,
  },
  {
    id: "sports",
    label: "Sports & Playgrounds",
    icon: "Dumbbell",
    source: "pois",
    filter: { field: "category", value: "sports" },
    defaultEnabled: false,
  },
  {
    id: "shops",
    label: "Shops",
    icon: "Store",
    source: "shops",
    defaultEnabled: false,
  },
  {
    id: "carts",
    label: "Carts",
    icon: "Truck",
    source: "carts",
    defaultEnabled: false,
  },
  {
    id: "events",
    label: "Events",
    icon: "CalendarHeart",
    source: "events",
    defaultEnabled: false,
  },
  {
    id: "parking",
    label: "Parking",
    icon: "CircleParking",
    source: "pois",
    filter: { field: "category", value: "parking" },
    defaultEnabled: false,
  },
];

export const DEFAULT_ENABLED_LAYERS: Record<string, boolean> = LAYER_DEFINITIONS.reduce(
  (acc, layer) => {
    acc[layer.id] = layer.defaultEnabled;
    return acc;
  },
  {} as Record<string, boolean>
);
