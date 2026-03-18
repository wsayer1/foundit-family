# FilterSidebar

Desktop sidebar with collapsible filter sections for the Discover page.

## Purpose

Renders filter controls (Sort, Distance, Time, Category) in a vertical sidebar layout for desktop viewports (lg: and up). On mobile, the FloatingFilterDropdown components in the header are used instead. Both consume the same FilterContext state.

## Props / Parameters

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `filters` | `FilterState` | Yes | - | Current filter values from FilterContext |
| `onSortChange` | `(value: SortOption) => void` | Yes | - | Callback when sort option changes |
| `onDistanceChange` | `(value: DistanceFilter) => void` | Yes | - | Callback when distance filter changes |
| `onTimeChange` | `(value: TimeFilter) => void` | Yes | - | Callback when time filter changes |
| `onCategoryChange` | `(value: CategoryFilter) => void` | Yes | - | Callback when category filter changes |
| `onReset` | `() => void` | Yes | - | Callback to reset all filters to defaults |
| `hasActiveFilters` | `boolean` | Yes | - | Whether any non-default filters are active |
| `locationEnabled` | `boolean` | Yes | - | Whether location permission is granted |
| `onEnableLocation` | `() => void` | Yes | - | Callback to request location permission |
| `categories` | `string[]` | Yes | - | Available category options |

## Usage Examples

```tsx
<FilterSidebar
  filters={filters}
  onSortChange={(value) => setFilters({ ...filters, sort: value })}
  onDistanceChange={(value) => setFilters({ ...filters, distance: value })}
  onTimeChange={(value) => setFilters({ ...filters, time: value })}
  onCategoryChange={(value) => setFilters({ ...filters, category: value })}
  onReset={resetFilters}
  hasActiveFilters={hasActiveFilters}
  locationEnabled={isLocationEnabled}
  onEnableLocation={handleEnableLocation}
  categories={categories}
/>
```

## Styling

- Container: White card with rounded corners and border
- Sections: Collapsible with chevron toggle, default open
- Active option: Emerald highlight
- Location-gated options: Dimmed with navigation icon
- Reset button: Appears in header when filters are active
- Dark mode: Full support via `dark:` variants

## Dependencies

### Internal Dependencies

- FilterBar types (DistanceFilter, TimeFilter, CategoryFilter, SortOption)

### External Dependencies

- `lucide-react` - Icons (ChevronDown, ChevronUp, ArrowUpDown, MapPin, Clock, Tag, Navigation, RotateCcw)

## Related Components

- `FloatingFilterDropdown` - Mobile equivalent (header dropdowns)
- `FilterContext` - Shared filter state provider

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-18 | Initial implementation for desktop sidebar layout |
