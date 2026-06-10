# ConfirmationPhotoCapture

Minimal camera capture UI for taking a "still there" verification photo of an item.

## Purpose

Used in the item verification flow: opens the rear camera, shows a live preview, and returns a single JPEG snapshot as a data URL. Lighter-weight than the main `CameraCapture` posting flow (no flash, retake, or multi-step UI).

## Props / Parameters

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onCapture` | `(dataUrl: string) => void` | Yes | - | Receives the captured photo as `image/jpeg` data URL (quality 0.8) |
| `onCancel` | `() => void` | Yes | - | Called from the Cancel button (in both preview and error states) |

## Behavior

- On mount, requests `getUserMedia` with `facingMode: 'environment'` and ideal 1920x1080
- "Take Photo" draws the current video frame to an offscreen canvas at native video resolution, stops all tracks, then calls `onCapture(dataUrl)`
- Camera tracks are also stopped via the effect cleanup on unmount
- If camera access fails, renders an error state ("Unable to access camera") with only a Cancel button

## Usage Examples

```tsx
{verifying && (
  <ConfirmationPhotoCapture
    onCapture={(dataUrl) => submitVerification(dataUrl)}
    onCancel={() => setVerifying(false)}
  />
)}
```

## Styling

- `max-w-lg` column with a 3:4 (`aspect-[3/4]`) rounded video preview on `bg-stone-900`
- Dark-toned buttons (designed for a dark overlay/host screen): stone Cancel, emerald Take Photo
- Video uses `autoPlay playsInline muted` for mobile inline playback

## Edge Cases

- Permission denied / no camera: error state, no retry (cancel only)
- Capture is a no-op if the video ref or canvas context is unavailable
- Caller must host this inside its own overlay/screen; the component renders inline content only

## Dependencies

### Internal Dependencies

None.

### External Dependencies

- `lucide-react` - Camera
- Browser `navigator.mediaDevices.getUserMedia` and canvas APIs

## Related Components

- `CameraCapture` - Full posting-flow camera
- `ItemDetailMap` - Proximity gate that typically precedes verification

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-10 | Initial implementation and documentation |
