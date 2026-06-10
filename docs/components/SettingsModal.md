# SettingsModal

Modal for editing profile (avatar, display name) and appearance preference, backed by the `useProfileMutations` hook.

## Purpose

Central account settings surface. Lets the signed-in user upload/remove an avatar, change their display name (with validation), and pick light/dark/system theme. Returns `null` when there is no `user` or `profile`.

## Props / Parameters

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onClose` | `() => void` | Yes | - | Called on backdrop click, Escape key, X button, or Done button |

## Behavior

- **Avatar**: hidden file input; rejects files > 2 MB or non-images with inline error; `uploadAvatar(file)` / `removeAvatar()` from `useProfileMutations`
- **Display name**: validated client-side (2-30 chars, letters/numbers/spaces/hyphens/underscores); saved via `updateUsername`; Save disabled while unchanged; shows "Saved!" success for 2s
- **Appearance**: three-option grid (Light/Dark/System) calling `setPreference` from ThemeContext immediately
- Locks body scroll while open (`document.body.style.overflow = 'hidden'`)

## Usage Examples

```tsx
const [showSettings, setShowSettings] = useState(false);

{showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
```

## Accessibility

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby="settings-title"`
- `Escape` closes the modal (onKeyDown on the dialog)
- Errors use `role="alert"`; name input sets `aria-invalid` / `aria-describedby`
- Theme buttons use `aria-pressed`; avatar controls have `aria-label`s

## States

- **Saving name**: spinner + "Saving...", then transient "Saved!"
- **Uploading/removing avatar**: spinners; both buttons disabled
- **Errors**: inline red text for name or avatar failures ("Failed to update name", "Failed to upload avatar", etc.)

## Styling

- Bottom sheet on mobile (`rounded-t-3xl`, slide-in-from-bottom), centered card on `sm+` (max-w-md, zoom-in)
- 85vh height with scrollable body; full dark mode support

## Edge Cases

- Renders nothing if not authenticated or profile not loaded
- File input value reset after each upload attempt so the same file can be re-picked
- Remove-avatar button only shown when `profile.avatar_url` exists

## Dependencies

### Internal Dependencies

- `useAuth` from `src/contexts/AuthContext` - user + profile
- `useTheme` from `src/contexts/ThemeContext` - `preference`, `setPreference`
- `useProfileMutations` from `src/hooks/useProfileMutations` - `updateUsername`, `uploadAvatar`, `removeAvatar`
- `getAvatarUrl` from `src/utils/image`
- `AppearancePreference` from `src/types/database`

### External Dependencies

- `lucide-react` - X, User, Camera, Loader2, Sun, Moon, Monitor, Trash2, Check

## Related Components

- `FeedbackModal` - Often launched from the same settings surface
- `Layout` / `BottomNav` - Typical trigger locations

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-10 | Initial documentation; mutations via useProfileMutations hook |
