# FilterBar

A horizontal filter and sort control bar with dropdown menus for filtering items by distance, time, category, and sort order.

## Purpose

The FilterBar provides users with intuitive controls to refine and sort item listings. It handles:

- Distance-based filtering with location awareness
- Time-based filtering for item recency
- Category filtering when categories are available
- Sort options for ordering results
- Location permission prompts for location-dependent features

Use this component at the top of list views where users need to filter or sort collections of items.

## Props / Parameters

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `filters` | `FilterState` | Yes | - | Current filter state object |
| `onFiltersChange` | `(filters: FilterState) => void` | Yes | - | Callback when any filter changes |
| `locationEnabled` | `boolean` | Yes | - | Whether user location is available |
| `onEnableLocation` | `() => void` | Yes | - | Callback to request location permission |
| `hideDistance` | `boolean` | No | `false` | Hides the distance filter dropdown |
| `hideSort` | `boolean` | No | `false` | Hides the sort dropdown |
| `categories` | `string[]` | No | `[]` | Available categories for filtering |

### Prop Details

#### `filters`

The `FilterState` object structure:

```typescript
interface FilterState {
  distance: DistanceFilter;  // 'any' | '500' | '1000' | '2000' | '5000' | '10000' | '25000'
  time: TimeFilter;          // 'all' | '2h' | '8h' | '24h' | '48h' | 'week'
  sort: SortOption;          // 'nearest' | 'recent' | 'verified'
  category: CategoryFilter;  // 'all' | category string
}
```

#### `locationEnabled`

When `false`, certain options display a warning icon and trigger `onEnableLocation` when selected instead of applying the filter. This applies to:
- Distance filter options (except "Any Distance")
- "Nearest" sort option

#### `categories`

When provided, a category dropdown appears. Categories are automatically formatted with first letter capitalized.

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

## Usage Examples

### Basic Usage

```tsx
import { FilterBar, FilterState } from '@/components/FilterBar';

function ItemList() {
  const [filters, setFilters] = useState<FilterState>({
    distance: 'any',
    time: 'all',
    sort: 'recent',
    category: 'all',
  });

  return (
    <div>
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        locationEnabled={true}
        onEnableLocation={() => requestLocation()}
      />
      <ItemGrid filters={filters} />
    </div>
  );
}
```

### With Categories

```tsx
<FilterBar
  filters={filters}
  onFiltersChange={setFilters}
  locationEnabled={locationEnabled}
  onEnableLocation={handleEnableLocation}
  categories={['furniture', 'electronics', 'clothing', 'books']}
/>
```

### Map View (Hide Distance and Sort)

```tsx
<FilterBar
  filters={filters}
  onFiltersChange={setFilters}
  locationEnabled={locationEnabled}
  onEnableLocation={handleEnableLocation}
  hideDistance={true}
  hideSort={true}
/>
```

### Integration with Filter Context

```tsx
import { useFilters } from '@/contexts/FilterContext';

function DiscoverPage() {
  const { filters, setFilters, locationEnabled, requestLocation } = useFilters();

  return (
    <FilterBar
      filters={filters}
      onFiltersChange={setFilters}
      locationEnabled={locationEnabled}
      onEnableLocation={requestLocation}
    />
  );
}
```

## Accessibility

### Keyboard Navigation

- `Tab`: Moves focus between dropdowns
- `Enter/Space`: Opens/closes dropdown menus
- `Arrow keys`: Not implemented; standard click selection
- `Escape`: Not implemented; click outside to close

### ARIA Attributes

The dropdowns should be enhanced with:

| Attribute | Recommended Value | Purpose |
|-----------|-------------------|---------|
| `role` | `"listbox"` | Identifies dropdown as selection list |
| `aria-expanded` | `true/false` | Indicates dropdown open state |
| `aria-selected` | On selected option | Identifies current selection |

### Screen Reader Considerations

- Each dropdown button announces current selection
- Location-required options show Navigation icon as visual indicator
- Active filters change button styling for visual distinction

### Color Contrast

- Active filter pills use emerald background with white text (high contrast)
- Inactive pills use stone colors appropriate for light/dark mode
- Location warning icon uses amber color

## Styling

### CSS Classes

Key Tailwind classes used:

- **Container**: `flex items-center py-3 pl-4` - Horizontal layout with padding
- **Active pill**: `bg-emerald-500 text-white shadow-sm` - Highlighted active filter
- **Inactive pill**: `bg-stone-100 dark:bg-stone-800` - Subtle inactive state
- **Dropdown**: `bg-white dark:bg-stone-900 rounded-xl shadow-lg border` - Floating menu
- **Scrollable area**: `overflow-x-auto scrollbar-hide` - Horizontal scroll on small screens

### Theme Support

Fully supports light/dark mode through `dark:` variants on:
- Button backgrounds (`dark:bg-stone-800`)
- Dropdown backgrounds (`dark:bg-stone-900`)
- Text colors (`dark:text-stone-400`, `dark:text-stone-300`)
- Border colors (`dark:border-stone-700`)
- Selected option backgrounds (`dark:bg-emerald-900/20`)

## Internal Components

### FilterDropdown

Generic dropdown component for Distance, Time, and Category filters:
- Renders as pill button with icon, label, and chevron
- Uses fixed positioning for dropdown to escape scroll containers
- Handles location permission checking for restricted options

### SortDropdown

Specialized dropdown for sort options:
- Displays short labels on button, full labels in dropdown
- Uses relative positioning (different from FilterDropdown)
- Same location permission handling

## States

### Default State

All filters at default values:
- Distance: "Any Distance"
- Time: "All time"
- Sort: "Recent"
- Category: "All Categories"

Pills show neutral gray styling.

### Active Filter State

When filter differs from default:
- Pill shows emerald background with white text
- Label changes to selected option value
- Visual indication of applied filter

### Dropdown Open State

- Chevron rotates 180 degrees
- Dropdown menu appears below button
- Current selection highlighted with emerald accent

### Location Required State

For options requiring location when `locationEnabled` is false:
- Option shows amber Navigation icon
- Clicking triggers `onEnableLocation` callback
- Option has 60% opacity

## Edge Cases

### No Categories

When `categories` prop is empty or undefined, the category dropdown is not rendered.

### Horizontal Overflow

Filter pills wrap into a horizontally scrollable container with hidden scrollbar for mobile.

### Click Outside

Dropdowns close when clicking outside via document mousedown listener.

### Fixed Positioning

FilterDropdown uses fixed positioning calculated from button bounding rect to ensure dropdown appears correctly even within scrollable containers.

## Dependencies

### Internal Dependencies

None - self-contained component with types exported.

### External Dependencies

- `lucide-react` - Icons (MapPin, Clock, ArrowUpDown, ChevronDown, Navigation, Tag)
- `react` - useState, useRef, useEffect hooks

## Testing Considerations

### Unit Tests

```tsx
describe('FilterBar', () => {
  const defaultFilters: FilterState = {
    distance: 'any',
    time: 'all',
    sort: 'recent',
    category: 'all',
  };

  it('renders all filter dropdowns', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onFiltersChange={() => {}}
        locationEnabled={true}
        onEnableLocation={() => {}}
      />
    );
    expect(screen.getByText('Distance')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Recent')).toBeInTheDocument();
  });

  it('hides distance filter when hideDistance is true', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onFiltersChange={() => {}}
        locationEnabled={true}
        onEnableLocation={() => {}}
        hideDistance={true}
      />
    );
    expect(screen.queryByText('Distance')).not.toBeInTheDocument();
  });

  it('calls onFiltersChange when filter selected', () => {
    const onChange = jest.fn();
    render(
      <FilterBar
        filters={defaultFilters}
        onFiltersChange={onChange}
        locationEnabled={true}
        onEnableLocation={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Time'));
    fireEvent.click(screen.getByText('Last 24 hours'));
    expect(onChange).toHaveBeenCalledWith({ ...defaultFilters, time: '24h' });
  });

  it('calls onEnableLocation for location-required options when location disabled', () => {
    const onEnableLocation = jest.fn();
    render(
      <FilterBar
        filters={defaultFilters}
        onFiltersChange={() => {}}
        locationEnabled={false}
        onEnableLocation={onEnableLocation}
      />
    );
    fireEvent.click(screen.getByText('Distance'));
    fireEvent.click(screen.getByText('1 km'));
    expect(onEnableLocation).toHaveBeenCalled();
  });

  it('shows category filter when categories provided', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onFiltersChange={() => {}}
        locationEnabled={true}
        onEnableLocation={() => {}}
        categories={['furniture', 'electronics']}
      />
    );
    expect(screen.getByText('Category')).toBeInTheDocument();
  });
});
```

### Integration Tests

1. Filter changes update item list
2. Sort option changes reorder items
3. Location permission flow when selecting restricted options

### Accessibility Tests

- Verify keyboard navigation through dropdowns
- Test dropdown open/close with keyboard
- Verify focus management when dropdown closes

## Related Components

- `FloatingFilterDropdown` - Alternative floating filter UI
- `DiscoverPage` - Primary consumer of FilterBar
- `FilterContext` - Context provider for filter state

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-12-06 | Initial implementation with distance, time, sort |
| 1.1.0 | 2024-12-07 | Added category filter support |
| 1.2.0 | 2024-12-07 | Added hideDistance and hideSort props |
