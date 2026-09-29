import React, { useState, useEffect } from 'react';
import { Siren, X, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { useSOS } from './useSOS';
import { SafePointsList } from './SafePointsList';
import { EmergencyContacts } from './EmergencyContacts';
import { SafePoint } from './types';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSafePointOnMap?: (sp: SafePoint) => void;
}

export const SOSModal: React.FC<SOSModalProps> = ({ isOpen, onClose, onSelectSafePointOnMap }) => {
  const { state, response, errorMsg, startConfirm, trigger, reset } = useSOS();
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && state === 'idle') {
      startConfirm();
    }
  }, [isOpen, state, startConfirm]);

  // Handle countdown when user taps "SEND ALERT"
  const handleInitiateSend = () => {
    setCountdown(2); // 1.5s countdown (2 ticks)
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      trigger();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 750);

    return () => clearTimeout(timer);
  }, [countdown, trigger]);

  const handleCancelCountdown = () => {
    setCountdown(null);
  };

  const handleCloseModal = () => {
    setCountdown(null);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden p-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleCloseModal}
          className="absolute top-4 right-4 p-2 text-secondary hover:text-foreground rounded-full hover:bg-surface2 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* State 1: Confirm */}
        {state === 'confirming' && (
          <div className="space-y-5 text-center py-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-error/15 border-2 border-error/40 flex items-center justify-center text-error animate-pulse">
              <Siren className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground">Emergency SOS Alert</h3>
              <p className="text-sm text-secondary mt-1.5 leading-relaxed">
                Send an immediate alert to campus security? Your current GPS location will be shared with emergency responders.
              </p>
            </div>

            <div className="p-3 bg-surface2 rounded-xl border border-warning/30 flex items-center space-x-2 text-left">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
              <span className="text-xs text-warning font-medium">
                Only trigger for actual safety or medical emergencies on campus.
              </span>
            </div>

            {countdown !== null ? (
              <div className="space-y-2">
                <button
                  onClick={handleCancelCountdown}
                  className="w-full py-3.5 bg-warning text-black font-bold rounded-xl shadow-lg hover:bg-warning/90 transition-all flex items-center justify-center space-x-2"
                >
                  <X className="w-5 h-5" />
                  <span>CANCEL ALERT (Sending in {countdown + 1}s...)</span>
                </button>
              </div>
            ) : (
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 py-3 bg-surface2 hover:bg-surface2/80 text-foreground font-semibold rounded-xl border border-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInitiateSend}
                  className="flex-1 py-3 bg-error hover:bg-error/90 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Siren className="w-5 h-5" />
                  <span>SEND ALERT</span>
                </button>
              </div>
            )}

            <p className="text-[11px] text-secondary">
              Your location is shared only with campus responders.
            </p>
          </div>
        )}

        {/* State 2: Sending */}
        {state === 'sending' && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-12 h-12 text-error animate-spin mx-auto" />
            <div>
              <h3 className="text-lg font-bold text-foreground">Sending SOS Alert...</h3>
              <p className="text-xs text-secondary mt-1">Connecting to campus emergency response network</p>
            </div>
          </div>
        )}

        {/* State 3: Error */}
        {state === 'error' && (
          <div className="space-y-5 text-center py-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-error/20 text-error flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">SOS Request Failed</h3>
              <p className="text-xs text-secondary mt-1">{errorMsg || 'Could not dispatch alert. Please call security directly.'}</p>
            </div>
            <div className="pt-2">
              <button
                onClick={handleInitiateSend}
                className="w-full py-3 bg-error text-white font-bold rounded-xl shadow-lg"
              >
                Retry SOS Alert
              </button>
            </div>
          </div>
        )}

        {/* State 4: Sent Success */}
        {state === 'sent' && response && (
          <div className="space-y-5 pt-2">
            <div className="flex items-center space-x-3 p-3.5 bg-primary/10 border border-primary/30 rounded-xl">
              <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
              <div>
                <h3 className="text-base font-bold text-foreground">{response.message}</h3>
                <p className="text-xs text-primary font-medium mt-0.5">Campus Responders Notified · Alert #{response.alert_id}</p>
              </div>
            </div>

            <div className="space-y-4">
              <SafePointsList
                safePoints={response.safe_points}
                onSelectSafePoint={(sp) => {
                  if (onSelectSafePointOnMap) onSelectSafePointOnMap(sp);
                  handleCloseModal();
                }}
              />

              <EmergencyContacts contacts={response.emergency_contacts} />
            </div>

            <div className="pt-2">
              <button
                onClick={handleCloseModal}
                className="w-full py-3 bg-surface2 hover:bg-surface2/80 text-foreground font-semibold rounded-xl border border-border"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
