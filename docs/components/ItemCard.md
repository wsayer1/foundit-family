# ItemCard

A card component that displays a street find item with image, description, metadata, and freshness indicator.

## Purpose

The ItemCard is the primary visual representation of street find items throughout the application. It handles:

- Displaying item images with thumbnail optimization
- Showing item status (available vs claimed)
- Displaying user attribution with avatar
- Showing distance from user location when available
- Visualizing item freshness with a progress bar
- Providing edit access for item owners

Use this component in list views, grids, and anywhere items need to be displayed in a compact, interactive format.

## Props / Parameters

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `item` | `ItemWithProfile` | Yes | - | The item data including profile information |
| `userLocation` | `{ lat: number; lng: number } \| null` | No | `undefined` | User's current location for distance calculation |
| `currentUserId` | `string \| null` | No | `undefined` | Current authenticated user's ID for ownership check |
| `onClick` | `() => void` | No | `undefined` | Callback when the card is clicked |
| `onEdit` | `() => void` | No | `undefined` | Callback when the edit button is clicked (owner only) |

### Prop Details

#### `item`

The main data object containing:
- `image_url`: URL to the item's image
- `description`: Text description of the item
- `latitude`/`longitude`: Item location coordinates
- `created_at`: Timestamp for time display
- `last_confirmed_at`: Last verification timestamp for freshness
- `still_there_count`: Number of confirmations
- `status`: Either `'available'` or `'claimed'`
- `user_id`: Owner's user ID
- `profiles`: Nested profile data (username, avatar_url)
- `claimer_profile`: Profile of user who claimed the item

#### `userLocation`

When provided, the card calculates and displays the distance between the user and the item. Distance is formatted automatically (meters for close items, kilometers for distant).

#### `currentUserId`

Used to determine if the current user owns the item. Owners see an edit button overlay on their items.

## Usage Examples

### Basic Usage

```tsx
import { ItemCard } from '@/components/ItemCard';

function ItemList({ items }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onClick={() => navigateToDetail(item.id)}
        />
      ))}
    </div>
  );
}
```

### With User Location

```tsx
<ItemCard
  item={item}
  userLocation={{ lat: 37.7749, lng: -122.4194 }}
  onClick={() => handleItemClick(item)}
/>
```

### With Edit Capability

```tsx
<ItemCard
  item={item}
  currentUserId={user?.id}
  onClick={() => navigateToDetail(item.id)}
  onEdit={() => setEditingItem(item)}
/>
```

### Loading State (Skeleton)

```tsx
import { ItemCardSkeleton } from '@/components/ItemCard';

function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <ItemCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

## Accessibility

### Keyboard Navigation

- `Tab`: Focuses the entire card button
- `Enter/Space`: Activates the card click handler
- Edit button is separately focusable within the card

### ARIA Attributes

The component renders as a semantic `<button>` element, providing implicit accessibility:

| Attribute | Implementation | Purpose |
|-----------|----------------|---------|
| Native button | `<button>` wrapper | Provides keyboard and screen reader support |
| `alt` on images | Item description | Describes the image content |

### Screen Reader Considerations

- The entire card is announced as a button
- Image alt text uses the item description
- Edit button uses the Pencil icon which should have aria-label added for better accessibility

### Color Contrast

- White text on dark overlays meets WCAG AA standards
- Freshness bar colors provide visual differentiation
- Dark mode variants maintain contrast ratios

## Styling

### CSS Classes

Key Tailwind classes used:

- **Container**: `bg-white dark:bg-stone-900 rounded-2xl shadow-sm` - Card background with rounded corners
- **Image**: `aspect-[4/3] object-cover` - Consistent image aspect ratio
- **Hover**: `hover:shadow-md group-hover:scale-105` - Interactive feedback
- **Claimed overlay**: `bg-stone-700/90 backdrop-blur-sm` - Semi-transparent claimed banner

### Theme Support

Fully supports light/dark mode through `dark:` variants on:
- Background colors (`dark:bg-stone-900`, `dark:bg-stone-800`)
- Text colors (`dark:text-stone-200`, `dark:text-stone-400`)
- Border and separator colors (`dark:text-stone-600`)
- Freshness bar background (`dark:bg-stone-700`)

## States

### Available State

Default state showing:
- Full-opacity image
- Hover zoom effect on image
- Freshness progress bar
- Confirmation count badge (if > 0)
- Edit button (if owner)

### Claimed State

When `item.status === 'claimed'`:
- Image opacity reduced to 60%
- Diagonal "Claimed by [Name]" banner overlay
- No hover zoom effect
- No freshness bar
- No edit button

### Skeleton State

`ItemCardSkeleton` component provides:
- Animated pulse placeholder for image
- Animated text placeholders
- Animated avatar and metadata placeholders
- Matching dimensions to real cards

## Edge Cases

### Missing User Profile

If `item.profiles` is undefined, displays "Anonymous" as username and shows a default user icon instead of avatar.

### Missing Avatar

Falls back to a User icon placeholder within the avatar circle.

### No User Location

When `userLocation` is null, the distance section is not rendered at all.

### Long Descriptions

Text is truncated to 2 lines using `line-clamp-2`.

### Long Usernames

Username is truncated with `max-w-[80px] truncate`.

### Zero Confirmations

The thumbs-up badge is not shown when `still_there_count` is 0.

## Dependencies

### Internal Dependencies

- `ItemWithProfile` from `@/types/database` - Type definition
- `formatTimeAgo`, `calculateFreshness`, `getFreshnessColor` from `@/utils/time` - Time utilities
- `formatDistance`, `calculateDistance` from `@/hooks/useItems` - Distance utilities
- `getThumbnailUrl`, `getAvatarUrl` from `@/utils/image` - Image URL utilities

### External Dependencies

- `lucide-react` - Icons (MapPin, Clock, ThumbsUp, Pencil, User, Hand)

## Testing Considerations

### Unit Tests

```tsx
describe('ItemCard', () => {
  const mockItem = {
    id: '1',
    description: 'Free couch',
    image_url: 'https://example.com/image.jpg',
    latitude: 37.7749,
    longitude: -122.4194,
    created_at: new Date().toISOString(),
    status: 'available',
    still_there_count: 5,
    user_id: 'user-1',
    profiles: { username: 'testuser', avatar_url: null },
  };

  it('renders item description', () => {
    render(<ItemCard item={mockItem} />);
    expect(screen.getByText('Free couch')).toBeInTheDocument();
  });

  it('shows edit button for owner', () => {
    render(<ItemCard item={mockItem} currentUserId="user-1" onEdit={() => {}} />);
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('hides edit button for non-owner', () => {
    render(<ItemCard item={mockItem} currentUserId="other-user" />);
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });

  it('shows claimed banner when item is claimed', () => {
    const claimedItem = { ...mockItem, status: 'claimed', claimer_profile: { username: 'claimer' } };
    render(<ItemCard item={claimedItem} />);
    expect(screen.getByText(/Claimed by/)).toBeInTheDocument();
  });

  it('shows distance when userLocation provided', () => {
    render(<ItemCard item={mockItem} userLocation={{ lat: 37.78, lng: -122.42 }} />);
    expect(screen.getByText(/km|m/)).toBeInTheDocument();
  });
});
```

### Integration Tests

1. Card click navigation to detail page
2. Edit button opening edit modal
3. Loading skeleton display during data fetch

### Accessibility Tests

- Verify card is keyboard focusable
- Verify edit button stops propagation correctly
- Test with screen reader for proper announcements

## Related Components

- `ItemDetailPage` - Full page view of an item
- `EditItemModal` - Modal for editing owned items
- `ItemCardSkeleton` - Loading placeholder (exported from same file)
- `DiscoverPage` - Primary consumer displaying item grids

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-12-06 | Initial implementation with basic display |
| 1.1.0 | 2024-12-20 | Added freshness indicator and confirmation count |
| 1.2.0 | 2024-12-30 | Added claimed status display with claimer name |
