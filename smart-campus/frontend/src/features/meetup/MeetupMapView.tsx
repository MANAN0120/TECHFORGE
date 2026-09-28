import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Share2, Navigation, ArrowLeft, Check, MapPin, Clock, Footprints } from 'lucide-react';
import { MeetupSuggestion, PersonLocation } from '../../types/meetup';
import { api } from '../../services/api';
import { RouteData } from '../../types/campus';

interface MeetupMapViewProps {
  personA: PersonLocation;
  personB: PersonLocation;
  selectedSpot: MeetupSuggestion;
  onBack: () => void;
  onNavigateToSpot: (spotId: string) => void;
}

// Controller to focus map view to bound all three points (Person A, Person B, Meetup Spot)
const MapBoundsController: React.FC<{
  coords: [number, number][];
}> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      const bounds = L.latLngBounds(coords.map((c) => L.latLng(c[0], c[1])));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 18 });
    }
  }, [coords, map]);
  return null;
};

// Custom Leaflet Icons
const createPersonIcon = (bgColor: string, label: string) => {
  return L.divIcon({
    className: 'meetup-person-icon',
    html: `
      <div style="
        background: ${bgColor};
        color: #000;
        font-weight: 800;
        font-size: 11px;
        padding: 4px 10px;
        border-radius: 20px;
        border: 2px solid #FFFFFF;
        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 4px;
      ">
        <span>📍 ${label}</span>
      </div>
    `,
    iconSize: [80, 26],
    iconAnchor: [40, 13],
  });
};

const spotIcon = L.divIcon({
  className: 'meetup-spot-icon',
  html: `
    <div style="
      background: #A3E635;
      color: #000;
      font-weight: 900;
      font-size: 14px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 3.5px solid #09090B;
      box-shadow: 0 0 24px rgba(163, 230, 53, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulseGlow 2s infinite ease-out;
    ">
      ☕
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

export const MeetupMapView: React.FC<MeetupMapViewProps> = ({
  personA,
  personB,
  selectedSpot,
  onBack,
  onNavigateToSpot,
}) => {
  const [routeA, setRouteA] = useState<RouteData | null>(null);
  const [routeB, setRouteB] = useState<RouteData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, [personA, personB, selectedSpot]);

  const fetchRoutes = async () => {
    try {
      const [rA, rB] = await Promise.all([
        api.calculateRoute(null, selectedSpot.poi_id, 'walk', { lat: personA.lat, lng: personA.lng }, { lat: selectedSpot.lat, lng: selectedSpot.lng }),
        api.calculateRoute(null, selectedSpot.poi_id, 'walk', { lat: personB.lat, lng: personB.lng }, { lat: selectedSpot.lat, lng: selectedSpot.lng }),
      ]);
      setRouteA(rA);
      setRouteB(rB);
    } catch (err) {
      console.error('Failed to compute route polylines for map view:', err);
    }
  };

  const handleShare = () => {
    const text = `Hey! Let's meet at ${selectedSpot.name} on campus. It's about ${Math.max(1, Math.round(selectedSpot.walk_time_a / 60))} min walk for you and ${Math.max(1, Math.round(selectedSpot.walk_time_b / 60))} min for me!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const allCoords: [number, number][] = [
    [personA.lat, personA.lng],
    [personB.lat, personB.lng],
    [selectedSpot.lat, selectedSpot.lng],
  ];

  return (
    <div className="relative w-full h-full bg-[#09090B] overflow-hidden">
      {/* Top Back Navigation Bar */}
      <div className="absolute top-4 left-4 z-[1000] pointer-events-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#18181B]/90 border border-[#3F3F46] text-[#FAFAFA] font-bold text-xs shadow-2xl backdrop-blur-md hover:bg-zinc-800 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-[#A3E635]" />
          <span>Back to Suggestions</span>
        </button>
      </div>

      {/* Map View */}
      <MapContainer
        center={[selectedSpot.lat, selectedSpot.lng]}
        zoom={17}
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; Google Maps Satellite'
          url="https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          subdomains={['0', '1', '2', '3']}
          maxZoom={20}
        />

        <MapBoundsController coords={allCoords} />

        {/* Person A Marker */}
        <Marker position={[personA.lat, personA.lng]} icon={createPersonIcon('#A3E635', personA.label || 'You')}>
          <Popup>
            <div className="p-2 text-xs font-bold text-black">
              You starting from: {personA.label || 'GPS'}
            </div>
          </Popup>
        </Marker>

        {/* Person B Marker */}
        <Marker position={[personB.lat, personB.lng]} icon={createPersonIcon('#60A5FA', personB.label || 'Friend')}>
          <Popup>
            <div className="p-2 text-xs font-bold text-black">
              Friend starting from: {personB.label || 'Location'}
            </div>
          </Popup>
        </Marker>

        {/* Meetup Spot Marker */}
        <Marker position={[selectedSpot.lat, selectedSpot.lng]} icon={spotIcon}>
          <Popup>
            <div className="p-2 text-xs font-bold text-white">
              📍 {selectedSpot.name}
            </div>
          </Popup>
        </Marker>

        {/* Route A Polyline (Lime) */}
        {routeA && routeA.path_coordinates && routeA.path_coordinates.length > 0 && (
          <Polyline
            positions={routeA.path_coordinates as [number, number][]}
            pathOptions={{
              color: '#A3E635',
              weight: 6,
              opacity: 0.9,
              lineCap: 'round',
            }}
          />
        )}

        {/* Route B Polyline (Blue) */}
        {routeB && routeB.path_coordinates && routeB.path_coordinates.length > 0 && (
          <Polyline
            positions={routeB.path_coordinates as [number, number][]}
            pathOptions={{
              color: '#60A5FA',
              weight: 6,
              opacity: 0.9,
              dashArray: '8, 8',
              lineCap: 'round',
            }}
          />
        )}
      </MapContainer>

      {/* Bottom Floating Info Card */}
      <div className="absolute bottom-20 lg:bottom-6 left-3 right-3 sm:left-4 sm:right-auto z-[1000] sm:w-96 bg-[#18181B] border border-[#3F3F46] p-4 rounded-3xl shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-[#A3E635]/20 text-[#A3E635] tracking-wider">
                {selectedSpot.category}
              </span>
              <span className="text-[11px] text-zinc-400 font-semibold">Equidistant Meetup Spot</span>
            </div>
            <h3 className="text-base font-extrabold text-[#FAFAFA] font-['Outfit'] mt-1">
              {selectedSpot.name}
            </h3>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs p-2.5 rounded-2xl bg-[#27272A]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#A3E635]" />
            <span className="text-[#FAFAFA] font-bold">
              You: <span className="text-[#A3E635]">{Math.max(1, Math.round(selectedSpot.walk_time_a / 60))} min</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Footprints className="w-4 h-4 text-blue-400" />
            <span className="text-[#FAFAFA] font-bold">
              Friend: <span className="text-blue-400">{Math.max(1, Math.round(selectedSpot.walk_time_b / 60))} min</span>
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => onNavigateToSpot(selectedSpot.poi_id)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#A3E635] hover:bg-[#bef264] text-black font-extrabold text-xs shadow-lg shadow-[#A3E635]/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5 fill-current" />
            <span>Directions for You</span>
          </button>

          <button
            onClick={handleShare}
            className="py-2.5 px-3.5 rounded-xl bg-[#27272A] hover:bg-zinc-700 text-[#FAFAFA] font-bold text-xs border border-zinc-700 transition-all flex items-center justify-center gap-1.5"
            title="Copy Meetup Summary text"
          >
            {copied ? <Check className="w-4 h-4 text-[#A3E635]" /> : <Share2 className="w-4 h-4 text-zinc-300" />}
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
