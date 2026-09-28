import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Plus, Trash2, X, Bell, CheckCircle2 } from 'lucide-react';
import { Condition } from '../../types/campus';
import { api } from '../../services/api';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [pathId, setPathId] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Notification Broadcast Form
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadConditions();
    }
  }, [isOpen]);

  const loadConditions = async () => {
    try {
      const data = await api.getConditions('cu-gharaun');
      setConditions(data);
    } catch (err) {
      console.error('Failed to load conditions:', err);
    }
  };

  const handleBlockPath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pathId) return;

    setIsSubmitting(true);
    try {
      await api.createCondition(pathId, reason || 'Maintenance / Event blockage');
      setActionMessage(`Path segment '${pathId}' blocked on routing graph.`);
      setPathId('');
      setReason('');
      loadConditions();
      setTimeout(() => setActionMessage(null), 2500);
    } catch (err) {
      console.error('Failed to block path:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnblockPath = async (id: string) => {
    try {
      await api.deleteCondition(id);
      setActionMessage(`Condition removed. Route re-enabled.`);
      loadConditions();
      setTimeout(() => setActionMessage(null), 2500);
    } catch (err) {
      console.error('Failed to remove condition:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1002] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4">
      <div className="glass-panel w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-zinc-700/60 flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 pb-20 sm:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#A3E635]/20 text-[#A3E635] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit']">Admin Command Center</h2>
              <p className="text-xs text-zinc-400">Manage real-time path blockages & campus alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {actionMessage && (
          <div className="my-3 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionMessage}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-3 space-y-5 pr-1">
          {/* Block Path Form */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white font-['Outfit']">Block Path on Routing Graph</h3>
            </div>
            <form onSubmit={handleBlockPath} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Path ID (e.g. path-mg-a, path-a-b1)"
                value={pathId}
                onChange={(e) => setPathId(e.target.value)}
                required
                className="glass-input px-3.5 py-2 rounded-xl text-xs"
              />
              <input
                type="text"
                placeholder="Reason (e.g. Construction / TechFest stage)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="glass-input px-3.5 py-2 rounded-xl text-xs"
              />
              <button
                type="submit"
                disabled={isSubmitting || !pathId}
                className="sm:col-span-2 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Apply Path Blockage</span>
              </button>
            </form>
          </div>

          {/* Active Blocked Conditions List */}
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Active Path Blockages ({conditions.length})
            </span>
            {conditions.length === 0 ? (
              <p className="text-xs text-zinc-500 italic p-3 rounded-xl bg-zinc-900/50 border border-zinc-850">
                All campus paths are clear and operational.
              </p>
            ) : (
              <div className="space-y-2">
                {conditions.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#A3E635] font-semibold">{c.path_id}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                          {c.severity}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-[11px]">{c.reason}</p>
                    </div>

                    <button
                      onClick={() => handleUnblockPath(c.id)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                      title="Unblock Path"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
