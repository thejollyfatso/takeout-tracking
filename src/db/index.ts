import Dexie, { type Table } from 'dexie';
import type { Restaurant, AppMeta } from '../types';

export class EatsDB extends Dexie {
  restaurants!: Table<Restaurant, string>;
  meta!: Table<AppMeta & { id: number }, number>;

  constructor() {
    super('eats-pwa');
    this.version(1).stores({
      restaurants: 'id, name, distanceMiles, rating, frequency, lastVisited, createdAt',
      meta: 'id',
    });
  }
}

export const db = new EatsDB();

export const PREDEFINED_CUISINES = [
  'American', 'Barbecue', 'Breakfast', 'Burgers', 'Chinese', 'Ethiopian',
  'Filipino', 'Greek', 'Indian', 'Italian', 'Japanese', 'Korean',
  'Mediterranean', 'Mexican', 'Middle Eastern', 'Pizza', 'Seafood',
  'Southeast Asian', 'Sushi', 'Taiwanese', 'Thai', 'Vietnamese',
];

export async function getOrInitMeta(): Promise<AppMeta> {
  let record = await db.meta.get(1);
  if (!record) {
    const initial: AppMeta = {
      cuisineList: [...PREDEFINED_CUISINES],
      tagList: [],
      schemaVersion: 1,
    };
    await db.meta.put({ id: 1, ...initial });
    return initial;
  }
  const { id: _id, ...meta } = record;
  return meta as AppMeta;
}

export async function saveMeta(meta: AppMeta): Promise<void> {
  await db.meta.put({ id: 1, ...meta });
}
