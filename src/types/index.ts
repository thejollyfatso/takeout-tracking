export interface DayHours {
  open: boolean;
  openTime: string | null;   // "HH:MM" 24h
  closeTime: string | null;  // "HH:MM" 24h
}

export interface WeeklyHours {
  monday:    DayHours;
  tuesday:   DayHours;
  wednesday: DayHours;
  thursday:  DayHours;
  friday:    DayHours;
  saturday:  DayHours;
  sunday:    DayHours;
}

export interface OrderItem {
  id: string;
  name: string;
  notes: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  distanceMiles: number | null;
  travelTimeMinutes: number | null;
  formality: 1 | 2 | 3 | 4 | 5;
  serviceType: 'dine-in' | 'takeout' | 'both';
  alcohol: 'none' | 'beer-wine' | 'full-bar';
  frequency: 1 | 2 | 3 | 4 | 5;
  lastVisited: string | null;
  hours: WeeklyHours;
  frequentlyOrdered: OrderItem[];
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AppMeta {
  cuisineList: string[];
  tagList: string[];
  schemaVersion: number;
}

export type SortKey = 'name' | 'distance' | 'travelTime' | 'frequency' | 'lastVisited' | 'createdAt';

export interface Filters {
  cuisine: string[];
  serviceType: string[];
  alcohol: string[];
  formalityMin: number;
  formalityMax: number;
  distanceMax: number | null;
  tags: string[];
  openNow: boolean;
}
