# Eats PWA — Developer Notes

## Schema Decisions (schemaVersion: 1)

- `AppMeta` is stored in the `meta` Dexie table with a synthetic `id: 1` primary key. The `id` field is stripped before exposing the `AppMeta` type to the rest of the app.
- `Restaurant.id` is a UUID v4 string (from the `uuid` package). Used as both the Dexie primary key and the dedup key for import merging.
- `WeeklyHours` keys are lowercase day names (`monday`…`sunday`). Day order for display uses Sunday=0 matching `Date.getDay()`.
- `DayHours.openTime` / `closeTime` are `"HH:MM"` 24-hour strings or `null`. The "open now" calculation supports cross-midnight spans (closeTime < openTime).
- `OrderItem.id` is a UUID v4. Reordering is stored as array order in IndexedDB (no explicit rank field).
- `createdAt` / `updatedAt` are ISO 8601 strings (full datetime, not date-only).
- Export zip contains exactly `manifest.json` and `restaurants.json`. `restaurants.json` holds `{ restaurants: Restaurant[], meta: AppMeta }`.

## Migrations

If the data model changes, increment `schemaVersion` in `db/index.ts` and add a Dexie version migration. Update this file with the change description.

## Tech Stack

- React 19 + Vite 8
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- Dexie 4 (IndexedDB)
- react-router-dom v7
- vite-plugin-pwa v1 (Workbox generateSW mode)
- jszip for export/import
- uuid v14 for ID generation
