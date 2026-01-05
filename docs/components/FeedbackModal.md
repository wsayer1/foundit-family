# FeedbackModal

A modal dialog for collecting user feedback or bug reports with real-time submission to Supabase.

## Purpose

The FeedbackModal provides a standardized interface for users to submit feedback or report bugs directly from the application. It handles:

- Capturing user input with appropriate prompts based on feedback type
- Submitting to the database with user attribution
- Displaying submission states (loading, success, error)
- Automatic dismissal after successful submission

Use this component whenever you need to collect user feedback, bug reports, or other textual input that requires database persistence.

## Props / Parameters

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `type` | `'feedback' \| 'bug'` | Yes | - | Determines the modal's appearance and placeholder text |
| `onClose` | `() => void` | Yes | - | Callback invoked when the modal should close |

### Prop Details

#### `type`

Controls the modal's visual theme and copy:

- `'feedback'`: Emerald/teal gradient, general feedback prompts
- `'bug'`: Amber/orange gradient, bug-specific prompts

The type is stored in the database record for categorization.

#### `onClose`

Called in three scenarios:
1. User clicks the backdrop overlay
2. User clicks the X button or Cancel button
3. Automatically after 2 seconds following successful submission

## Usage Examples

### Basic Usage

```tsx
import { FeedbackModal } from '@/components/FeedbackModal';

function Settings() {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <>
      <button onClick={() => setShowFeedback(true)}>
        Leave Feedback
      </button>
      {showFeedback && (
        <FeedbackModal
          type="feedback"
          onClose={() => setShowFeedback(false)}
        />
      )}
    </>
  );
}
```

### Bug Report Variant

```tsx
<FeedbackModal
  type="bug"
  onClose={() => setBugModalOpen(false)}
/>
```

### In a Settings Menu

```tsx
function SettingsModal() {
  const [feedbackType, setFeedbackType] = useState<'feedback' | 'bug' | null>(null);

  return (
    <div>
      <button onClick={() => setFeedbackType('feedback')}>
        <MessageSquare /> Leave Feedback
      </button>
      <button onClick={() => setFeedbackType('bug')}>
        <Bug /> Report Bug
      </button>

      {feedbackType && (
        <FeedbackModal
          type={feedbackType}
          onClose={() => setFeedbackType(null)}
        />
      )}
    </div>
  );
}
```

## Accessibility

### Keyboard Navigation

- `Tab`: Moves focus between textarea, Cancel, and Submit buttons
- `Enter`: When focused on buttons, activates them
- `Escape`: Not implemented; users must click Cancel or backdrop

### ARIA Attributes

The component should be enhanced with:

| Attribute | Recommended Value | Purpose |
|-----------|-------------------|---------|
| `role` | `"dialog"` | Identifies as modal dialog |
| `aria-labelledby` | Reference to title | Associates modal with its title |
| `aria-modal` | `true` | Indicates modal behavior |

### Screen Reader Considerations

- The textarea has `autoFocus` for immediate keyboard input
- Success state announces "Thank you!" with confirmation message
- Error messages are visible and associated with the form

### Color Contrast

- White text on colored gradients meets WCAG AA standards
- Dark mode variants provide appropriate contrast
- Submit button disabled state reduces opacity to 50%

## Styling

### CSS Classes

Key Tailwind classes used:

- **Backdrop**: `bg-black/60 backdrop-blur-sm` - Semi-transparent blur overlay
- **Container**: `bg-white dark:bg-stone-900` - Theme-aware background
- **Animation**: `animate-in slide-in-from-bottom duration-300` - Entry animation
- **Responsive**: `sm:max-w-md sm:rounded-2xl` - Full-width on mobile, centered card on desktop

### Theme Support

Fully supports light/dark mode through `dark:` variants on:
- Background colors
- Text colors
- Border colors
- Input backgrounds

## States

### Default State

Empty textarea with placeholder text appropriate to feedback type.

### Loading State

- Submit button shows spinner and "Submitting..." text
- All inputs disabled during submission
- Cancel button disabled

### Error State

- Red error text appears below textarea
- Inputs re-enabled for retry
- Message: "Failed to submit. Please try again."

### Success State

- Form replaced with checkmark icon
- "Thank you!" heading with confirmation text
- Auto-dismisses after 2 seconds

## Edge Cases

### Empty Input

Submit button is disabled when message is empty or whitespace-only. The `trim()` method ensures whitespace-only submissions are prevented.

### Long Content

Textarea is fixed at `h-40` (160px) with scrolling enabled via browser default. Very long messages are accepted.

### Rapid Submissions

Prevented by disabling the submit button during the `submitting` state.

### Network Failures

Displays error message and allows retry. No automatic retry logic implemented.

### Unauthenticated Users

The component requires authentication via `useAuth()`. The submit handler checks for user existence before proceeding. Should only be rendered for authenticated users.

## Dependencies

### Internal Dependencies

- `useAuth` from `@/contexts/AuthContext` - Gets current user for attribution
- `supabase` from `@/lib/supabase` - Database client for submission

### External Dependencies

- `lucide-react` - Icons (X, MessageSquare, Bug, Send, Loader2, CheckCircle)
- `react` - useState hook

### Database Dependencies

Requires `feedback` table in Supabase with columns:
- `user_id` (uuid, foreign key to auth.users)
- `type` (text, 'feedback' or 'bug')
- `message` (text)

## Testing Considerations

### Unit Tests

```tsx
describe('FeedbackModal', () => {
  it('renders feedback variant correctly', () => {
    render(<FeedbackModal type="feedback" onClose={() => {}} />);
    expect(screen.getByText('Leave Feedback')).toBeInTheDocument();
  });

  it('renders bug variant correctly', () => {
    render(<FeedbackModal type="bug" onClose={() => {}} />);
    expect(screen.getByText('Report a Bug')).toBeInTheDocument();
  });

  it('disables submit when message is empty', () => {
    render(<FeedbackModal type="feedback" onClose={() => {}} />);
    expect(screen.getByText('Submit').closest('button')).toBeDisabled();
  });

  it('enables submit when message has content', () => {
    render(<FeedbackModal type="feedback" onClose={() => {}} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Test' } });
    expect(screen.getByText('Submit').closest('button')).not.toBeDisabled();
  });

  it('calls onClose when Cancel clicked', () => {
    const onClose = jest.fn();
    render(<FeedbackModal type="feedback" onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop clicked', () => {
    const onClose = jest.fn();
    render(<FeedbackModal type="feedback" onClose={onClose} />);
    fireEvent.click(document.querySelector('.bg-black\\/60')!);
    expect(onClose).toHaveBeenCalled();
  });
});
```

### Integration Tests

1. Complete feedback submission flow
2. Complete bug report submission flow
3. Error handling and retry flow
4. Success state and auto-dismiss timing

### Accessibility Tests

- Verify focus moves to textarea on open
- Verify all interactive elements are keyboard accessible
- Test with screen reader for announcements

## Related Components

- `SettingsModal` - Parent component that triggers FeedbackModal
- `EditItemModal` - Similar modal pattern for item editing

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-12-31 | Initial implementation with feedback/bug types |
