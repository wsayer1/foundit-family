# PullToRefresh

A touch-enabled pull-to-refresh wrapper component that provides native-like refresh behavior for scrollable content.

## Purpose

The PullToRefresh component wraps scrollable content and provides a pull-down gesture to trigger data refresh. It handles:

- Touch gesture detection and tracking
- Visual feedback with animated pull indicator
- Threshold-based refresh triggering
- Loading state management during refresh
- Smooth animations and transitions

Use this component to wrap any vertically scrollable content that needs refresh functionality, typically feed or list views.

## Props / Parameters

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onRefresh` | `() => Promise<void> \| void` | Yes | - | Async callback to execute refresh logic |
| `children` | `ReactNode` | Yes | - | Scrollable content to wrap |
| `className` | `string` | No | `''` | Additional CSS classes for the container |

### Prop Details

#### `onRefresh`

Called when the pull gesture exceeds the threshold and is released. The component:
- Waits for the returned Promise to resolve (if async)
- Adds a minimum 300ms delay after completion for visual feedback
- Returns to default state after refresh completes

#### `children`

Any React content. The container provides:
- Vertical scrolling with `overflow-auto`
- iOS momentum scrolling with `-webkit-overflow-scrolling: touch`
- Overscroll containment with `overscrollBehavior: 'contain'`

#### `className`

Applied to the outer scrollable container. Useful for setting height constraints.

## Constants

```typescript
const THRESHOLD = 80;        // Minimum pull distance to trigger refresh (px)
const MAX_PULL = 120;        // Maximum visual pull distance (px)
const RESISTANCE = 2.5;      // Damping factor for pull (higher = more resistance)
const MIN_PULL_TIME_MS = 100; // Minimum pull duration to trigger refresh
```

## Usage Examples

### Basic Usage

```tsx
import { PullToRefresh } from '@/components/PullToRefresh';

function ItemFeed() {
  const { items, refresh } = useItems();

  return (
    <PullToRefresh onRefresh={refresh} className="h-full">
      <div className="space-y-4 p-4">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </PullToRefresh>
  );
}
```

### With Async Refresh

```tsx
<PullToRefresh
  onRefresh={async () => {
    await fetchNewItems();
    await updateCache();
  }}
  className="flex-1 overflow-auto"
>
  <ItemList />
</PullToRefresh>
```

### In Page Layout

```tsx
function DiscoverPage() {
  return (
    <Layout>
      <Header />
      <PullToRefresh
        onRefresh={handleRefresh}
        className="flex-1"
      >
        <FilterBar />
        <ItemGrid />
      </PullToRefresh>
    </Layout>
  );
}
```

## Accessibility

### Keyboard Navigation

Pull-to-refresh is a touch-only interaction. For keyboard users, ensure:
- A refresh button is available as an alternative
- Content can be refreshed via keyboard shortcuts if needed

### ARIA Attributes

The component should be enhanced with:

| Attribute | Recommended Value | Purpose |
|-----------|-------------------|---------|
| `aria-live` | `"polite"` on indicator | Announces refresh state changes |
| `aria-busy` | `true` during refresh | Indicates loading state |
| `role` | `"status"` on indicator | Identifies as status message |

### Screen Reader Considerations

- The visual indicator is purely decorative for sighted users
- Consider announcing "Refreshing" and "Refresh complete" for screen readers
- Ensure refreshed content changes are perceivable

### Color Contrast

- Indicator uses emerald on white/dark backgrounds
- Inactive indicator uses stone colors with sufficient contrast
- Transitions maintain visibility throughout

## Styling

### CSS Classes

Key Tailwind classes used:

- **Container**: `overflow-auto relative` - Scrollable wrapper
- **Indicator**: `w-10 h-10 rounded-full shadow-lg` - Circular refresh icon
- **Active indicator**: `bg-emerald-500 text-white` - Ready/refreshing state
- **Inactive indicator**: `bg-white dark:bg-stone-800` - Default pulling state
- **Animation**: `transition-all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` - Smooth easing

### Theme Support

Supports light/dark mode through:
- Indicator background (`dark:bg-stone-800`)
- Icon color (`dark:text-stone-300`)
- Consistent emerald accent in both modes

## States

### Idle State

- Indicator hidden above viewport (top: -50px)
- Content at normal position
- No visual feedback

### Pulling State

As user pulls down:
- Indicator moves down following finger
- Indicator scales from 50% to 100%
- Indicator opacity increases from 0 to 1
- Icon rotates up to 180 degrees
- Content follows indicator position

### Ready State

When pull exceeds threshold (80px):
- Indicator turns emerald
- User can release to refresh
- Visual feedback shows ready state

### Refreshing State

After release when threshold met:
- Indicator stays visible at 60px position
- Icon animates with spin
- `onRefresh` callback executes

### Completing State

After refresh completes:
- 300ms delay for visual feedback
- Indicator animates back to hidden
- Content returns to top

## Internal State

```typescript
const [pullDistance, setPullDistance] = useState(0);
const [isRefreshing, setIsRefreshing] = useState(false);
const [isPulling, setIsPulling] = useState(false);

// Refs for gesture tracking
const startY = useRef(0);
const currentY = useRef(0);
const pullStartTime = useRef(0);
const wasAtTopOnStart = useRef(false);
```

## Gesture Logic

### Touch Start

1. Check if not already refreshing
2. Check if scrolled to top
3. Record start position and time
4. Set pulling state

### Touch Move

1. Verify still pulling and at top
2. Calculate pull distance with resistance damping
3. Prevent default to stop page bounce
4. Update visual position

### Touch End

1. Check minimum pull time (100ms) to prevent accidental triggers
2. Check if threshold exceeded (80px)
3. If valid, trigger refresh
4. Otherwise, animate back to start

## Edge Cases

### Not At Top

Pull gesture only activates when content is scrolled to the very top (scrollTop <= 0).

### Accidental Swipes

Minimum pull time (100ms) prevents accidental refresh from quick swipes.

### During Refresh

New pull gestures are ignored while a refresh is in progress.

### Sync Callbacks

If `onRefresh` returns void (not a Promise), the component still works correctly.

### Nested Scrollables

The component uses `overscrollBehavior: 'contain'` to prevent parent scroll interference.

### iOS Bounce

The resistance factor (2.5) provides natural feeling similar to native iOS pull-to-refresh.

## Dependencies

### Internal Dependencies

None - self-contained component.

### External Dependencies

- `lucide-react` - RefreshCw icon
- `react` - useState, useRef, useCallback, useEffect hooks

## Testing Considerations

### Unit Tests

```tsx
describe('PullToRefresh', () => {
  it('renders children correctly', () => {
    render(
      <PullToRefresh onRefresh={() => {}}>
        <div>Test content</div>
      </PullToRefresh>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies className to container', () => {
    const { container } = render(
      <PullToRefresh onRefresh={() => {}} className="custom-class">
        <div>Content</div>
      </PullToRefresh>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('calls onRefresh when threshold exceeded', async () => {
    const onRefresh = jest.fn().mockResolvedValue(undefined);
    const { container } = render(
      <PullToRefresh onRefresh={onRefresh}>
        <div>Content</div>
      </PullToRefresh>
    );

    const scrollContainer = container.firstChild;

    // Simulate pull gesture
    fireEvent.touchStart(scrollContainer, {
      touches: [{ clientY: 0 }],
    });

    // Wait for MIN_PULL_TIME_MS
    await new Promise((r) => setTimeout(r, 150));

    fireEvent.touchMove(scrollContainer, {
      touches: [{ clientY: 250 }], // > THRESHOLD * RESISTANCE
    });

    fireEvent.touchEnd(scrollContainer);

    await waitFor(() => {
      expect(onRefresh).toHaveBeenCalled();
    });
  });

  it('does not call onRefresh below threshold', async () => {
    const onRefresh = jest.fn();
    const { container } = render(
      <PullToRefresh onRefresh={onRefresh}>
        <div>Content</div>
      </PullToRefresh>
    );

    const scrollContainer = container.firstChild;

    fireEvent.touchStart(scrollContainer, {
      touches: [{ clientY: 0 }],
    });

    fireEvent.touchMove(scrollContainer, {
      touches: [{ clientY: 50 }], // Below threshold
    });

    fireEvent.touchEnd(scrollContainer);

    expect(onRefresh).not.toHaveBeenCalled();
  });
});
```

### Integration Tests

1. Refresh updates displayed data
2. Multiple consecutive refreshes work correctly
3. Error during refresh doesn't break component

### Manual Testing

- Test on actual touch devices
- Verify iOS Safari behavior
- Test with various content heights
- Test scroll position preservation after refresh

## Related Components

- `DiscoverPage` - Primary consumer of PullToRefresh
- `Layout` - Often used together for page structure

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-12-06 | Initial implementation |
| 1.1.0 | 2024-12-06 | Added minimum pull time to prevent accidental triggers |
| 1.2.0 | 2024-12-06 | Added iOS-style resistance and animations |
