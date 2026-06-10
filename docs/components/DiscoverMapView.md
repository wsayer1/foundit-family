# DiscoverMapView

Interactive Mapbox map showing all discoverable items as freshness-ring markers, with a preview card for the selected item.

## Purpose

The map mode of the Discover page. Renders item markers (circular photo pins wrapped in an SVG "freshness decay" ring; claimed items render as a gray hand pin), the user's location marker, zoom/compass controls, and a desktop side card or mobile bottom card when a marker is selected. Guests see a sign-up gate (`FloatingAuthCard`) instead of navigating to item detail.

## Props / Parameters

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `items` | `ItemWithProfile[]` | Yes | - | Items to plot as markers (diffed incrementally by id) |
| `userLocation` | `{ lat: number; lng: number } \| null` | Yes | - | User position; adds the blue marker and jumps the map there once |
| `isGuest` | `boolean` | No | `false` | When true, clicking a preview card opens the auth modal instead of navigating |
| `onEnableLocation` | `() => void` | No | - | Passed to `MapZoomControls` to request location permission |
| `locationLoading` | `boolean` | No | `false` | Shows loading state on the locate control |
| `mapStyleOverride` | `'light' \| 'dark'` | No | - | Forces a map style; otherwise follows `resolvedTheme` from ThemeContext |

## Behavior

- Requires `VITE_MAPBOX_TOKEN`; renders a "Map not available" fallback without it
- Default center San Francisco (`-122.4194, 37.7749`) until user location arrives
- Markers are cached in a `Map` ref; only added/removed items are mutated
- Marker opacity reflects freshness (`getFreshnessOpacity`); selected marker re-renders larger with a pointer arrow
- Selected item preview: desktop card (top-left, photo + freshness bar + distance/time) and mobile horizontal card above the bottom nav; both navigate to `/item/:id` (or auth modal for guests)
- Style switches live when theme or `mapStyleOverride` changes; `ResizeObserver` keeps the map sized

## Usage Examples

```tsx
<DiscoverMapView
  items={filteredItems}
  userLocation={location}
  isGuest={!user}
  onEnableLocation={requestLocation}
  locationLoading={locationLoading}
/>
```

## States

- **No token**: static "Mapbox token not configured" message
- **Loading**: spinner overlay until the map `load` event
- **Selected item**: preview card with close button; claimed items show "Claimed by {first name}" overlay
- **Guest auth modal**: full-screen `FloatingAuthCard` overlay

## Dependencies

### Internal Dependencies

- `useTheme` from `src/contexts/ThemeContext` - Resolved light/dark style
- `FloatingAuthCard`, `MapZoomControls` - Child components
- `createUserLocationElement` from `src/components/UserLocationMarker`
- `calculateDistance`, `formatDistance` from `src/utils/distance`
- `formatTimeAgo`, `calculateRingDecay`, `getRingColor`, `getFreshnessColor`, `getFreshnessOpacity` from `src/utils/time`
- `getPreviewUrl` from `src/utils/image`
- `getClaimerFirstName` from `src/utils/format`
- `ItemWithProfile` from `src/types/database`

### External Dependencies

- `mapbox-gl` (+ CSS) - Map rendering
- `react-router-dom` - `useNavigate`
- `lucide-react` - X, Hand

## Related Components

- `ItemCard` - List-view counterpart
- `MapStyleToggle` - Style override control
- `ItemDetailMap` - Single-item map on the detail page

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-10 | Initial documentation |
