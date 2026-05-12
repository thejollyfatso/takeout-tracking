import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useRestaurants } from '../hooks/useRestaurants';
import { useFilters } from '../hooks/useFilters';
import { useMeta } from '../hooks/useMeta';
import { FilterPanel } from '../components/ui/FilterPanel';
import { SortSelector } from '../components/ui/SortSelector';
import { RestaurantCard } from '../components/restaurant/RestaurantCard';
import { isOpenNow } from '../lib/hours';
import type { Restaurant, SortKey } from '../types';

function applySort(list: Restaurant[], sort: SortKey): Restaurant[] {
  return [...list].sort((a, b) => {
    switch (sort) {
      case 'name': return a.name.localeCompare(b.name);
      case 'distance':
        return (a.distanceMiles ?? Infinity) - (b.distanceMiles ?? Infinity);
      case 'travelTime':
        return (a.travelTimeMinutes ?? Infinity) - (b.travelTimeMinutes ?? Infinity);
      case 'frequency': return b.frequency - a.frequency;
      case 'createdAt': return b.createdAt.localeCompare(a.createdAt);
      default: return 0;
    }
  });
}

export function ListPage() {
  const { restaurants, loading } = useRestaurants();
  const { filters, sort, layout, setFilters, setSort, setLayout, clearFilters, isDefault } = useFilters();
  const { meta } = useMeta();
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = restaurants;

    if (filters.cuisine.length) list = list.filter(r => r.cuisine.some(c => filters.cuisine.includes(c)));
    if (filters.serviceType.length) list = list.filter(r => filters.serviceType.includes(r.serviceType));
    if (filters.alcohol.length) list = list.filter(r => filters.alcohol.includes(r.alcohol));
    list = list.filter(r => r.formality >= filters.formalityMin && r.formality <= filters.formalityMax);
    if (filters.distanceMax != null) list = list.filter(r => r.distanceMiles != null && r.distanceMiles <= filters.distanceMax!);
    if (filters.tags.length) list = list.filter(r => filters.tags.every(t => r.tags.includes(t)));
    if (filters.openNow) list = list.filter(r => isOpenNow(r.hours));

    return applySort(list, sort);
  }, [restaurants, filters, sort]);

  const activeChips: { label: string; clear: () => void }[] = [];
  if (filters.cuisine.length) activeChips.push({ label: `Cuisine: ${filters.cuisine.join(', ')}`, clear: () => setFilters({ cuisine: [] }) });
  if (filters.serviceType.length) activeChips.push({ label: `Service: ${filters.serviceType.join(', ')}`, clear: () => setFilters({ serviceType: [] }) });
  if (filters.alcohol.length) activeChips.push({ label: `Alcohol: ${filters.alcohol.join(', ')}`, clear: () => setFilters({ alcohol: [] }) });
  if (filters.formalityMin !== 1 || filters.formalityMax !== 5) activeChips.push({ label: `Formality: ${filters.formalityMin}–${filters.formalityMax}`, clear: () => setFilters({ formalityMin: 1, formalityMax: 5 }) });
  if (filters.distanceMax != null) activeChips.push({ label: `≤ ${filters.distanceMax} mi`, clear: () => setFilters({ distanceMax: null }) });
  if (filters.tags.length) activeChips.push({ label: `Tags: ${filters.tags.join(', ')}`, clear: () => setFilters({ tags: [] }) });
  if (filters.openNow) activeChips.push({ label: 'Open now', clear: () => setFilters({ openNow: false }) });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Eats</h1>
        <div className="flex items-center gap-2">
          <Link to="/settings" className="text-sm text-gray-500 hover:text-gray-700">Settings</Link>
          <Link to="/add" className="px-3 py-1.5 bg-orange-500 text-white text-sm font-medium rounded hover:bg-orange-600">
            + Add
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button
          type="button"
          onClick={() => setShowFilters(v => !v)}
          className={`text-sm px-3 py-1.5 rounded border transition-colors ${
            !isDefault ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
          }`}
        >
          Filters {!isDefault && '●'}
        </button>
        <SortSelector value={sort} onChange={setSort} />
        <div className="ml-auto flex gap-1">
          <button type="button" onClick={() => setLayout('card')}
            className={`px-2 py-1.5 text-sm rounded border ${layout === 'card' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-gray-300 text-gray-600'}`}
            aria-label="Card layout">⊞</button>
          <button type="button" onClick={() => setLayout('row')}
            className={`px-2 py-1.5 text-sm rounded border ${layout === 'row' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-gray-300 text-gray-600'}`}
            aria-label="Row layout">☰</button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-4">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            cuisineList={meta?.cuisineList ?? []}
            tagList={meta?.tagList ?? []}
            onClose={() => setShowFilters(false)}
          />
        </div>
      )}

      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {activeChips.map(chip => (
            <span key={chip.label} className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full">
              {chip.label}
              <button type="button" onClick={chip.clear} className="hover:text-orange-900">×</button>
            </span>
          ))}
          <button type="button" onClick={clearFilters} className="text-xs text-gray-400 hover:text-gray-600 underline ml-1">Clear all</button>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-400 py-16">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg mb-2">{restaurants.length === 0 ? 'No restaurants yet.' : 'No results match your filters.'}</p>
          {restaurants.length === 0 ? (
            <Link to="/add" className="text-orange-500 hover:underline text-sm">Add your first restaurant →</Link>
          ) : (
            <button type="button" onClick={clearFilters} className="text-orange-500 hover:underline text-sm">Clear filters</button>
          )}
        </div>
      ) : (
        <div className={layout === 'card'
          ? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
          : 'flex flex-col gap-2'
        }>
          {filtered.map(r => (
            <RestaurantCard key={r.id} restaurant={r} layout={layout} />
          ))}
        </div>
      )}
    </div>
  );
}
