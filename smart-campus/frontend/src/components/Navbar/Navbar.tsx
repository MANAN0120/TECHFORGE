import React from 'react';
import { 
  Navigation, 
  Sparkles, 
  Bot,
  Calendar, 
  Car, 
  Store, 
  ShieldCheck, 
  Accessibility, 
  Bell,
  MapPin,
  Users,
  CalendarClock,
  Menu,
  X
} from 'lucide-react';

import { SOSButton } from '../../features/sos/SOSButton';

interface NavbarProps {
  activeTab: 'map' | 'navigation' | 'schedule' | 'meetup' | 'events' | 'carts' | 'shops' | 'safety' | 'admin';
  setActiveTab: (tab: 'map' | 'navigation' | 'schedule' | 'meetup' | 'events' | 'carts' | 'shops' | 'safety' | 'admin') => void;
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  accessibleMode: boolean;
  setAccessibleMode: (mode: boolean) => void;
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
}

const NAV_ITEMS: { id: string; icon: any; label: string }[] = [
  { id: 'map', icon: MapPin, label: 'Explore' },
  { id: 'navigation', icon: Navigation, label: 'Directions' },
  { id: 'schedule', icon: CalendarClock, label: 'Schedule' },
  { id: 'meetup', icon: Users, label: 'Meetup' },
  { id: 'safety', icon: ShieldCheck, label: 'Safety' },
  { id: 'events', icon: Calendar, label: 'Events' },
  { id: 'carts', icon: Car, label: 'Carts' },
  { id: 'shops', icon: Store, label: 'Directory' },
  { id: 'admin', icon: ShieldCheck, label: 'Admin' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAssistantOpen,
  setIsAssistantOpen,
  accessibleMode,
  setAccessibleMode,
  unreadNotifsCount,
  onOpenNotifications,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <>
      {/* Top Header Bar */}
      <header className="fixed top-3 left-3 right-3 lg:top-4 lg:left-4 lg:right-4 z-[1000] flex items-center justify-between gap-2 sm:gap-4 pointer-events-none shrink-0">
        {/* Brand & Campus Identifier */}
        <div className="flex items-center gap-2 sm:gap-3 glass-panel px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl pointer-events-auto shadow-2xl shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#A3E635] flex items-center justify-center text-black font-extrabold shadow-lg shadow-[#A3E635]/20">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-sm sm:text-base tracking-tight text-white font-['Outfit']">SmartCampus</span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1 sm:px-1.5 py-0.5 rounded-md bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30">
                CU Live
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium hidden xs:block">Chandigarh University, Gharuan</p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 glass-panel p-1.5 rounded-2xl pointer-events-auto shadow-2xl">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === id
                  ? 'bg-[#A3E635] text-black shadow-md shadow-[#A3E635]/20'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Mobile Hamburger (on top right header) */}
        <div className="flex items-center gap-2 pointer-events-auto lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-2xl glass-panel text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all shadow-lg"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Floating Right Sidebar Action Dock (Always visible & fixed on screen right side) */}
      <aside className="fixed right-3 top-20 sm:right-4 sm:top-24 z-[990] flex flex-col items-end gap-2.5 pointer-events-auto">
        {/* AI Assistant Button (Small Circular Robotic Icon) */}
        <button
          onClick={() => setIsAssistantOpen(!isAssistantOpen)}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A3E635] to-[#84cc16] text-black shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all border border-[#A3E635]/50 group"
          title="Open AI Campus Assistant"
        >
          <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        </button>

        {/* Notifications Button */}
        <button
          onClick={onOpenNotifications}
          className="relative flex items-center justify-center p-3 rounded-2xl glass-panel text-zinc-200 hover:text-white hover:bg-zinc-800/90 transition-all shadow-xl border border-zinc-700/60 active:scale-95"
          title="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadNotifsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#A3E635] text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
              {unreadNotifsCount}
            </span>
          )}
        </button>

        {/* Emergency SOS Button */}
        <SOSButton />
      </aside>

      {/* Mobile & Tablet Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[1000] glass-panel border-t border-zinc-700/60 shadow-2xl safe-area-bottom">
        <div className="flex items-stretch justify-around h-16">
          {NAV_ITEMS.slice(0, 5).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id as any);
                setMobileMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center gap-1 flex-1 text-[11px] font-semibold transition-all duration-200 ${
                activeTab === id
                  ? 'text-[#A3E635]'
                  : 'text-zinc-500 active:text-zinc-300'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                activeTab === id ? 'bg-[#A3E635]/15' : ''
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="leading-none">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile slide-down menu (full menu when hamburger tapped) */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute top-16 left-3 right-3 glass-panel rounded-2xl p-3 shadow-2xl border border-zinc-700/60 animate-in slide-in-from-top-2 duration-200 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id as any);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === id
                    ? 'bg-[#A3E635] text-black shadow-md shadow-[#A3E635]/20'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
