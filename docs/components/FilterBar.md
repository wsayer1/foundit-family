# FilterBar

Shared filter types and option constants module. **Note: this file no longer exports a React component** — the visual filter UI lives in `FilterSidebar` and `FloatingFilterDropdown`, which consume these exports.

## Purpose

`src/components/FilterBar.tsx` is the single source of truth for item filtering:

- Defines the filter/sort type vocabulary used across the app
- Exports labeled option arrays so every filter UI renders identical choices
- Consumed by `FilterSidebar`, filter dropdowns, and pages that hold `FilterState`

## Props / Parameters

Not applicable — no component is exported.

## Exported Types

```typescript
export type DistanceFilter = 'any' | '500' | '1000' | '2000' | '5000' | '10000' | '25000';
export type TimeFilter = 'all' | '2h' | '8h' | '24h' | '48h' | 'week';
export type SortOption = 'nearest' | 'recent' | 'verified';
export type CategoryFilter = string;

export interface FilterState {
  distance: DistanceFilter;
  time: TimeFilter;
  sort: SortOption;
  category: CategoryFilter;
}
```

## Exported Constants

| Constant | Type | Description |
|----------|------|-------------|
| `distanceOptions` | `{ value: DistanceFilter; label: string }[]` | 7 options: "Any Distance", 500m, 1 km, 2 km, 5 km, 10 km, 25 km |
| `timeOptions` | `{ value: TimeFilter; label: string }[]` | 6 options: Last 2/8/24/48 hours, Last week, All time |
| `sortOptions` | `{ value: SortOption; label: string }[]` | Most Recent, Nearest, Most Verified |

## Usage Examples

### Holding filter state

```tsx
import { FilterState } from '../components/FilterBar';

const [filters, setFilters] = useState<FilterState>({
  distance: 'any',
  time: 'all',
  sort: 'recent',
  category: 'all',
});
```

### Rendering options in a custom UI

```tsx
import { distanceOptions, timeOptions, sortOptions } from '../components/FilterBar';

{distanceOptions.map((opt) => (
  <button key={opt.value} onClick={() => setDistance(opt.value)}>
    {opt.label}
  </button>
))}
```

## Edge Cases

- `DistanceFilter` values are strings of meters (or `'any'`); consumers must `parseInt` for distance math.
- `category` is a free-form string; `'all'` conventionally means no category filter.

## Dependencies

### Internal Dependencies

None — pure TypeScript module with no imports.

### External Dependencies

None.

## Related Components

- `FilterSidebar` - Renders these options as a slide-in filter panel
- `FloatingFilterDropdown` - Floating filter UI consumer

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-12-06 | Initial implementation with FilterBar component |
| 1.1.0 | 2024-12-07 | Added category filter support |
| 2.0.0 | 2026-06-10 | Component removed; file now exports only types plus `distanceOptions`, `timeOptions`, `sortOptions` arrays |
