import React from 'react';
import { Bell, Info, AlertTriangle, Calendar, X } from 'lucide-react';
import { NotificationItem } from '../../types/campus';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
}) => {
  if (!isOpen) return null;

  const getIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'event':
        return <Calendar className="w-4 h-4 text-purple-400" />;
      case 'warning':
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-[#A3E635]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[1002] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4">
      <div className="glass-panel w-full sm:max-w-md max-h-[85vh] sm:max-h-[75vh] rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-zinc-700/60 flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 pb-20 sm:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#A3E635]/20 text-[#A3E635]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">Campus Notifications</h3>
              <p className="text-[11px] text-zinc-400">Announcements & live updates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="py-3 space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">No new notifications.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-zinc-800 border border-zinc-700/60 shrink-0 mt-0.5">
                  {getIcon(n.category)}
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-xs font-bold text-white">{n.title}</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{n.body}</p>
                  <span className="text-[10px] text-zinc-500 block pt-1">
                    {new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
