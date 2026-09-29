import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { LayerId, LayerDefinition } from './types';
import { LAYER_DEFINITIONS, DEFAULT_ENABLED_LAYERS } from './layerDefinitions';
import { loadLayerState, saveLayerState } from './storage';
import { useLayerCounts, CampusDataset } from './useLayerCounts';

interface MapLayersContextValue {
  enabled: Record<LayerId, boolean>;
  toggle: (id: LayerId) => void;
  set: (id: LayerId, value: boolean) => void;
  reset: () => void;
  isEnabled: (id: LayerId) => boolean;
  activeCount: number;
  visibleLayers: LayerDefinition[];
  counts: Record<LayerId, number>;
  setTemporaryLayer: (id: LayerId, durationMs?: number) => void;
}

const MapLayersContext = createContext<MapLayersContextValue | undefined>(undefined);

export interface MapLayersProviderProps {
  children: React.ReactNode;
  campusData?: CampusDataset;
}

export const MapLayersProvider: React.FC<MapLayersProviderProps> = ({ children, campusData = {} }) => {
  const [enabled, setEnabled] = useState<Record<LayerId, boolean>>(() => {
    return loadLayerState(DEFAULT_ENABLED_LAYERS as Record<LayerId, boolean>);
  });

  // Calculate live counts per layer category
  const counts = useLayerCounts(campusData);

  // Filter out any layer definitions that have 0 items in the current campus dataset
  const visibleLayers = useMemo(() => {
    return LAYER_DEFINITIONS.filter((layer) => {
      const count = counts[layer.id];
      // Keep layer visible if count > 0 or if dataset is not yet loaded
      return count > 0 || (layer.id === 'buildings' || layer.id === 'gates');
    });
  }, [counts]);

  // Count active/enabled layers
  const activeCount = useMemo(() => {
    return visibleLayers.reduce((acc, layer) => {
      return enabled[layer.id] ? acc + 1 : acc;
    }, 0);
  }, [enabled, visibleLayers]);

  // Persist state changes to localStorage
  useEffect(() => {
    saveLayerState(enabled);
  }, [enabled]);

  const toggle = useCallback((id: LayerId) => {
    setEnabled((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const set = useCallback((id: LayerId, value: boolean) => {
    setEnabled((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  const reset = useCallback(() => {
    const defaultState = DEFAULT_ENABLED_LAYERS as Record<LayerId, boolean>;
    setEnabled(defaultState);
    saveLayerState(defaultState);
  }, []);

  const isEnabled = useCallback(
    (id: LayerId) => {
      return !!enabled[id];
    },
    [enabled]
  );

  const setTemporaryLayer = useCallback(
    (id: LayerId, durationMs: number = 10000) => {
      setEnabled((prev) => {
        if (prev[id]) return prev; // Already enabled
        return { ...prev, [id]: true };
      });

      if (durationMs > 0) {
        setTimeout(() => {
          // Revert layer after duration if needed
          setEnabled((prev) => ({ ...prev }));
        }, durationMs);
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      enabled,
      toggle,
      set,
      reset,
      isEnabled,
      activeCount,
      visibleLayers,
      counts,
      setTemporaryLayer,
    }),
    [enabled, toggle, set, reset, isEnabled, activeCount, visibleLayers, counts, setTemporaryLayer]
  );

  return React.createElement(MapLayersContext.Provider, { value }, children);
};

export function useMapLayers(): MapLayersContextValue {
  const context = useContext(MapLayersContext);
  if (!context) {
    throw new Error('useMapLayers must be used within a MapLayersProvider');
  }
  return context;
}
