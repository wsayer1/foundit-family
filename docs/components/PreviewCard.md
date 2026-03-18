# PreviewCard

A non-navigable preview card for displaying item listings without revealing full details, used for guests and expired/past items.

## Purpose

PreviewCard is used in the Discover page to show item previews in contexts where full item detail navigation is not desired:
- Guest users who have not signed in see PreviewCard instead of ItemCard
- Empty state sections showing recent/past listings use PreviewCard to give a sense of platform activity
- Expired items display a "Past listing" badge to indicate they are no longer active

Unlike ItemCard, PreviewCard does not show distance, edit buttons, or confirmation counts. It is a simpler, read-only representation.

## Props / Parameters

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `item` | `ItemWithProfile` | Yes | - | The item data including profile information |
| `onClick` | `() => void` | No | `undefined` | Optional click handler (e.g., to show auth modal for guests) |

### Prop Details

#### `item`

Same `ItemWithProfile` type used by `ItemCard`. Key fields used:
- `image_url`: URL to the item's image
- `description`: Text description of the item
- `created_at`: Timestamp for time display
- `last_confirmed_at`: Used to calculate freshness/expiry
- `status`: Item availability status
- `profiles`: Nested profile data (username, avatar_url)

#### `onClick`

When provided, the card becomes clickable with hover effects. Typically used to trigger an auth modal for guest users.

## Usage Examples

### Guest Preview (with auth modal trigger)

```tsx
<PreviewCard
  item={item}
  onClick={() => setShowAuthModal(true)}
/>
```

### Static Preview (no interaction)

```tsx
<PreviewCard item={item} />
```

### Loading State (Skeleton)

```tsx
import { PreviewCardSkeleton } from '@/components/PreviewCard';

<div className="grid gap-4">
  {[1, 2, 3].map((i) => (
    <PreviewCardSkeleton key={i} />
  ))}
</div>
```

## Accessibility

### Keyboard Navigation

- When `onClick` is provided, the card has `cursor-pointer` but renders as a `<div>` (not a button)
- Consider wrapping in a button or adding keyboard handling if full accessibility is needed

### Screen Reader Considerations

- Image alt text uses the item description
- "Past listing" badge is visible text, announced by screen readers

## Styling

### CSS Classes

- **Container**: `bg-white dark:bg-stone-900 rounded-2xl shadow-sm` - Matches ItemCard styling
- **Expired image**: `opacity-70 grayscale-[30%]` - Subtle visual dimming for past listings
- **Past listing badge**: `bg-stone-700/90 backdrop-blur-sm` - Dark semi-transparent badge in top-left corner
- **Hover** (when clickable): `hover:shadow-md group-hover:scale-105` - Interactive feedback

### Theme Support

Fully supports light/dark mode through `dark:` variants.

## States

### Active Item

Shows the item normally with freshness bar, similar to ItemCard but without distance/edit/confirmation UI.

### Expired/Past Item

When `calculateRingDecay` returns 0:
- Image is dimmed with reduced opacity and slight grayscale
- "Past listing" badge appears in the top-left corner with a clock icon
- Freshness bar shows as empty (depleted)

### Skeleton State

`PreviewCardSkeleton` provides matching placeholder dimensions with individual `animate-pulse` elements.

## Dependencies

### Internal Dependencies

- `ItemWithProfile` from `@/types/database`
- `formatTimeAgo`, `calculateRingDecay`, `getFreshnessColor` from `@/utils/time`
- `getThumbnailUrl`, `getAvatarUrl` from `@/utils/image`

### External Dependencies

- `lucide-react` - Icons (Clock, User)

## Related Components

- `ItemCard` - Full interactive card for authenticated users
- `ItemCardSkeleton` - Loading placeholder in ItemCard file
- `DiscoverPage` - Primary consumer of PreviewCard

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-18 | Initial implementation with past listing badge and skeleton |
