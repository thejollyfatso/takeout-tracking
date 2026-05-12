import JSZip from 'jszip';
import { getAllRestaurants } from '../db/restaurants';
import { getOrInitMeta } from '../db/index';

export async function exportZip(): Promise<void> {
  const restaurants = await getAllRestaurants();
  const meta = await getOrInitMeta();

  const manifest = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    source: 'eats-pwa',
    recordCount: restaurants.length,
  };

  const zip = new JSZip();
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));
  zip.file('restaurants.json', JSON.stringify({ restaurants, meta }, null, 2));

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `eats-export-${new Date().toISOString().slice(0, 10)}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
