# EditItemModal

Modal for editing an item's description or deleting the post, backed by the `useItemMutations` hook.

## Purpose

Lets an item owner update the description or delete the post (with an inline confirmation step warning about losing the 10 posting points). Shows the item image as read-only context.

## Props / Parameters

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `item` | `ItemWithProfile` | Yes | - | The item being edited; seeds the description textarea |
| `onClose` | `() => void` | Yes | - | Close without saving (X button or backdrop; backdrop disabled while loading) |
| `onSaved` | `(updatedItem: ItemWithProfile) => void` | Yes | - | Called with the locally-merged updated item after a successful save |
| `onDeleted` | `() => void` | Yes | - | Called after a successful delete |

## Behavior

- **Save**: if description is empty/unchanged, simply closes; otherwise calls `updateItemDescription(item.id, trimmed)` then `onSaved({ ...item, description })`
- **Delete**: "Delete Post" reveals an inline red confirmation panel; confirming calls `deleteItem(item.id)` then `onDeleted()`
- Failures show an inline error banner ("Failed to save changes" / "Failed to delete item") and re-enable the form
- All controls disabled while saving or deleting

## Usage Examples

```tsx
{editingItem && (
  <EditItemModal
    item={editingItem}
    onClose={() => setEditingItem(null)}
    onSaved={(updated) => { updateLocalItem(updated); setEditingItem(null); }}
    onDeleted={() => { removeLocalItem(editingItem.id); setEditingItem(null); }}
  />
)}
```

## States

- **Default**: textarea + Save Changes + Delete Post buttons
- **Saving**: spinner on Save; everything disabled
- **Delete confirm**: warning text with Cancel / Delete buttons; spinner while deleting
- **Error**: red banner above the footer

## Styling

- Bottom sheet on mobile, centered `max-w-lg` card on `sm+`; `max-h-[90vh]` with scrollable body
- Image shown in 16:9 (`aspect-video object-cover`); full dark mode support

## Edge Cases

- Save with whitespace-only or unchanged text closes without a network call
- Backdrop click ignored while a mutation is in flight
- Parent owns the item list; only the merged local object is returned (no refetch)

## Dependencies

### Internal Dependencies

- `useItemMutations` from `src/hooks/useItemMutations` - `updateItemDescription`, `deleteItem`
- `ItemWithProfile` from `src/types/database`

### External Dependencies

- `lucide-react` - X, Loader2, Trash2

## Related Components

- `ItemCard` - Owner edit button opens this modal
- `SettingsModal` - Similar modal pattern

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-10 | Initial documentation; mutations via useItemMutations hook |
