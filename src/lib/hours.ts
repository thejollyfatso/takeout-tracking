import type { WeeklyHours } from '../types';

const DAY_KEYS: (keyof WeeklyHours)[] = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];

export function isOpenNow(hours: WeeklyHours): boolean {
  const now = new Date();
  const dayKey = DAY_KEYS[now.getDay()];
  const day = hours[dayKey];
  if (!day.open || !day.openTime || !day.closeTime) return false;

  const [oh, om] = day.openTime.split(':').map(Number);
  const [ch, cm] = day.closeTime.split(':').map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = oh * 60 + om;
  const closeMinutes = ch * 60 + cm;

  if (closeMinutes > openMinutes) {
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }
  // crosses midnight
  return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
}

export function defaultWeeklyHours(): WeeklyHours {
  const day = { open: false, openTime: null, closeTime: null };
  return {
    monday: { ...day },
    tuesday: { ...day },
    wednesday: { ...day },
    thursday: { ...day },
    friday: { ...day },
    saturday: { ...day },
    sunday: { ...day },
  };
}
