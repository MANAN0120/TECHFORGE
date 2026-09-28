import { useState, useCallback } from 'react';
import { api } from '../../services/api';
import { SOSResponse } from './types';

export function getDeviceId(): string {
  let id = localStorage.getItem('cu_device_id');
  if (!id) {
    id = `dev-${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem('cu_device_id', id);
  }
  return id;
}

export function useSOS() {
  const [state, setState] = useState<'idle' | 'confirming' | 'sending' | 'sent' | 'error'>('idle');
  const [response, setResponse] = useState<SOSResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const startConfirm = useCallback(() => {
    setState('confirming');
    setErrorMsg(null);
  }, []);

  const trigger = useCallback(async (customLat?: number, customLng?: number) => {
    setState('sending');
    setErrorMsg(null);

    let lat = customLat;
    let lng = customLng;

    if (lat === undefined || lng === undefined) {
      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000, enableHighAccuracy: true });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {
          // Default CU Main Gate center fallback if GPS denied
          lat = 30.7715;
          lng = 76.5750;
        }
      } else {
        lat = 30.7715;
        lng = 76.5750;
      }
    }

    try {
      const res: SOSResponse = await api.triggerSOS({
        campus_id: 'cu-gharaun',
        lat,
        lng,
        device_id: getDeviceId(),
      });
      setResponse(res);
      setState('sent');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to trigger SOS alert.');
      setState('error');
    }
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setResponse(null);
    setErrorMsg(null);
  }, []);

  return { state, response, errorMsg, startConfirm, trigger, reset };
}
