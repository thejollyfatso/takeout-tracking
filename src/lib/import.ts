import JSZip from 'jszip';
import type { Restaurant, AppMeta } from '../types';
import { clearRestaurants, putRestaurant, getAllRestaurants } from '../db/restaurants';
import { getOrInitMeta, saveMeta } from '../db/index';

export type ImportMode = 'replace' | 'merge';

export interface ImportResult {
  added: number;
  skipped: number;
  warning?: string;
}

export async function importZip(file: File, mode: ImportMode): Promise<ImportResult> {
  const zip = await JSZip.loadAsync(file);

  const manifestFile = zip.file('manifest.json');
  const dataFile = zip.file('restaurants.json');
  if (!manifestFile || !dataFile) throw new Error('Invalid export file: missing required files.');

  const manifest = JSON.parse(await manifestFile.async('string'));
  if (manifest.source !== 'eats-pwa') throw new Error('Not an Eats export file.');

  let warning: string | undefined;
  if (manifest.schemaVersion !== 1) {
    warning = `Schema version mismatch (file: ${manifest.schemaVersion}, app: 1). Proceeding anyway.`;
  }

  const { restaurants, meta }: { restaurants: Restaurant[]; meta: AppMeta } =
    JSON.parse(await dataFile.async('string'));

  let added = 0;
  let skipped = 0;

  if (mode === 'replace') {
    await clearRestaurants();
    for (const r of restaurants) {
      await putRestaurant(r);
      added++;
    }
    await saveMeta({ ...meta, schemaVersion: 1 });
  } else {
    const existing = await getAllRestaurants();
    const existingIds = new Set(existing.map(r => r.id));
    for (const r of restaurants) {
      if (existingIds.has(r.id)) {
        skipped++;
      } else {
        await putRestaurant(r);
        added++;
      }
    }
    const currentMeta = await getOrInitMeta();
    const mergedCuisines = Array.from(new Set([...currentMeta.cuisineList, ...meta.cuisineList])).sort();
    const mergedTags = Array.from(new Set([...currentMeta.tagList, ...meta.tagList])).sort();
    await saveMeta({ ...currentMeta, cuisineList: mergedCuisines, tagList: mergedTags });
  }

  return { added, skipped, warning };
}
