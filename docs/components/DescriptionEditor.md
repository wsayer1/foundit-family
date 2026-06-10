# DescriptionEditor

Step 3 of the posting flow: full-screen editor for reviewing the AI-generated description, tagging, and posting a find.

## Purpose

Shown after photo capture and location selection. Displays the captured image, an editable description textarea (pre-filled by AI), and a tag selector. The Post button fires confetti and delegates the actual upload to the parent via `onPost`. A `StepIndicator` (step 3 of 3) is shown at the top.

## Props / Parameters

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `imageData` | `string` | Yes | - | Data URL of the captured photo, shown above the editor |
| `description` | `string` | Yes | - | Controlled description text |
| `tag` | `string` | Yes | - | Currently selected category tag (`''` = none) |
| `loading` | `boolean` | Yes | - | True while AI is generating the description; disables textarea/post and hides the tag selector |
| `onDescriptionChange` | `(value: string) => void` | Yes | - | Controlled textarea change handler |
| `onTagChange` | `(value: string) => void` | Yes | - | Called with selected/custom tag, or `''` when removed |
| `onPost` | `() => void` | Yes | - | Called when Post is pressed (after confetti trigger) |
| `onBack` | `() => void` | Yes | - | Back button handler |

## Internal Components

### TagSelector (not exported)

Pill button + dropdown of 12 preset categories (`furniture`, `electronics`, ..., `other`). Selecting `other` reveals a custom tag input (lowercased on submit). Selected tag pill shows an X to clear. Closes on outside click. Labels formatted with `capitalize`.

## Usage Examples

```tsx
<DescriptionEditor
  imageData={photoDataUrl}
  description={description}
  tag={tag}
  loading={aiLoading}
  onDescriptionChange={setDescription}
  onTagChange={setTag}
  onPost={handlePost}
  onBack={() => setStep(2)}
/>
```

## States

- **Loading**: spinner with "AI is describing your find...", textarea disabled, Post disabled
- **Ready**: Sparkles icon with "AI-generated" label, editable textarea, tag selector visible
- **Post disabled**: when `loading` or description is empty/whitespace

## Styling

- Full-screen emerald→teal→cyan gradient background with safe-area insets
- Fixed bottom bar with Back and "Post your find" buttons; points hint ("You'll earn 10 points")
- White card with backdrop blur for the editor area

## Edge Cases

- Custom tag input trims and lowercases; empty custom tags rejected
- Post button is a no-op render path when description is blank (button disabled)
- Confetti originates from the Post button element via ref

## Dependencies

### Internal Dependencies

- `StepIndicator` from `src/components/LocationPermissionScreen`
- `triggerConfettiFromElement` from `src/utils/confetti`
- `capitalize` from `src/utils/format`

### External Dependencies

- `lucide-react` - Loader2, Sparkles, Send, Tag, X, ChevronDown, Check, ArrowLeft

## Related Components

- `CameraCapture` - Step 1 (photo)
- `LocationPicker` / `LocationPermissionScreen` - Step 2 (location)
- `PendingPostCard` - Shows upload progress after posting

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-10 | Initial documentation |
