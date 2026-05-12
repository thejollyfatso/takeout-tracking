import { useSearchParams } from 'react-router-dom';
import type { Filters, SortKey } from '../types';

const DEFAULT_FILTERS: Filters = {
  cuisine: [],
  serviceType: [],
  alcohol: [],
  formalityMin: 1,
  formalityMax: 5,
  distanceMax: null,
  tags: [],
  openNow: false,
};

function parseList(v: string | null): string[] {
  return v ? v.split(',').filter(Boolean) : [];
}

export function useFilters() {
  const [params, setParams] = useSearchParams();

  const filters: Filters = {
    cuisine: parseList(params.get('cuisine')),
    serviceType: parseList(params.get('serviceType')),
    alcohol: parseList(params.get('alcohol')),
    formalityMin: Number(params.get('formalityMin') ?? 1),
    formalityMax: Number(params.get('formalityMax') ?? 5),
    distanceMax: params.get('distanceMax') ? Number(params.get('distanceMax')) : null,
    tags: parseList(params.get('tags')),
    openNow: params.get('openNow') === '1',
  };

  const sort: SortKey = (params.get('sort') as SortKey) || 'name';
  const layout: 'card' | 'row' = params.get('layout') === 'row' ? 'row' : 'card';

  function setFilters(next: Partial<Filters>) {
    setParams(prev => {
      const p = new URLSearchParams(prev);
      const merged = { ...filters, ...next };
      if (merged.cuisine.length) p.set('cuisine', merged.cuisine.join(','));
      else p.delete('cuisine');
      if (merged.serviceType.length) p.set('serviceType', merged.serviceType.join(','));
      else p.delete('serviceType');
      if (merged.alcohol.length) p.set('alcohol', merged.alcohol.join(','));
      else p.delete('alcohol');
      if (merged.formalityMin !== 1) p.set('formalityMin', String(merged.formalityMin));
      else p.delete('formalityMin');
      if (merged.formalityMax !== 5) p.set('formalityMax', String(merged.formalityMax));
      else p.delete('formalityMax');
      if (merged.distanceMax != null) p.set('distanceMax', String(merged.distanceMax));
      else p.delete('distanceMax');
      if (merged.tags.length) p.set('tags', merged.tags.join(','));
      else p.delete('tags');
      if (merged.openNow) p.set('openNow', '1');
      else p.delete('openNow');
      return p;
    }, { replace: true });
  }

  function setSort(s: SortKey) {
    setParams(prev => {
      const p = new URLSearchParams(prev);
      if (s !== 'name') p.set('sort', s); else p.delete('sort');
      return p;
    }, { replace: true });
  }

  function setLayout(l: 'card' | 'row') {
    setParams(prev => {
      const p = new URLSearchParams(prev);
      if (l !== 'card') p.set('layout', l); else p.delete('layout');
      return p;
    }, { replace: true });
  }

  function clearFilters() {
    setParams(prev => {
      const p = new URLSearchParams(prev);
      for (const key of ['cuisine','serviceType','alcohol','formalityMin','formalityMax','distanceMax','tags','openNow']) {
        p.delete(key);
      }
      return p;
    }, { replace: true });
  }

  const isDefault = (
    filters.cuisine.length === 0 &&
    filters.serviceType.length === 0 &&
    filters.alcohol.length === 0 &&
    filters.formalityMin === 1 &&
    filters.formalityMax === 5 &&
    filters.distanceMax == null &&
    filters.tags.length === 0 &&
    !filters.openNow
  );

  return { filters, sort, layout, setFilters, setSort, setLayout, clearFilters, isDefault, DEFAULT_FILTERS };
}
