import { db } from './index';
import type { Restaurant } from '../types';

export async function getRestaurant(id: string): Promise<Restaurant | undefined> {
  return db.restaurants.get(id);
}

export async function getAllRestaurants(): Promise<Restaurant[]> {
  return db.restaurants.toArray();
}

export async function putRestaurant(r: Restaurant): Promise<void> {
  await db.restaurants.put(r);
}

export async function deleteRestaurant(id: string): Promise<void> {
  await db.restaurants.delete(id);
}

export async function clearRestaurants(): Promise<void> {
  await db.restaurants.clear();
}
