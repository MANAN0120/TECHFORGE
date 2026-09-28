import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Building, POI, Cart, RouteData } from '../../types/campus';
import { 
  Building2, 
  ChevronRight, 
  Accessibility, 
  Compass, 
  Plus, 
  Minus, 
  RotateCcw, 
  Eye, 
  X, 
  Maximize2,
  Navigation,
  Sparkles,
  MapPin
} from 'lucide-react';

export type MapViewMode = 'satellite' | '3d' | 'dark' | 'streets';

interface CampusMapProps {
  buildings: Building[];
  pois: POI[];
  carts: Cart[];
  activeRoute: RouteData | null;
  selectedBuilding: Building | null;
  onSelectBuilding: (building: Building) => void;
  onNavigateTo: (destinationId: string) => void;
  centerCoords: [number, number];
  zoomLevel: number;
  userLocation: { lat: number; lng: number } | null;
}

// Controller component to handle map programmatic flyTo and capture map instance
const MapViewController: React.FC<{ 
  center: [number, number]; 
  zoom: number;
  onMapReady: (map: L.Map) => void;
}> = ({ center, zoom, onMapReady }) => {
  const map = useMap();
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2, easeLinearity: 0.25 });
  }, [center, zoom, map]);

  return null;
};

// 360 Panoramic Campus Landmarks Data
const PANORAMIC_SPOTS = [
  {
    id: 'spot-main-gate',
    name: 'Gate 1 & Main Avenue (NH-05)',
    description: 'Grand gateway entrance to Chandigarh University campus on NH-05 highway with security plazas and palm boulevards.',
    category: 'Entrance',
    lat: 30.7715,
    lng: 76.5750,
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=85',
  },
  {
    id: 'spot-fountain-chowk',
    name: 'Central Fountain Chowk & Academic Plaza',
    description: 'The iconic central crossroads linking Academic Blocks A1, A2, B1, and the Central Library.',
    category: 'Plaza',
    lat: 30.7685,
    lng: 76.5742,
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1600&auto=format&fit=crop&q=85',
  },
  {
    id: 'spot-d6-plaza',
    name: 'D6 Student Centre & Open Food Court',
    description: 'Bustling multi-storey food hub with cafes, stationery stores, open-air seating, and student lounges.',
    category: 'Student Hub',
    lat: 30.7674,
    lng: 76.5740,
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&auto=format&fit=crop&q=85',
  },
  {
    id: 'spot-academic-block1',
    name: 'Academic Block 1 (A1 - CSE & IT Flagship Tower)',
    description: 'State-of-the-art computer science laboratories, AI research centers, and smart auditoriums.',
    category: 'Academic',
    lat: 30.7695,
    lng: 76.5748,
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=85',
  },
  {
    id: 'spot-library',
    name: 'Central Knowledge Resource Centre (Library)',
    description: 'Multi-level library with over 150,000 reference books, digital research labs, and silent reading zones.',
    category: 'Library',
    lat: 30.7689,
    lng: 76.5736,
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1600&auto=format&fit=crop&q=85',
  },
  {
    id: 'spot-sports-arena',
    name: 'Indoor Sports Complex & Cricket Stadium',
    description: 'Olympic swimming pool, badminton arenas, floodlit cricket ground, and fitness center.',
    category: 'Sports',
    lat: 30.7668,
    lng: 76.5710,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&auto=format&fit=crop&q=85',
  },
];

// Custom DivIcons
const createCustomIcon = (bgColor: string, emoji: string) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="
        background: ${bgColor};
        width: 32px;
        height: 32px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #09090B;
        box-shadow: 0 6px 16px rgba(0,0,0,0.6);
        border: 2px solid rgba(255,255,255,0.3);
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <span style="font-size: 16px;">${emoji}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

const getPoiIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'food':
    case 'cafeteria':
      return createCustomIcon('#F59E0B', '🍔');
    case 'library':
      return createCustomIcon('#38BDF8', '📚');
    case 'atm':
    case 'bank':
      return createCustomIcon('#10B981', '💳');
    case 'medical':
    case 'health':
      return createCustomIcon('#F87171', '🏥');
    case 'sports':
      return createCustomIcon('#A855F7', '⚽');
    default:
      return createCustomIcon('#A3E635', '📍');
  }
};

const cartIcon = L.divIcon({
  className: 'cart-icon',
  html: `
    <div style="
      background: #A3E635;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000;
      font-size: 18px;
      border: 3px solid #18181B;
      box-shadow: 0 0 20px rgba(163, 230, 53, 0.9);
      animation: pulseGlow 2s infinite;
      cursor: pointer;
    ">
      🛺
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

// Live GPS User Location Blue Beacon Icon
const userLocationIcon = L.divIcon({
  className: 'user-gps-icon',
  html: `
    <div style="position: relative; width: 32px; height: 32px; display: flex; items: center; justify-content: center;">
      <div style="
        position: absolute;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(59, 130, 246, 0.35);
        animation: pulseGlow 1.8s infinite ease-out;
      "></div>
      <div style="
        position: absolute;
        top: 6px;
        left: 6px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #3B82F6;
        border: 3px solid #FFFFFF;
        box-shadow: 0 0 12px rgba(59, 130, 246, 0.9);
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

export const CampusMap: React.FC<CampusMapProps> = ({
  buildings,
  pois,
  carts,
  activeRoute,
  selectedBuilding,
  onSelectBuilding,
  onNavigateTo,
  centerCoords,
  zoomLevel,
  userLocation,
}) => {
  const [viewMode, setViewMode] = useState<MapViewMode>('satellite');
  const [is3D, setIs3D] = useState<boolean>(false);
  const [tiltAngle, setTiltAngle] = useState<number>(0);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  
  // 360 Panoramic View Modal State
  const [active360Spot, setActive360Spot] = useState<typeof PANORAMIC_SPOTS[0] | null>(null);
  const [panoRotation, setPanoRotation] = useState<number>(0);

  const getTileLayer = () => {
    switch (viewMode) {
      case 'satellite':
      case '3d':
        return (
          <TileLayer
            key={`satellite-${viewMode}`}
            attribution='&copy; Google Maps Satellite Imagery &copy; OpenStreetMap contributors'
            url="https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            subdomains={['0', '1', '2', '3']}
            maxZoom={20}
          />
        );
      case 'streets':
        return (
          <TileLayer
            key="streets-layer"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        );
      case 'dark':
      default:
        return (
          <TileLayer
            key="dark-layer"
            attribution='&copy; Google Maps &copy; OpenStreetMap contributors'
            url="https://mt{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}"
            subdomains={['0', '1', '2', '3']}
            className="dark-map-tiles"
            maxZoom={20}
          />
        );
    }
  };

  return (
    <div className="w-full h-full relative bg-[#09090B] overflow-hidden">
      {/* 3D Perspective Map Viewport Container */}
      <div className="map-viewport-wrapper w-full h-full">
        <div
          className="map-container-3d w-full h-full"
          style={{
            transform: is3D
              ? `rotateX(${tiltAngle}deg) rotateZ(${rotationAngle}deg) scale(1.06)`
              : 'rotateX(0deg) rotateZ(0deg) scale(1)',
          }}
        >
          <MapContainer
            center={centerCoords}
            zoom={zoomLevel}
            minZoom={14}
            maxZoom={20}
            zoomControl={false}
            className="w-full h-full"
          >
            {getTileLayer()}

            <MapViewController 
              center={centerCoords} 
              zoom={zoomLevel} 
              onMapReady={(map) => setMapInstance(map)} 
            />

            {/* Live GPS User Location Marker */}
            {userLocation && (
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={userLocationIcon}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="text-xs font-bold text-blue-400 font-['Outfit']">📍 Your Live Position</h4>
                    <p className="text-[11px] text-zinc-300">
                      {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Building Markers & Polygons */}
            {buildings.map((b) => {
              const isSelected = selectedBuilding?.id === b.id;
              const floorCount = b.floors || 4;

              return (
                <React.Fragment key={b.id}>
                  {b.geometry && b.geometry.coordinates && (
                    <Polygon
                      positions={b.geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]])}
                      pathOptions={{
                        color: isSelected ? '#A3E635' : is3D ? '#38BDF8' : '#3F3F46',
                        fillColor: isSelected ? '#A3E635' : is3D ? '#0284C7' : '#18181B',
                        fillOpacity: isSelected ? 0.6 : is3D ? 0.45 : 0.65,
                        weight: isSelected ? 3.5 : is3D ? 2.5 : 1.5,
                      }}
                      eventHandlers={{
                        click: () => onSelectBuilding(b),
                      }}
                    />
                  )}

                  {b.center && (
                    <Marker
                      position={[b.center.lat, b.center.lng]}
                      icon={L.divIcon({
                        className: 'building-3d-marker',
                        html: `
                          <div class="building-3d-card group cursor-pointer" style="
                            transform: ${is3D ? `translateZ(${floorCount * 14}px)` : 'translateZ(0px)'};
                          ">
                            <div class="px-3 py-1.5 rounded-xl ${
                              isSelected
                                ? 'bg-[#A3E635] text-black font-extrabold shadow-2xl shadow-[#A3E635]/60 ring-2 ring-white scale-105'
                                : is3D
                                ? 'bg-zinc-900/95 text-white font-bold border-2 border-[#38BDF8]/80 shadow-2xl backdrop-blur-md'
                                : 'bg-zinc-900/90 text-zinc-100 font-semibold border border-zinc-700/80 shadow-xl backdrop-blur-md'
                            } text-xs whitespace-nowrap flex items-center gap-1.5">
                              <span class="w-2.5 h-2.5 rounded-full ${
                                isSelected ? 'bg-black' : is3D ? 'bg-[#38BDF8] animate-pulse' : 'bg-[#A3E635]'
                              }"></span>
                              <span>${b.short_name || b.name}</span>
                              ${
                                is3D
                                  ? `<span class="text-[9px] px-1 rounded bg-zinc-800 text-[#38BDF8] font-mono">${floorCount}F</span>`
                                  : ''
                              }
                            </div>
                          </div>
                        `,
                        iconSize: [110, 28],
                        iconAnchor: [55, 14],
                      })}
                      eventHandlers={{
                        click: () => onSelectBuilding(b),
                      }}
                    >
                      <Popup className="custom-popup">
                        <div className="p-3 max-w-xs">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <h4 className="font-bold text-sm text-white font-['Outfit']">{b.name}</h4>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-[#A3E635] font-semibold uppercase">
                              {b.category}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-300 mb-3 line-clamp-2 leading-relaxed">{b.description}</p>
                          
                          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                            <button
                              onClick={() => onSelectBuilding(b)}
                              className="flex-1 py-1.5 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-semibold transition-colors text-center"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => onNavigateTo(b.id)}
                              className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#A3E635] hover:bg-[#bef264] text-xs text-black font-bold transition-colors text-center flex items-center justify-center gap-1"
                            >
                              <span>Navigate</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </React.Fragment>
              );
            })}

            {/* POI Markers */}
            {pois.map((poi) => (
              <Marker
                key={poi.id}
                position={[poi.lat, poi.lng]}
                icon={getPoiIcon(poi.category)}
              >
                <Popup>
                  <div className="p-2.5 max-w-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-bold text-sm text-white font-['Outfit']">{poi.name}</span>
                    </div>
                    <p className="text-xs text-zinc-300 mb-2">{poi.description}</p>
                    {poi.wheelchair_accessible && (
                      <div className="flex items-center gap-1 text-[11px] text-blue-400 mb-2 font-medium">
                        <Accessibility className="w-3.5 h-3.5" />
                        <span>Wheelchair Step-Free</span>
                      </div>
                    )}
                    <button
                      onClick={() => onNavigateTo(poi.id)}
                      className="w-full py-1.5 rounded-xl bg-[#A3E635] hover:bg-[#bef264] text-xs text-black font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Directions Here</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Campus Carts */}
            {carts.map((cart) => {
              if (!cart.current_lat || !cart.current_lng) return null;
              return (
                <Marker
                  key={cart.id}
                  position={[cart.current_lat, cart.current_lng]}
                  icon={cartIcon}
                >
                  <Popup>
                    <div className="p-2.5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-bold text-sm text-white font-['Outfit']">{cart.name}</h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#A3E635]/20 text-[#A3E635] font-bold uppercase">
                          {cart.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 mb-2">
                        Driver: <span className="text-white font-medium">{cart.driver_name || 'Campus Operator'}</span>
                      </p>
                      {cart.driver_phone && (
                        <a
                          href={`tel:${cart.driver_phone}`}
                          className="block text-center py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-[#A3E635] font-bold"
                        >
                          Call {cart.driver_phone}
                        </a>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Glowing Turn-by-Turn Route Polyline */}
            {activeRoute && activeRoute.found && activeRoute.path_coordinates && activeRoute.path_coordinates.length > 0 && (
              <>
                <Polyline
                  positions={activeRoute.path_coordinates as [number, number][]}
                  pathOptions={{
                    color: activeRoute.is_accessible ? '#38BDF8' : '#A3E635',
                    weight: 10,
                    opacity: 0.5,
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                />
                <Polyline
                  positions={activeRoute.path_coordinates as [number, number][]}
                  pathOptions={{
                    color: activeRoute.is_accessible ? '#38BDF8' : '#A3E635',
                    weight: 5,
                    opacity: 0.95,
                    dashArray: '12, 10',
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                />
              </>
            )}
          </MapContainer>
        </div>
      </div>

      {/* TOP-LEVEL STATIONARY UI CONTROLS (NOT TILTED BY 3D MAP) */}
      <div className="absolute bottom-20 lg:bottom-6 right-3 lg:right-6 z-[1000] flex flex-col items-end gap-3 pointer-events-auto select-none">
        {/* 3D / 2D Quick Switcher & Perspective Controller */}
        <div className="glass-panel p-1.5 rounded-2xl shadow-2xl flex flex-col items-center gap-1.5 border border-zinc-700/60 backdrop-blur-xl">
          {/* Toggle 3D Button */}
          <button
            onClick={() => {
              const next3D = !is3D;
              setIs3D(next3D);
              if (next3D) {
                setTiltAngle(50);
                if (viewMode !== 'satellite' && viewMode !== '3d') setViewMode('3d');
              } else {
                setTiltAngle(0);
                setRotationAngle(0);
              }
            }}
            className={`px-3 py-2 rounded-xl text-xs font-black tracking-wider transition-all flex items-center gap-1.5 ${
              is3D
                ? 'bg-gradient-to-r from-[#A3E635] to-emerald-400 text-black shadow-lg shadow-[#A3E635]/30 ring-2 ring-[#A3E635]/50'
                : 'bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700'
            }`}
            title="Toggle 3D Perspective Mode"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{is3D ? '3D VIEW ON' : '2D VIEW'}</span>
          </button>

          {/* 360 Panoramic Campus Tour Launch Button */}
          <button
            onClick={() => setActive360Spot(PANORAMIC_SPOTS[0])}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/80 to-indigo-600/80 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md transition-all w-full justify-center"
            title="Open 360° Real Campus View"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span>360° View</span>
          </button>

          {/* 3D Tilt & Orbit Pitch Sliders (Visible in 3D Mode) */}
          {is3D && (
            <div className="flex flex-col gap-1.5 p-1 border-t border-zinc-750 w-full animate-in fade-in">
              <div className="flex items-center justify-between px-1 text-[10px] text-zinc-400 font-bold">
                <span>TILT: {tiltAngle}°</span>
                <button
                  onClick={() => {
                    setRotationAngle(0);
                    setTiltAngle(50);
                  }}
                  title="Reset North Compass"
                  className="hover:text-[#A3E635] transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTiltAngle((prev) => Math.min(prev + 5, 62))}
                  className="flex-1 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold"
                  title="Increase Pitch"
                >
                  +Pitch
                </button>
                <button
                  onClick={() => setTiltAngle((prev) => Math.max(prev - 5, 15))}
                  className="flex-1 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold"
                  title="Decrease Pitch"
                >
                  -Pitch
                </button>
              </div>
              <div className="flex items-center gap-1 pt-0.5">
                <button
                  onClick={() => setRotationAngle((prev) => (prev - 15) % 360)}
                  className="flex-1 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold"
                  title="Orbit Left"
                >
                  ↺ Orbit
                </button>
                <button
                  onClick={() => setRotationAngle((prev) => (prev + 15) % 360)}
                  className="flex-1 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold"
                  title="Orbit Right"
                >
                  ↻ Orbit
                </button>
              </div>
            </div>
          )}

          {/* Zoom In / Out & Recenter Controls */}
          <div className="flex flex-col gap-1 border-t border-zinc-750 pt-1 w-full">
            <button
              onClick={() => mapInstance?.zoomIn()}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all flex items-center justify-center"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => mapInstance?.zoomOut()}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all flex items-center justify-center"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIs3D(false);
                setTiltAngle(0);
                setRotationAngle(0);
                mapInstance?.flyTo([30.76858, 76.57386], 17);
              }}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-[#A3E635] text-zinc-300 hover:text-black transition-all flex items-center justify-center"
              title="Recenter Chandigarh University Campus"
            >
              <Compass className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Map Imagery Layer Switcher */}
        <div className="glass-panel p-1 rounded-2xl shadow-2xl flex items-center gap-0.5 border border-zinc-700/60">
          {[
            { id: 'satellite', emoji: '🛰️', label: 'Sat' },
            { id: '3d', emoji: '🏢', label: '3D' },
            { id: 'dark', emoji: '🌙', label: 'Dark' },
            { id: 'streets', emoji: '🗺️', label: 'Map' },
          ].map(({ id, emoji, label }) => (
            <button
              key={id}
              onClick={() => {
                setViewMode(id as MapViewMode);
                if (id === '3d') { setIs3D(true); setTiltAngle(50); }
                else { setIs3D(false); setTiltAngle(0); setRotationAngle(0); }
              }}
              className={`px-2 py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 min-w-[40px] ${
                viewMode === id
                  ? 'bg-[#A3E635] text-black shadow-md shadow-[#A3E635]/25'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
              }`}
            >
              <span className="text-base leading-none">{emoji}</span>
              <span className="text-[9px] font-bold">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 360° REAL CAMPUS PANORAMIC PREVIEW MODAL */}
      {active360Spot && (
        <div className="fixed inset-0 z-[2000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-zinc-900 rounded-3xl border border-zinc-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white font-['Outfit']">
                      360° Campus View — {active360Spot.name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#A3E635]/20 text-[#A3E635] font-bold uppercase">
                      {active360Spot.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{active360Spot.description}</p>
                </div>
              </div>
              <button
                onClick={() => setActive360Spot(null)}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 360 Interactive Panorama Viewer Simulation */}
            <div className="relative flex-1 min-h-[420px] bg-black overflow-hidden group">
              <div
                className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-100 ease-out"
                style={{
                  backgroundImage: `url(${active360Spot.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: `${50 + panoRotation}% center`,
                  height: '420px',
                }}
              >
                {/* Visual 360 Overlay HUD */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none flex flex-col justify-between p-4">
                  <div className="flex items-center justify-between text-xs text-zinc-300 font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-[#A3E635]" />
                      <span>HEADING: {((panoRotation * 3.6 + 360) % 360).toFixed(0)}°</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-cyan-400">
                      360° PHOTO SPHERE ACTIVE
                    </span>
                  </div>

                  {/* Panning Helpers */}
                  <div className="flex items-center justify-center gap-3 pointer-events-auto">
                    <button
                      onClick={() => setPanoRotation((prev) => prev - 15)}
                      className="px-4 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-white font-bold text-xs border border-white/15 backdrop-blur-md shadow-xl transition-all"
                    >
                      ◀ Rotate Left
                    </button>
                    <button
                      onClick={() => setPanoRotation((prev) => prev + 15)}
                      className="px-4 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-white font-bold text-xs border border-white/15 backdrop-blur-md shadow-xl transition-all"
                    >
                      Rotate Right ▶
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Landmark Selector Thumbnails */}
            <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 mr-1">
                Explore Spots:
              </span>
              {PANORAMIC_SPOTS.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => {
                    setActive360Spot(spot);
                    setPanoRotation(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    active360Spot.id === spot.id
                      ? 'bg-[#A3E635] text-black shadow-lg shadow-[#A3E635]/25 font-bold'
                      : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{spot.name.split('(')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
