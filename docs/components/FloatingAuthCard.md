# FloatingAuthCard

A floating authentication card component that provides login, sign-up, and password reset functionality.

## Purpose

The FloatingAuthCard is the primary authentication interface for the application. It:
- Displays as a bottom sheet on mobile and centered card on desktop
- Supports Google OAuth and email/password authentication
- Provides sign-up and login flows with tab switching
- Includes a forgot password flow with email reset link functionality

## Props / Parameters

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onSuccess` | `() => void` | Yes | - | Callback fired after successful authentication |
| `onClose` | `() => void` | No | - | Callback fired when the close button is clicked |
| `hideHeader` | `boolean` | No | `false` | Hides the header section (logo and tagline) |

## Usage Examples

### Basic Usage

```tsx
import { FloatingAuthCard } from '@/components/FloatingAuthCard';

function AuthPage() {
  const navigate = useNavigate();

  return (
    <FloatingAuthCard
      onSuccess={() => navigate('/')}
    />
  );
}
```

### With Close Button

```tsx
<FloatingAuthCard
  onSuccess={() => navigate('/')}
  onClose={() => navigate(-1)}
/>
```

### Hidden Header (for use with external header)

```tsx
<FloatingAuthCard
  onSuccess={handleSuccess}
  onClose={handleClose}
  hideHeader
/>
```

## Accessibility

### Keyboard Navigation

- `Tab`: Navigates between form fields and buttons
- `Enter`: Submits the current form
- `Space`: Activates buttons and toggles

### ARIA Attributes

- Form inputs have associated labels
- Password visibility toggles are marked as buttons
- Error messages are displayed inline for screen reader compatibility

### Screen Reader Considerations

- Form fields have descriptive labels
- Error states are announced through visible text
- Loading states show spinner with button text context

## Styling

### CSS Classes

The component uses Tailwind CSS with:
- Dark theme (stone-950 background)
- Emerald accent colors
- Responsive design with bottom sheet on mobile, centered card on desktop
- Google Sign-In button uses official Google Material Design styles (`.gsi-material-button` classes in `index.css`)

### Theme Support

- Uses dark theme by default
- Inherits from design system with stone and emerald color tokens

## States

### Loading State

Shows a spinner icon on submit buttons during authentication requests.

### Error State

Displays red error messages below form fields when authentication fails.

### Success State (Password Reset)

Shows a confirmation screen with check icon when reset email is sent successfully.

### Forgot Password View

A separate view mode that:
1. Shows email input only
2. Sends password reset email on submit
3. Displays success confirmation with email address
4. Allows returning to login view

## Edge Cases

### Invalid Credentials

Shows error message "Invalid login credentials" from Supabase.

### User Already Exists

Shows appropriate error when signing up with existing email.

### Network Failures

Displays generic error message and allows retry.

### Rate Limiting

Supabase rate limiting errors are displayed to the user.

## Dependencies

### Internal Dependencies

- `useAuth` - Authentication context for auth methods
- `AuthContext` - Provides signIn, signUp, signInWithGoogle, resetPassword

### External Dependencies

- `lucide-react` - Icons (MapPin, Eye, EyeOff, Loader2, Mail, ArrowLeft, CheckCircle)

## Related Components

- `AuthPage` - Page wrapper that uses FloatingAuthCard
- `ResetPasswordPage` - Handles password reset callback from email link
- `AuthBackgroundGrid` - Background visual used with this component

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.2.1 | 2026-01-16 | Updated email button to match Google button styling |
| 1.2.0 | 2026-01-16 | Updated Google Sign-In button to use official Google brand guidelines |
| 1.1.0 | 2026-01-16 | Added forgot password flow with email reset |
| 1.0.0 | Initial | Initial implementation with login/signup |
