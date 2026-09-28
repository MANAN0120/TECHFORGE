import React from 'react';
import { 
  Navigation, 
  Sparkles, 
  Calendar, 
  Car, 
  Store, 
  ShieldCheck, 
  Accessibility, 
  Bell,
  MapPin
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'map' | 'navigation' | 'events' | 'carts' | 'shops' | 'admin';
  setActiveTab: (tab: 'map' | 'navigation' | 'events' | 'carts' | 'shops' | 'admin') => void;
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  accessibleMode: boolean;
  setAccessibleMode: (mode: boolean) => void;
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
}

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
  return (
    <header className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between gap-4 pointer-events-none">
      {/* Brand & Campus Identifier */}
      <div className="flex items-center gap-3 glass-panel px-4 py-2.5 rounded-2xl pointer-events-auto shadow-2xl">
        <div className="w-9 h-9 rounded-xl bg-[#A3E635] flex items-center justify-center text-black font-extrabold shadow-lg shadow-[#A3E635]/20">
          <MapPin className="w-5 h-5 fill-current" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-white font-['Outfit']">SmartCampus</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30">
              CU Live
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium">Chandigarh University, Gharuan</p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="hidden md:flex items-center gap-1.5 glass-panel p-1.5 rounded-2xl pointer-events-auto shadow-2xl">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            activeTab === 'map'
              ? 'bg-[#A3E635] text-black shadow-md shadow-[#A3E635]/20'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Explore</span>
        </button>

        <button
          onClick={() => setActiveTab('navigation')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            activeTab === 'navigation'
              ? 'bg-[#A3E635] text-black shadow-md shadow-[#A3E635]/20'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Directions</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            activeTab === 'events'
              ? 'bg-[#A3E635] text-black shadow-md shadow-[#A3E635]/20'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Events</span>
        </button>

        <button
          onClick={() => setActiveTab('carts')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            activeTab === 'carts'
              ? 'bg-[#A3E635] text-black shadow-md shadow-[#A3E635]/20'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Carts</span>
        </button>

        <button
          onClick={() => setActiveTab('shops')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            activeTab === 'shops'
              ? 'bg-[#A3E635] text-black shadow-md shadow-[#A3E635]/20'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            activeTab === 'admin'
              ? 'bg-[#A3E635] text-black shadow-md shadow-[#A3E635]/20'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin</span>
        </button>
      </nav>

      {/* Right Controls: AI Assistant, Accessibility Mode, Notifications */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Wheelchair Accessibility Toggle */}
        <button
          onClick={() => setAccessibleMode(!accessibleMode)}
          title="Toggle Wheelchair / Step-Free Navigation"
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 glass-panel shadow-lg ${
            accessibleMode
              ? 'bg-blue-600/30 text-blue-400 border-blue-500/50 shadow-blue-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Accessibility className="w-4 h-4" />
          <span className="hidden sm:inline">Accessible</span>
        </button>

        {/* Notifications Button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-2xl glass-panel text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all shadow-lg"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#A3E635] text-black text-[10px] font-extrabold rounded-full flex items-center justify-center">
              {unreadNotifsCount}
            </span>
          )}
        </button>

        {/* AI Assistant Button */}
        <button
          onClick={() => setIsAssistantOpen(!isAssistantOpen)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#A3E635] to-[#84cc16] text-black font-bold text-xs shadow-lg shadow-[#A3E635]/25 hover:brightness-110 active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>AI Assistant</span>
        </button>
      </div>
    </header>
  );
};
