import { useState, useEffect, useCallback } from 'react';
import type { AppMeta } from '../types';
import { getOrInitMeta, saveMeta } from '../db/index';

export function useMeta() {
  const [meta, setMeta] = useState<AppMeta | null>(null);

  const load = useCallback(async () => {
    setMeta(await getOrInitMeta());
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = load;

  const updateMeta = useCallback(async (updater: (m: AppMeta) => AppMeta) => {
    const current = await getOrInitMeta();
    const next = updater(current);
    await saveMeta(next);
    setMeta(next);
  }, []);

  return { meta, refresh, updateMeta };
}
