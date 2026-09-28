import { Smartphone, Wallet, CreditCard, Key, Briefcase, Package } from 'lucide-react';
import { ItemCategory } from './types';

export interface CategoryMeta {
  value: ItemCategory;
  label: string;
  icon: any;
  colorClass: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { value: 'phone', label: 'Phone', icon: Smartphone, colorClass: 'text-primary border-primary/30 bg-primary/10' },
  { value: 'wallet', label: 'Wallet', icon: Wallet, colorClass: 'text-warning border-warning/30 bg-warning/10' },
  { value: 'id_card', label: 'ID Card', icon: CreditCard, colorClass: 'text-primary border-primary/30 bg-primary/10' },
  { value: 'keys', label: 'Keys', icon: Key, colorClass: 'text-secondary border-secondary/30 bg-secondary/10' },
  { value: 'bag', label: 'Bag', icon: Briefcase, colorClass: 'text-warning border-warning/30 bg-warning/10' },
  { value: 'other', label: 'Other', icon: Package, colorClass: 'text-secondary border-secondary/30 bg-secondary/10' },
];

export function getCategoryMeta(category: string): CategoryMeta {
  const found = CATEGORIES.find((c) => c.value === category);
  return found || { value: 'other', label: 'Other', icon: Package, colorClass: 'text-secondary border-secondary/30 bg-secondary/10' };
}
