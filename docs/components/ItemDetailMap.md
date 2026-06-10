# ItemDetailMap

Compact Mapbox map for the item detail page showing the item's location, a 100m proximity circle, the user's position, and driving/walking travel-time badges.

## Purpose

Visualizes how close the user is to a find and whether they are within interaction range. The proximity circle turns emerald when the user is within `PROXIMITY_RADIUS_METERS` (can verify/claim) and amber otherwise. Gets user location from `LocationContext` and travel estimates from the `useTravelTimes` hook internally.

## Exports

- `ItemDetailMap` - The component
- `PROXIMITY_RADIUS_METERS` - `100`; shared threshold for verify/claim eligibility

## Props / Parameters

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `item` | `ItemWithProfile` | Yes | - | Item whose `latitude`/`longitude` center the map and proximity circle |

## Behavior

- Requires `VITE_MAPBOX_TOKEN`; without it shows a static "Map unavailable" placeholder
- Draws a GeoJSON polygon circle (64 segments) as fill + dashed stroke layers around the item; green item pin marker; jumps to zoom 16
- With a user location: adds a pulsing blue user marker, recolors the circle by proximity (`calculateDistance` vs 100m), fits bounds around both points (zoom capped by spread), and calls `fetchTravelTimes(...)` with an `AbortController` signal
- Without location (permission not granted): bottom overlay with an "Enable location" button calling `requestLocation(true)`
- Info button toggles a proximity tooltip ("You're within range!" / "Get closer to interact")
- Map errors or a 10s load timeout show a Retry overlay that fully reinitializes the map
- `ResizeObserver` keeps the map sized; map and markers cleaned up on unmount

## Usage Examples

```tsx
import { ItemDetailMap, PROXIMITY_RADIUS_METERS } from '../components/ItemDetailMap';

<ItemDetailMap item={item} />

// Reusing the threshold elsewhere
const canClaim = distance <= PROXIMITY_RADIUS_METERS;
```

## States

- **Loading**: spinner until map `load` fires (or token-missing placeholder)
- **Error**: MapPinOff icon + Retry button
- **No location**: gradient overlay with Enable location CTA (spinner while requesting)
- **Travel times**: Car / Footprints badges (top-left) when `travelTimes.driving` / `.walking` are available

## Styling

- Fixed-height container: `h-48 rounded-2xl overflow-hidden`; light Mapbox streets style
- Frosted white/stone badges and tooltip; dark mode supported on overlays

## Edge Cases

- Travel-time fetches aborted when location/item changes or on unmount
- Reacts to item coordinate changes by moving the circle/marker rather than recreating the map
- Proximity state also drives the Info icon color (emerald vs amber)

## Dependencies

### Internal Dependencies

- `useLocation` from `src/contexts/LocationContext` - `location`, `permissionStatus`, `requestLocation`, `loading`
- `useTravelTimes` from `src/hooks/useTravelTimes` - `travelTimes`, `fetchTravelTimes`
- `calculateDistance` from `src/utils/distance`
- `ItemWithProfile` from `src/types/database`

### External Dependencies

- `mapbox-gl` (+ CSS)
- `lucide-react` - MapPin, Loader2, Car, Footprints, MapPinOff, Info, RefreshCw

## Related Components

- `DiscoverMapView` - Multi-item map
- `ConfirmationPhotoCapture` - Verification flow gated by this proximity check

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-10 | Initial implementation and documentation |
