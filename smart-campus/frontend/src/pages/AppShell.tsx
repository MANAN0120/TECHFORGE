import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar/Navbar';
import { CampusMap } from '../components/Map/CampusMap';
import { SearchBar } from '../components/Search/SearchBar';
import { RoutePlanner } from '../components/Navigation/RoutePlanner';
import { AssistantDrawer } from '../components/Assistant/AssistantDrawer';
import { EventsModal } from '../components/Events/EventsModal';
import { CartsModal } from '../components/Carts/CartsModal';
import { ShopsModal } from '../components/Shops/ShopsModal';
import { AdminModal } from '../components/Admin/AdminModal';
import { BuildingDetailModal } from '../components/BuildingDetail/BuildingDetailModal';
import { NotificationsModal } from '../components/Notifications/NotificationsModal';
import { MeetupPage } from './MeetupPage';
import { SchedulePage } from './SchedulePage';
import { SafetyPage } from './SafetyPage';
import { api } from '../services/api';
import { MapLayersProvider } from '../features/map/layers/useMapLayers';
import { Building, POI, Cart, RouteData, NotificationItem, SearchItem } from '../types/campus';

export function AppShell() {
  const [activeTab, setActiveTab] = useState<'map' | 'navigation' | 'schedule' | 'meetup' | 'events' | 'carts' | 'shops' | 'safety' | 'admin'>('map');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accessibleMode, setAccessibleMode] = useState(false);

  // Campus Data State
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [pois, setPois] = useState<POI[]>([]);
  const [carts, setCarts] = useState<Cart[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  // Real-time User GPS Location State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Map View State (Chandigarh University Campus Center)
  const [centerCoords, setCenterCoords] = useState<[number, number]>([30.76858, 76.57386]);
  const [zoomLevel, setZoomLevel] = useState<number>(17);

  // Routing State
  const [activeRoute, setActiveRoute] = useState<RouteData | null>(null);
  const [navDestinationId, setNavDestinationId] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
    detectUserGPS();
    checkDeepLinkToParam();
    const interval = setInterval(refreshLiveCarts, 10000); // 10s live cart sync
    return () => clearInterval(interval);
  }, []);

  const checkDeepLinkToParam = () => {
    const params = new URLSearchParams(window.location.search);
    const toParam = params.get('to');
    if (toParam) {
      setNavDestinationId(toParam);
      setActiveTab('navigation');
    }
  };

  const detectUserGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.log('GPS autodetect info:', err.message);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  };

  const loadInitialData = async () => {
    try {
      const [bData, pData, cData, nData] = await Promise.all([
        api.getBuildings('cu-gharaun'),
        api.getPOIs('cu-gharaun'),
        api.getCarts('cu-gharaun'),
        api.getNotifications('cu-gharaun'),
      ]);
      setBuildings(bData.buildings || []);
      setPois(pData.pois || []);
      setCarts(cData || []);
      setNotifications(nData || []);
    } catch (err) {
      console.error('Failed to load initial campus data:', err);
    }
  };

  const refreshLiveCarts = async () => {
    try {
      const cData = await api.getCarts('cu-gharaun');
      setCarts(cData || []);
    } catch (err) {
      // Background poll fail silent
    }
  };

  const handleSelectSearchItem = (item: SearchItem) => {
    if (item.lat && item.lng) {
      setCenterCoords([item.lat, item.lng]);
      setZoomLevel(18);
    }
    if (item.type === 'building') {
      const found = buildings.find((b) => b.id === item.id);
      if (found) setSelectedBuilding(found);
    }
  };

  const handleStartNavigationTo = (destId: string) => {
    setNavDestinationId(destId);
    setActiveTab('navigation');
  };

  const handleFlyTo = (lat: number, lng: number) => {
    setCenterCoords([lat, lng]);
    setZoomLevel(18);
  };

  // Map controls sidebar open state
  const [isMapControlsOpen, setIsMapControlsOpen] = useState(false);

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-[#09090B]">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAssistantOpen={isAssistantOpen}
        setIsAssistantOpen={setIsAssistantOpen}
        accessibleMode={accessibleMode}
        setAccessibleMode={setAccessibleMode}
        unreadNotifsCount={notifications.filter((n) => n.read === 0).length}
        onOpenNotifications={() => setNotificationsOpen(true)}
        hideRightDock={isMapControlsOpen}
      />
      {/* Main Interactive Map — fills full screen */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <MapLayersProvider campusData={{ buildings, pois, carts }}>
          <CampusMap
            buildings={buildings}
            pois={pois}
            carts={carts}
            activeRoute={activeRoute}
            selectedBuilding={selectedBuilding}
            onSelectBuilding={(b) => setSelectedBuilding(b)}
            onNavigateTo={handleStartNavigationTo}
            centerCoords={centerCoords}
            zoomLevel={zoomLevel}
            userLocation={userLocation}
            isControlsOpen={isMapControlsOpen}
            onToggleControls={setIsMapControlsOpen}
          />
          {/* Instant Search Bar (Active on Map View) - positioned below header */}
          {activeTab === 'map' && (
            <SearchBar
              onSelectItem={handleSelectSearchItem}
              onNavigateTo={handleStartNavigationTo}
            />
          )}
        </MapLayersProvider>
      </div>

      {/* Navigation & Turn-by-Turn Panel */}
      {activeTab === 'navigation' && (
        <RoutePlanner
          buildings={buildings}
          prefilledDestination={navDestinationId}
          activeRoute={activeRoute}
          setActiveRoute={setActiveRoute}
          accessibleMode={accessibleMode}
          setAccessibleMode={setAccessibleMode}
          onClose={() => setActiveTab('map')}
          userLocation={userLocation}
          onUpdateUserLocation={(loc) => setUserLocation(loc)}
        />
      )}

      {/* Class Schedule Auto-Pilot Page */}
      {activeTab === 'schedule' && (
        <div className="absolute inset-0 z-[950]">
          <SchedulePage
            userLocation={userLocation}
            onNavigateToBuilding={(bId) => handleStartNavigationTo(bId)}
          />
        </div>
      )}

      {/* Smart Meetup Point Page */}
      {activeTab === 'meetup' && (
        <div className="absolute inset-0 z-[950]">
          <MeetupPage
            onNavigateToSpot={(spotId) => handleStartNavigationTo(spotId)}
          />
        </div>
      )}

      {/* Campus Safety & Lost & Found Page */}
      {activeTab === 'safety' && (
        <div className="absolute inset-0 z-[950] overflow-y-auto pt-20 pb-20 bg-[#09090B]">
          <SafetyPage
            onNavigateToLocation={(lat, lng) => {
              setCenterCoords([lat, lng]);
              setZoomLevel(18);
              setActiveTab('map');
            }}
          />
        </div>
      )}

      {/* AI Assistant Drawer */}
      <AssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onNavigateTo={(id) => {
          setIsAssistantOpen(false);
          handleStartNavigationTo(id);
        }}
      />

      {/* Events Modal */}
      <EventsModal
        isOpen={activeTab === 'events'}
        onClose={() => setActiveTab('map')}
        onNavigateTo={handleStartNavigationTo}
      />

      {/* Carts Modal */}
      <CartsModal
        isOpen={activeTab === 'carts'}
        onClose={() => setActiveTab('map')}
        onFlyTo={handleFlyTo}
      />

      {/* Shops & Directory Modal */}
      <ShopsModal
        isOpen={activeTab === 'shops'}
        onClose={() => setActiveTab('map')}
        onNavigateTo={handleStartNavigationTo}
        userLocation={userLocation}
      />

      {/* Admin Operations Modal */}
      <AdminModal
        isOpen={activeTab === 'admin'}
        onClose={() => setActiveTab('map')}
      />

      {/* Building Details Modal */}
      <BuildingDetailModal
        building={selectedBuilding}
        onClose={() => setSelectedBuilding(null)}
        onNavigateTo={handleStartNavigationTo}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
      />
    </div>
  );
}
