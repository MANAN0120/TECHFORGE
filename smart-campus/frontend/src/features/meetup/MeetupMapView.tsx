import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Share2, Navigation, ArrowLeft, Check, Clock, Users } from 'lucide-react';
import { MeetupSuggestion, PersonLocation } from '../../types/meetup';
import { api } from '../../services/api';
import { RouteData } from '../../types/campus';

interface MeetupMapViewProps {
  participants: PersonLocation[];
  selectedSpot: MeetupSuggestion;
  onBack: () => void;
  onNavigateToSpot: (spotId: string) => void;
}

const COLOR_PALETTE = ['#A3E635', '#60A5FA', '#C084FC', '#FBBF24', '#2DD4BF', '#F472B6'];

// Controller to fit map bounds around all participant locations and meetup spot
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

// Custom DivIcon for group members
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
      width: 46px;
      height: 46px;
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
  iconSize: [46, 46],
  iconAnchor: [23, 23],
});

export const MeetupMapView: React.FC<MeetupMapViewProps> = ({
  participants,
  selectedSpot,
  onBack,
  onNavigateToSpot,
}) => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchGroupRoutes();
  }, [participants, selectedSpot]);

  const fetchGroupRoutes = async () => {
    try {
      const routePromises = participants.map((p) =>
        api.calculateRoute(
          null,
          selectedSpot.poi_id,
          'walk',
          { lat: p.lat, lng: p.lng },
          { lat: selectedSpot.lat, lng: selectedSpot.lng }
        )
      );
      const resList = await Promise.all(routePromises);
      setRoutes(resList);
    } catch (err) {
      console.error('Failed to compute group route polylines:', err);
    }
  };

  const handleShareGroup = () => {
    const walkSummary = (selectedSpot.participant_routes || []).map(r => `${r.label}: ${Math.max(1, Math.round(r.walk_time_seconds / 60))}m`).join(', ');
    const text = `Hey group! Let's all meet at ${selectedSpot.name} on campus. Walk times: ${walkSummary}.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const allCoords: [number, number][] = [
    ...participants.map((p) => [p.lat, p.lng] as [number, number]),
    [selectedSpot.lat, selectedSpot.lng],
  ];

  const participantRouteList = selectedSpot.participant_routes || participants.map((p, i) => ({
    label: p.label || `Member ${i + 1}`,
    walk_time_seconds: i === 0 ? selectedSpot.walk_time_a : selectedSpot.walk_time_b,
    distance_meters: i === 0 ? selectedSpot.distance_a : selectedSpot.distance_b,
  }));

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

        {/* Group Participants Markers */}
        {participants.map((p, idx) => (
          <Marker
            key={idx}
            position={[p.lat, p.lng]}
            icon={createPersonIcon(COLOR_PALETTE[idx % COLOR_PALETTE.length], p.label || `Member ${idx + 1}`)}
          >
            <Popup>
              <div className="p-2 text-xs font-bold text-black">
                {p.label || `Member ${idx + 1}`} starting location
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Meetup Spot Marker */}
        <Marker position={[selectedSpot.lat, selectedSpot.lng]} icon={spotIcon}>
          <Popup>
            <div className="p-2 text-xs font-bold text-white">
              📍 {selectedSpot.name} ({selectedSpot.category})
            </div>
          </Popup>
        </Marker>

        {/* Participant Route Polylines */}
        {routes.map((rt, idx) => {
          if (!rt || !rt.path_coordinates || rt.path_coordinates.length === 0) return null;
          return (
            <Polyline
              key={idx}
              positions={rt.path_coordinates as [number, number][]}
              pathOptions={{
                color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
                weight: 6,
                opacity: 0.95,
                lineCap: 'round',
              }}
            />
          );
        })}
      </MapContainer>

      {/* Bottom Floating Info Card */}
      <div className="absolute bottom-20 lg:bottom-6 left-3 right-3 sm:left-4 sm:right-auto z-[1000] sm:w-[420px] bg-[#18181B] border border-[#3F3F46] p-4 rounded-3xl shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-[#A3E635]/20 text-[#A3E635] tracking-wider">
                {selectedSpot.category}
              </span>
              <span className="text-[11px] text-zinc-400 font-semibold">
                Group Spot for {participants.length} Friends
              </span>
            </div>
            <h3 className="text-base font-extrabold text-[#FAFAFA] font-['Outfit'] mt-1">
              {selectedSpot.name}
            </h3>
          </div>
        </div>

        {/* Group Walk Times */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-2xl bg-[#27272A] border border-zinc-800 max-h-32 overflow-y-auto">
          {participantRouteList.map((p, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase truncate">
                {p.label || `Member ${idx + 1}`}
              </span>
              <span
                className="text-xs font-extrabold font-['Outfit']"
                style={{ color: COLOR_PALETTE[idx % COLOR_PALETTE.length] }}
              >
                {Math.max(1, Math.round(p.walk_time_seconds / 60))} min walk
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => onNavigateToSpot(selectedSpot.poi_id)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#A3E635] hover:bg-[#bef264] text-black font-extrabold text-xs shadow-lg shadow-[#A3E635]/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5 fill-current" />
            <span>Directions for You</span>
          </button>

          <button
            onClick={handleShareGroup}
            className="py-2.5 px-3.5 rounded-xl bg-[#27272A] hover:bg-zinc-700 text-[#FAFAFA] font-bold text-xs border border-zinc-700 transition-all flex items-center justify-center gap-1.5"
            title="Copy Group Meetup Summary"
          >
            {copied ? <Check className="w-4 h-4 text-[#A3E635]" /> : <Share2 className="w-4 h-4 text-zinc-300" />}
            <span>{copied ? 'Copied!' : 'Share Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
