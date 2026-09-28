import React, { useState, useEffect } from 'react';
import { Siren, ShieldCheck, PhoneCall, PackageSearch, Heart, Building, Shield } from 'lucide-react';
import { SOSModal } from '../features/sos/SOSModal';
import { SafePointsList } from '../features/sos/SafePointsList';
import { EmergencyContacts } from '../features/sos/EmergencyContacts';
import { SafePoint, EmergencyContact } from '../features/sos/types';
import { api } from '../services/api';
import { LostFoundBoard } from '../features/lostfound/LostFoundBoard';

interface SafetyPageProps {
  onNavigateToLocation?: (lat: number, lng: number, label: string) => void;
}

export const SafetyPage: React.FC<SafetyPageProps> = ({ onNavigateToLocation }) => {
  const [activeTab, setActiveTab] = useState<'safety' | 'lostfound'>('safety');
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [safePoints, setSafePoints] = useState<SafePoint[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSafetyData() {
      setLoading(true);
      try {
        // Fetch emergency contacts via SOS trigger preview or campus info
        const info = await api.getCampusInfo('cu-gharaun');
        if (info && info.emergency_contacts) {
          setContacts(info.emergency_contacts);
        } else {
          setContacts([
            { label: 'Campus Security Plaza', phone: '+91-160-301-1234' },
            { label: 'Health Centre', phone: '+91-160-301-5678' },
            { label: "Women's Safety Helpline", phone: '1091' },
          ]);
        }

        // Fetch safe points near main gate (30.7715, 76.5750)
        const sps = await api.getSafePoints(30.7715, 76.5750, 'cu-gharaun');
        if (Array.isArray(sps)) setSafePoints(sps);
      } catch {
        // Fallback default
      } finally {
        setLoading(false);
      }
    }
    loadSafetyData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Tab Selector */}
      <div className="flex p-1 bg-surface rounded-2xl border border-border">
        <button
          onClick={() => setActiveTab('safety')}
          className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'safety' ? 'bg-primary text-black shadow-md' : 'text-secondary hover:text-foreground'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Campus SOS & Safety</span>
        </button>
        <button
          onClick={() => setActiveTab('lostfound')}
          className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'lostfound' ? 'bg-primary text-black shadow-md' : 'text-secondary hover:text-foreground'
          }`}
        >
          <PackageSearch className="w-4 h-4" />
          <span>Lost & Found Board</span>
        </button>
      </div>

      {activeTab === 'safety' ? (
        <div className="space-y-6 animate-fade-in">
          {/* Main SOS Trigger Hero Card */}
          <div className="bg-surface border border-error/30 rounded-3xl p-6 text-center space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-error/10 via-transparent to-transparent pointer-events-none" />

            <div className="w-20 h-20 mx-auto rounded-full bg-error/20 border-2 border-error/50 flex items-center justify-center text-error animate-pulse shadow-lg">
              <Siren className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-foreground">Emergency SOS Hotline</h2>
              <p className="text-xs text-secondary mt-1 max-w-md mx-auto">
                One-tap instant emergency alert to Chandigarh University security and medical responders.
              </p>
            </div>

            <button
              onClick={() => setIsSOSModalOpen(true)}
              className="w-full max-w-sm py-4 bg-error hover:bg-error/90 text-white font-extrabold text-base rounded-2xl shadow-xl transition-all active:scale-98 flex items-center justify-center space-x-2 mx-auto"
            >
              <Siren className="w-6 h-6 animate-bounce" />
              <span>TRIGGER EMERGENCY SOS</span>
            </button>

            <p className="text-[11px] text-secondary">
              GPS location is transmitted securely to campus security upon confirmation.
            </p>
          </div>

          {/* Safe Points & Contacts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm space-y-4">
              <SafePointsList
                safePoints={safePoints}
                onSelectSafePoint={(sp) => {
                  if (onNavigateToLocation) onNavigateToLocation(sp.lat, sp.lng, sp.name);
                }}
              />
            </div>

            <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm space-y-4">
              <EmergencyContacts contacts={contacts} />
            </div>
          </div>

          <SOSModal
            isOpen={isSOSModalOpen}
            onClose={() => setIsSOSModalOpen(false)}
            onSelectSafePointOnMap={(sp) => {
              if (onNavigateToLocation) onNavigateToLocation(sp.lat, sp.lng, sp.name);
            }}
          />
        </div>
      ) : (
        <LostFoundBoard onNavigateToLocation={onNavigateToLocation} />
      )}
    </div>
  );
};
