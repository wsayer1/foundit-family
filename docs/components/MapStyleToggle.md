# MapStyleToggle

Toggle button to switch map between light and dark styles.

## Purpose

Provides a Sun/Moon toggle on the map view allowing users to independently control the map tile style (light vs dark) regardless of the app's global theme setting. Preference is persisted in localStorage.

## Props / Parameters

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `style` | `'light' \| 'dark'` | Yes | - | Current map style |
| `onChange` | `(style: 'light' \| 'dark') => void` | Yes | - | Callback when style is toggled |
| `className` | `string` | No | `''` | Additional CSS classes |

## Usage Examples

```tsx
<MapStyleToggle
  style={mapStyle || 'dark'}
  onChange={handleMapStyleChange}
/>
```

## Styling

- Matches MapZoomControls button appearance (rounded-xl, backdrop blur)
- Sun icon (amber) shown when in dark mode
- Moon icon (stone) shown when in light mode
- 44px hit target for accessibility

## Dependencies

### External Dependencies

- `lucide-react` - Icons (Sun, Moon)

## Related Components

- `DiscoverMapView` - Accepts `mapStyleOverride` prop controlled by this toggle
- `MapZoomControls` - Sibling control on the map UI

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-18 | Initial implementation |
