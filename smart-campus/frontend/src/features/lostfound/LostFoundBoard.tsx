import React, { useState } from 'react';
import { Search, Plus, Filter, RefreshCw, PackageSearch, Siren } from 'lucide-react';
import { useLostFound } from './useLostFound';
import { LostItemCard } from './LostItemCard';
import { LostItemDetail } from './LostItemDetail';
import { ReportItemForm } from './ReportItemForm';
import { CATEGORIES } from './categories';
import { LostItem, ItemType, ItemCategory } from './types';

interface LostFoundBoardProps {
  onNavigateToLocation?: (lat: number, lng: number, label: string) => void;
}

export const LostFoundBoard: React.FC<LostFoundBoardProps> = ({ onNavigateToLocation }) => {
  const { items, loading, error, filter, setFilter, resolveItem, refresh } = useLostFound();

  const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.last_seen_label && item.last_seen_label.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight flex items-center space-x-2">
            <span>Lost & Found Community Board</span>
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Help reunite CU students and staff with missing items on campus.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => refresh()}
            className="p-2 bg-surface2 hover:bg-surface2/80 text-secondary hover:text-foreground rounded-xl border border-border transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowReportForm(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-black font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Report Item</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="space-y-3 bg-surface p-3.5 rounded-2xl border border-border shadow-sm">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-secondary absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search items by keyword or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface2 border border-border rounded-xl text-xs text-foreground placeholder-secondary/60 focus:outline-none focus:border-primary"
          />
        </div>

        {/* Type Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilter({ ...filter, type: undefined })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              !filter.type
                ? 'bg-foreground text-background shadow-md'
                : 'bg-surface2 text-secondary hover:text-foreground border border-border'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setFilter({ ...filter, type: 'lost' })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filter.type === 'lost'
                ? 'bg-warning text-black shadow-md'
                : 'bg-surface2 text-secondary hover:text-foreground border border-border'
            }`}
          >
            Lost
          </button>
          <button
            onClick={() => setFilter({ ...filter, type: 'found' })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filter.type === 'found'
                ? 'bg-primary text-black shadow-md'
                : 'bg-surface2 text-secondary hover:text-foreground border border-border'
            }`}
          >
            Found
          </button>
        </div>

        {/* Category Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilter({ ...filter, category: undefined })}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 border transition-all ${
              !filter.category
                ? 'bg-primary/20 border-primary text-primary font-bold'
                : 'bg-surface2 border-border/60 text-secondary hover:text-foreground'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => {
            const isSelected = filter.category === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setFilter({ ...filter, category: isSelected ? undefined : cat.value })}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 border transition-all ${
                  isSelected
                    ? 'bg-primary/20 border-primary text-primary font-bold'
                    : 'bg-surface2 border-border/60 text-secondary hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Items */}
      {loading && items.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-xs text-secondary">Loading Lost & Found board...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 px-4 text-center bg-surface border border-border rounded-2xl space-y-4">
          <PackageSearch className="w-12 h-12 text-secondary/60 mx-auto" />
          <div>
            <h4 className="text-base font-bold text-foreground">No Items Reported</h4>
            <p className="text-xs text-secondary mt-1 max-w-sm mx-auto">
              Lost something or found an item on campus? Report it and the CU community can help.
            </p>
          </div>
          <button
            onClick={() => setShowReportForm(true)}
            className="px-4 py-2.5 bg-primary text-black font-bold text-xs rounded-xl shadow-lg hover:bg-primary/90 transition-all inline-flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Report Item</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <LostItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
          ))}
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <LostItemDetail
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onResolve={resolveItem}
          onNavigateToLocation={onNavigateToLocation}
        />
      )}

      {/* Report Form Modal */}
      {showReportForm && (
        <ReportItemForm
          onClose={() => setShowReportForm(false)}
          onSubmitSuccess={() => refresh()}
        />
      )}
    </div>
  );
};
