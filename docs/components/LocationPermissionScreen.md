# LocationPermissionScreen

Full-screen step-1 permission primer for the posting flow, plus the shared `StepIndicator` used across posting steps.

## Purpose

Shown before the browser permission prompts when a user starts sharing a find. Explains why location and camera access are needed and hands control back via `onGranted` when the user taps Continue (the actual browser prompts are triggered by the parent).

## Exports

- `LocationPermissionScreen` - The screen component
- `StepIndicator` - 3-step progress indicator (1 "Take a photo", 2 "Set location", 3 "Add description"), reused by `DescriptionEditor`

## Props / Parameters

### LocationPermissionScreen

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onGranted` | `() => void` | Yes | - | Called when the user taps Continue |

### StepIndicator

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `currentStep` | `number` | Yes | - | 1-based active step; earlier steps render a check mark |

## Usage Examples

```tsx
import { LocationPermissionScreen, StepIndicator } from '../components/LocationPermissionScreen';

{needsPermissions && (
  <LocationPermissionScreen onGranted={startCameraAndLocation} />
)}

// Reusing the indicator on another step
<StepIndicator currentStep={3} />
```

## Styling

- Fixed full-screen emerald→teal→cyan gradient with blurred decorative circles
- Safe-area-aware top (StepIndicator) and bottom (Continue button) padding
- Two info tiles (Location access / Camera access) in frosted `bg-white/10` cards
- StepIndicator: completed/current steps emerald, current ringed, upcoming steps `bg-white/20`

Note: StepIndicator uses white/light-on-gradient styling and is intended for gradient backgrounds.

## Edge Cases

- Purely presentational: it does not call `getUserMedia` or geolocation itself; the parent must trigger the real permission prompts after `onGranted`
- Copy warns users that browser prompts will follow

## Dependencies

### Internal Dependencies

None.

### External Dependencies

- `lucide-react` - MapPin, Navigation, Camera, Check

## Related Components

- `DescriptionEditor` - Imports `StepIndicator` for step 3
- `CameraCapture` - The capture step that follows

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-10 | Initial documentation |
