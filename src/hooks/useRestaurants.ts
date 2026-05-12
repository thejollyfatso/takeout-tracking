import { useState, useEffect, useCallback } from 'react';
import type { Restaurant } from '../types';
import { getAllRestaurants } from '../db/restaurants';

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setRestaurants(await getAllRestaurants());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { restaurants, loading, refresh: load };
}
