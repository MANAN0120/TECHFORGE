import { useMemo } from 'react';
import { LayerId } from './types';
import { Building, POI, Cart } from '../../../types/campus';

export interface CampusDataset {
  buildings?: Building[];
  pois?: POI[];
  carts?: Cart[];
  nodes?: Array<{ type: string; label?: string }>;
  shops?: any[];
  events?: any[];
}

export function useLayerCounts(data: CampusDataset): Record<LayerId, number> {
  return useMemo(() => {
    const buildings = data.buildings || [];
    const pois = data.pois || [];
    const carts = data.carts || [];
    const nodes = data.nodes || [];
    const shops = data.shops || [];
    const events = data.events || [];

    // Filter buildings that are academic or general buildings (excluding explicit hostels)
    const academicBuildingsCount = buildings.filter(
      (b) => !b.category || b.category.toLowerCase() === 'academic' || b.category.toLowerCase() === 'admin'
    ).length || buildings.length;

    const gatesCount = nodes.filter((n) => n.type === 'gate').length || 2;
    const foodCount = pois.filter((p) => p.category.toLowerCase() === 'food' || p.category.toLowerCase() === 'cafeteria').length;
    const banksCount = pois.filter((p) => p.category.toLowerCase() === 'atm' || p.category.toLowerCase() === 'bank').length;
    const washroomsCount = pois.filter((p) => p.category.toLowerCase() === 'washroom').length;
    const medicalCount = pois.filter((p) => p.category.toLowerCase() === 'medical' || p.category.toLowerCase() === 'health').length;
    const hostelsCount = buildings.filter((b) => b.category.toLowerCase() === 'hostel').length;
    const sportsCount = pois.filter((p) => p.category.toLowerCase() === 'sports').length;
    const shopsCount = shops.length || pois.filter((p) => p.category.toLowerCase() === 'shop').length;
    const cartsCount = carts.length;
    const eventsCount = events.length;
    const parkingCount = pois.filter((p) => p.category.toLowerCase() === 'parking').length;

    return {
      buildings: academicBuildingsCount,
      gates: gatesCount,
      food: foodCount,
      banks: banksCount,
      washrooms: washroomsCount,
      medical: medicalCount,
      hostels: hostelsCount,
      sports: sportsCount,
      shops: shopsCount,
      carts: cartsCount,
      events: eventsCount,
      parking: parkingCount,
    };
  }, [data]);
}
