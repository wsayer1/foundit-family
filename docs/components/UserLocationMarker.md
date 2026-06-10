# UserLocationMarker

DOM element factory for the blue pulsing "you are here" marker used on Mapbox maps. **Not a React component.**

## Purpose

Mapbox GL markers require raw DOM elements, so this module exports a single factory function instead of JSX. It builds a 56x56px container with two animated pulse circles and a central blue dot, used by map views to mark the user's position.

## Exports

```typescript
export function createUserLocationElement(): HTMLElement;
```

Returns a `div.user-location-marker` containing:
- Outer pulse circle (56px, `rgba(59,130,246,0.15)`, `pulseOuter` 2s infinite)
- Inner pulse circle (40px, `rgba(59,130,246,0.25)`, `pulseInner` 2s infinite)
- Solid blue dot (20px, `#3b82f6`, white border, drop shadow)

All elements are `pointer-events: none` and the container has `z-index: 9999`.

## Usage Examples

```tsx
import mapboxgl from 'mapbox-gl';
import { createUserLocationElement } from '../components/UserLocationMarker';

const el = createUserLocationElement();
const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
  .setLngLat([lng, lat])
  .addTo(map);
```

## Edge Cases

- The `pulseOuter` / `pulseInner` CSS `@keyframes` must be defined globally (e.g., in the app stylesheet); the factory only references them
- Caller is responsible for removing the Mapbox marker to detach the element
- Marker is non-interactive (pointer events disabled), so it never blocks map clicks

## Dependencies

### Internal Dependencies

None.

### External Dependencies

None (plain DOM APIs). Consumers pair it with `mapbox-gl`.

## Related Components

- `DiscoverMapView` - Uses this factory for the user marker
- `ItemDetailMap` - Renders its own inline user marker variant

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-10 | Initial documentation; module exports only `createUserLocationElement()` (no React component) |
