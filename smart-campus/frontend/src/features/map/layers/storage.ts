import { LayerId } from './types';
import { DEFAULT_ENABLED_LAYERS } from './layerDefinitions';

const KEY = "smartcampus.map.layers.v1";

export function loadLayerState(
  defaults: Record<LayerId, boolean> = DEFAULT_ENABLED_LAYERS as Record<LayerId, boolean>
): Record<LayerId, boolean> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return { ...defaults };
  }
}

export function saveLayerState(state: Record<LayerId, boolean>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Ignore localStorage write failures
  }
}

export function clearLayerState(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Ignore
  }
}
