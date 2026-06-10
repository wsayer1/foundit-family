# AuthBackgroundGrid

Animated full-screen background of horizontally scrolling item cards, used behind the auth/landing UI.

## Purpose

Creates a lively "marquee" backdrop of recent finds on auth screens. Fetches the latest items with images from Supabase and falls back to a built-in list of 25 placeholder cards (Pexels images) when fewer items exist. Rows alternate scroll direction; tapping a card pauses its row and expands the card.

## Props / Parameters

None — the component is self-contained.

## Behavior

- Responsive row count: 2 rows on mobile, 5 rows at `>= 768px` (via internal `useResponsiveRowCount` hook)
- Fetches `rowCount * 5` items (`items` joined with `profiles`), newest first, only items with an image
- Cards show title (description), category badge, and a status badge for claimed/expired items (grayscale + dimmed image)
- Tapping a card toggles pause/expand for that row; tapping again resumes
- Infinite scroll achieved by tripling each row's cards and animating `translateX` keyframes (`scroll-left` / `scroll-right`, 30s + 5s per row)

## Usage Examples

```tsx
import { AuthBackgroundGrid } from '../components/AuthBackgroundGrid';

function AuthPage() {
  return (
    <>
      <AuthBackgroundGrid />
      <FloatingAuthCard ... />
    </>
  );
}
```

## States

- **Loading**: fixed dark (`bg-stone-950`) screen with pulsing skeleton card rows
- **Loaded**: scrolling rows between a 160px top offset and a 280px bottom reserve (room for the auth card), with a bottom fade gradient

## Edge Cases

- Fewer DB items than slots: remaining slots filled cyclically from `PLACEHOLDERS`
- Fetch errors are silently tolerated (empty data → all placeholders)
- Resize listener updates row count live

## Dependencies

### Internal Dependencies

- `supabase` from `src/lib/supabase` - Items query
- `ItemWithProfile` from `src/types/database`
- `getThumbnailUrl` from `src/utils/image`

### External Dependencies

- `lucide-react` - Clock, CheckCircle

## Related Components

- `FloatingAuthCard` - Renders on top of this background
- `GuestHero` - Related guest-facing UI

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-10 | Initial documentation |
