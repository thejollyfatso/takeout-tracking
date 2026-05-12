# Eats PWA — Product Spec

## Overview

A progressive web app for managing a personal list of frequented restaurants and deciding where to eat. Solo use. All data is user-entered; no external data sources. Fully offline-capable.

---

## Tech Stack

- **Framework**: React + Vite
- **Storage**: IndexedDB (via `idb` or `dexie`)
- **PWA**: Vite PWA plugin (`vite-plugin-pwa`) with Workbox service worker
- **Styling**: Tailwind CSS
- **No backend**: fully client-side

---

## Data Model

### Restaurant

```ts
interface Restaurant {
  id: string;                        // uuid
  name: string;
  cuisine: string[];                 // from predefined list + user-extensible
  distanceMiles: number;             // user-entered decimal
  formality: 1 | 2 | 3 | 4 | 5;    // 1 = very casual, 5 = fine dining
  serviceType: 'dine-in' | 'takeout' | 'both';
  alcohol: 'none' | 'beer-wine' | 'full-bar';
  frequency: 1 | 2 | 3 | 4 | 5;    // how often user visits
  rating: 1 | 2 | 3 | 4 | 5;       // personal rating
  lastVisited: string | null;        // ISO date string
  hours: WeeklyHours;
  frequentlyOrdered: OrderItem[];
  notes: string;
  tags: string[];                    // user-created
  createdAt: string;                 // ISO date string
  updatedAt: string;                 // ISO date string
}

interface WeeklyHours {
  monday:    DayHours;
  tuesday:   DayHours;
  wednesday: DayHours;
  thursday:  DayHours;
  friday:    DayHours;
  saturday:  DayHours;
  sunday:    DayHours;
}

interface DayHours {
  open: boolean;
  openTime: string | null;   // "HH:MM" 24h
  closeTime: string | null;  // "HH:MM" 24h
}

interface OrderItem {
  id: string;    // uuid
  name: string;
  notes: string;
}
```

### App Metadata (stored separately in IndexedDB)

```ts
interface AppMeta {
  cuisineList: string[];   // predefined + user-added cuisine types
  tagList: string[];       // all tags used across restaurants
  schemaVersion: number;   // for future migrations
}
```

---

## Predefined Cuisine Types

Seed list (user can add more):

American, Barbecue, Breakfast, Burgers, Chinese, Ethiopian, Filipino, Greek, Indian, Italian, Japanese, Korean, Mediterranean, Mexican, Middle Eastern, Pizza, Seafood, Southeast Asian, Sushi, Taiwanese, Thai, Vietnamese

---

## Features

### Restaurant List View

- Card or row layout togglable
- Shows: name, cuisine badges, distance, rating, frequency, service type
- **Filter panel**:
  - Cuisine (multi-select)
  - Service type (dine-in / takeout / both)
  - Alcohol (multi-select)
  - Formality range (slider or min/max)
  - Distance range (max miles)
  - Tags (multi-select)
  - Open now (toggle — compares current day/time against stored hours)
- **Sort options**:
  - Name (A–Z)
  - Distance (nearest first)
  - Rating (highest first)
  - Frequency (most visited first)
  - Last visited (longest ago first — useful for rotation)
  - Recently added
- Active filters shown as dismissible chips
- Empty state when no results match

### Restaurant Detail View

- All fields displayed
- Operating hours table
- Frequently ordered items list
- Notes section
- Edit and Delete actions

### Add / Edit Restaurant Form

- All fields editable
- **Operating hours UI**: day-by-day rows with open/closed toggle and time pickers when open
- **Frequently ordered items**: add / remove / reorder items inline; each item has name + optional notes
- **Cuisine**: searchable dropdown from cuisine list + ability to add new
- **Tags**: typeahead from existing tags + ability to create new inline
- **Scales** (formality, frequency, rating): segmented button or radio group (1–5), labeled at endpoints
- **Service type**: radio group
- **Alcohol**: radio group
- Form validation: name required; hours require both open and close time if marked open

### Tag Management

- Accessible from settings or a dedicated screen
- View all tags in use
- Rename a tag (updates all restaurants using it)
- Delete a tag (removes from all restaurants)

### Cuisine Management

- Accessible from settings
- View full cuisine list
- Add custom cuisines
- Delete unused cuisines

### Data Portability

#### Export

- Produces a `.zip` file containing:
  - `manifest.json`
  - `restaurants.json`
- **manifest.json**:
  ```json
  {
    "schemaVersion": 1,
    "exportedAt": "2025-01-01T00:00:00Z",
    "source": "eats-pwa",
    "recordCount": 42
  }
  ```
- **restaurants.json**: array of all `Restaurant` objects plus `AppMeta`
- Triggered from settings; uses browser file download

#### Import

- User selects a `.zip` file
- App validates manifest (`source`, `schemaVersion`)
- **Import modes**:
  - **Replace all**: clears existing data, imports fresh
  - **Merge**: adds imported restaurants; skips duplicates by `id`; merges cuisine and tag lists
- Schema version mismatch shows a warning but allows proceeding

---

## PWA Requirements

- Service worker caches all app shell assets (JS, CSS, fonts, icons)
- Fully functional offline after first load
- Web app manifest with:
  - App name, short name
  - Icons (192×192, 512×512)
  - `display: standalone`
  - Theme color
- "Add to Home Screen" prompt supported via browser default behavior

---

## Settings Screen

- Export data
- Import data
- Manage cuisines
- Manage tags
- (Future) appearance preferences

---

## Out of Scope (v1)

- Past order log
- "Pick for me" random mode
- External data sources (Google Places, Yelp, etc.)
- Multi-user / shared lists
- nf4lm integration
- Push notifications
- Map view

---

## File Structure (suggested)

```
src/
  components/
    restaurant/
      RestaurantCard.tsx
      RestaurantDetail.tsx
      RestaurantForm.tsx
      HoursEditor.tsx
      OrderItemList.tsx
    ui/
      FilterPanel.tsx
      SortSelector.tsx
      TagInput.tsx
      ScaleInput.tsx
  pages/
    ListPage.tsx
    DetailPage.tsx
    AddEditPage.tsx
    SettingsPage.tsx
  db/
    index.ts         # dexie setup and schema
    restaurants.ts   # CRUD helpers
    meta.ts          # cuisine/tag list helpers
  lib/
    export.ts        # zip export logic
    import.ts        # zip import + validation
    hours.ts         # "open now" calculation
  hooks/
    useRestaurants.ts
    useFilters.ts
    useMeta.ts
  types/
    index.ts
```

---

## Notes for Claude Code

- Use `dexie` for IndexedDB — simpler API than raw `idb`
- Use `jszip` for zip export/import
- Use `react-router-dom` for page routing
- All filter and sort state lives in URL search params so links are shareable and back-navigation works
- `schemaVersion` starts at `1`; increment with any breaking data model change and add a migration in `db/index.ts`
- Keep CLAUDE.md updated with any schema changes
