# CameraCapture

A full-screen camera interface for capturing or selecting photos with pinch-to-zoom support and image compression.

## Purpose

The CameraCapture component provides a native-like camera experience for capturing photos of items to post. It handles:

- Camera stream initialization with rear-facing preference
- Pinch-to-zoom gesture support on supported devices
- Photo capture with canvas rendering
- Gallery image selection as fallback
- Image compression before upload
- Graceful error handling when camera is unavailable

Use this component when users need to capture photos within the app, typically during the item posting flow.

## Props / Parameters

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onCapture` | `(dataUrl: string) => void` | Yes | - | Callback with compressed image data URL when photo is confirmed |
| `onCancel` | `() => void` | Yes | - | Callback when user cancels the capture flow |

### Prop Details

#### `onCapture`

Called when the user confirms their photo selection. The data URL passed is:
- Compressed using the `compressDataURL` utility
- Falls back to original if compression fails
- In JPEG format suitable for upload

#### `onCancel`

Called in these scenarios:
- User clicks the X button in camera view
- User clicks the X button after capturing/selecting an image
- Can be used to return to the previous screen

## Usage Examples

### Basic Usage

```tsx
import { CameraCapture } from '@/components/CameraCapture';

function PostPage() {
  const [showCamera, setShowCamera] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCapture = (dataUrl: string) => {
    setCapturedImage(dataUrl);
    setShowCamera(false);
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleCapture}
        onCancel={() => navigate(-1)}
      />
    );
  }

  return <ImagePreview src={capturedImage} />;
}
```

### In Multi-Step Flow

```tsx
function PostFlow() {
  const [step, setStep] = useState<'camera' | 'location' | 'details'>('camera');
  const [imageData, setImageData] = useState<string | null>(null);

  if (step === 'camera') {
    return (
      <CameraCapture
        onCapture={(dataUrl) => {
          setImageData(dataUrl);
          setStep('location');
        }}
        onCancel={() => navigate('/discover')}
      />
    );
  }

  // ... rest of flow
}
```

## Accessibility

### Keyboard Navigation

- `Tab`: Moves focus between capture, gallery, and cancel buttons
- `Enter/Space`: Activates the focused button
- Limited keyboard support for camera zoom (touch-only)

### ARIA Attributes

The component should be enhanced with:

| Attribute | Recommended Value | Purpose |
|-----------|-------------------|---------|
| `role` | `"dialog"` on container | Identifies as modal interface |
| `aria-label` | On buttons | Describes button actions |
| `aria-live` | `"polite"` on error messages | Announces errors to screen readers |

### Screen Reader Considerations

- Camera error message is displayed prominently
- Buttons use icon-only design; should have aria-labels
- Step indicator provides visual context but may need text alternatives

### Color Contrast

- White icons on dark/semi-transparent backgrounds
- Green confirmation button provides clear visual distinction
- Error text is visible against dark background

## Styling

### CSS Classes

Key Tailwind classes used:

- **Container**: `fixed inset-0 bg-black` - Full-screen black background
- **Video**: `w-full h-full object-cover` - Full-bleed camera preview
- **Top gradient**: `bg-gradient-to-b from-black/70 to-transparent` - Fade for step indicator
- **Bottom gradient**: `bg-gradient-to-t from-black/80 to-transparent` - Fade for controls
- **Buttons**: `bg-white/20 backdrop-blur-sm rounded-full` - Frosted glass effect
- **Capture button**: `p-2 bg-white rounded-full` - White ring design

### Safe Area Support

The component respects device safe areas:
- Top controls use `env(safe-area-inset-top)`
- Bottom controls use `env(safe-area-inset-bottom)`

### Theme Support

Uses fixed dark theme (black background, white controls) regardless of app theme setting, as is standard for camera interfaces.

## States

### Camera Preview State

Default state when camera is available:
- Live video feed displayed
- Capture button (white ring) in center
- Gallery button on left
- Cancel button on right
- Zoom indicator appears when zoom > 1x

### Camera Error State

When camera access fails:
- Camera icon with error message
- "Choose from gallery" button as alternative
- Cancel still available

### Photo Captured State

After taking photo or selecting from gallery:
- Static image preview displayed
- Retake button (rotate icon) on left
- Confirm button (checkmark) in center
- Cancel button on right

### Compressing State

After confirming photo:
- Confirm button shows loading spinner
- Button disabled during compression
- Other buttons remain but are non-functional

## Internal State

```typescript
const [capturedImage, setCapturedImage] = useState<string | null>(null);
const [cameraError, setCameraError] = useState<string | null>(null);
const [compressing, setCompressing] = useState(false);
const [zoomCapabilities, setZoomCapabilities] = useState<ZoomCapabilities | null>(null);
const [currentZoom, setCurrentZoom] = useState(1);
```

## Camera Features

### Video Constraints

```typescript
{
  facingMode: 'environment',  // Prefer rear camera
  width: { ideal: 1920 },     // Target HD resolution
  height: { ideal: 1080 }
}
```

### Zoom Support

- Detects device zoom capabilities via `MediaTrackCapabilities`
- Supports pinch-to-zoom gestures
- Applies zoom via `applyConstraints` on video track
- Displays current zoom level when > 1x

### Photo Capture

- Uses canvas to capture video frame
- Outputs JPEG at 80% quality
- Passes through compression utility for upload optimization

## Edge Cases

### No Camera Permission

Displays error message and offers gallery selection as alternative.

### Camera Not Available

Same handling as permission denied - gallery fallback.

### Pinch Zoom Not Supported

Zoom indicator and functionality simply don't appear. Component works normally without zoom.

### Gallery Selection

- Uses file input with `accept="image/*"` and `capture="environment"`
- FileReader converts to data URL
- Same preview/confirm flow as camera capture

### Page Zoom Prevention

Component prevents browser pinch-to-zoom to avoid conflicts:
- Sets `touchAction: 'none'` on container
- Adds touchmove listener to prevent multi-touch zoom
- Resets visual viewport if scaled

### Compression Failure

If compression fails, falls back to original captured image.

## Dependencies

### Internal Dependencies

- `compressDataURL` from `@/utils/image` - Image compression utility
- `StepIndicator` from `@/components/LocationPermissionScreen` - Step progress indicator

### External Dependencies

- `lucide-react` - Icons (Camera, X, RotateCcw, Check, ImagePlus, Loader2)
- `react` - useState, useRef, useCallback, useEffect hooks

### Browser APIs

- `navigator.mediaDevices.getUserMedia` - Camera access
- `MediaStreamTrack.getCapabilities` - Zoom detection
- `MediaStreamTrack.applyConstraints` - Zoom control
- `FileReader` - Gallery image loading
- `Canvas` - Photo capture

## Testing Considerations

### Unit Tests

```tsx
describe('CameraCapture', () => {
  beforeEach(() => {
    // Mock getUserMedia
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: jest.fn().mockResolvedValue({
          getTracks: () => [{ stop: jest.fn(), getCapabilities: () => ({}) }],
          getVideoTracks: () => [{ getCapabilities: () => ({}), getSettings: () => ({}) }],
        }),
      },
    });
  });

  it('calls onCancel when X button clicked', () => {
    const onCancel = jest.fn();
    render(<CameraCapture onCapture={() => {}} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('shows error state when camera unavailable', async () => {
    navigator.mediaDevices.getUserMedia = jest.fn().mockRejectedValue(new Error());
    render(<CameraCapture onCapture={() => {}} onCancel={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText(/Unable to access camera/)).toBeInTheDocument();
    });
  });

  it('shows gallery button in error state', async () => {
    navigator.mediaDevices.getUserMedia = jest.fn().mockRejectedValue(new Error());
    render(<CameraCapture onCapture={() => {}} onCancel={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText('Choose from gallery')).toBeInTheDocument();
    });
  });
});
```

### Integration Tests

1. Full capture flow: camera -> capture -> confirm -> callback
2. Gallery selection flow: gallery -> select -> confirm -> callback
3. Retake flow: capture -> retake -> capture again
4. Cancel at various stages

### Device Testing

- Test on devices with/without zoom support
- Test on devices with front-only cameras
- Test permission denial flow
- Test in various orientations

## Related Components

- `PostPage` - Parent component that uses CameraCapture
- `LocationPermissionScreen` - Related permission/step flow
- `StepIndicator` - Reused progress indicator

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-12-06 | Initial implementation with basic capture |
| 1.1.0 | 2024-12-06 | Added pinch-to-zoom support |
| 1.2.0 | 2024-12-06 | Added image compression |
| 1.3.0 | 2024-12-06 | Added safe area support |
