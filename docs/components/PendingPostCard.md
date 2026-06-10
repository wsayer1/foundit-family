# PendingPostCard

Compact optimistic-UI card showing an in-flight post's upload progress, success, or error state.

## Purpose

Rendered at the top of a list while a new find is being uploaded in the background, so users get immediate feedback after tapping Post. Purely presentational — the parent drives the status.

## Exports

- `PendingPostCard` - The component
- `PostingStatus` - `'uploading' | 'success' | 'error'`

## Props / Parameters

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `imageData` | `string` | Yes | - | Data URL (or URL) of the pending photo thumbnail |
| `description` | `string` | Yes | - | Description text, clamped to 2 lines |
| `status` | `PostingStatus` | Yes | - | Drives which state row is rendered |
| `error` | `string` | No | - | Error message shown when `status === 'error'`; falls back to "Failed to post" |

## Usage Examples

```tsx
import { PendingPostCard, PostingStatus } from '../components/PendingPostCard';

const [status, setStatus] = useState<PostingStatus>('uploading');

{pendingPost && (
  <PendingPostCard
    imageData={pendingPost.imageData}
    description={pendingPost.description}
    status={status}
    error={uploadError ?? undefined}
  />
)}
```

## States

- **uploading**: pulsing emerald progress bar (static 2/3 width) + spinner with "Posting" label
- **success**: emerald check badge with "Posted successfully"
- **error**: red text with `error` or the default message

## Styling

- Horizontal card: 64px rounded thumbnail + text column; `rounded-2xl`, subtle border/shadow, `mb-4`
- Full dark mode support via `dark:` variants

## Edge Cases

- Progress bar is indeterminate (animated pulse), not tied to real upload progress
- Parent is responsible for removing/replacing the card after success (e.g., swapping in the real `ItemCard`)

## Dependencies

### Internal Dependencies

None.

### External Dependencies

- `lucide-react` - Loader2, Check

## Related Components

- `ItemCard` - Replaces this card once the post lands
- `DescriptionEditor` - The step that initiates posting

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-10 | Initial implementation and documentation |
