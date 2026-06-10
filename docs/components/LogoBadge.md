# LogoBadge

A small branded badge containing the app logo and wordmark that links back to the home page.

## Purpose

Provides consistent branding across page headers. Rendered as a React Router `Link` to `/` with `state={{ fromLogo: true }}` so the destination can detect logo-initiated navigation.

## Props / Parameters

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `hideWordmarkOnMobile` | `boolean` | No | `false` | When true, the "foundit.family" wordmark is hidden below the `sm` breakpoint (`hidden sm:inline`) |

## Usage Examples

```tsx
import { LogoBadge } from '../components/LogoBadge';

<header>
  <LogoBadge />
</header>

// Compact header on small screens
<LogoBadge hideWordmarkOnMobile />
```

## Accessibility

- Rendered as a semantic link (`<Link to="/">`), keyboard focusable and activatable with Enter
- Logo image has `alt="Foundit.Family"`

## Styling

- Card-style pill: white/stone-900 background, rounded-xl, border, shadow
- Hover state: `hover:bg-stone-50 dark:hover:bg-stone-800`
- Logo image scales `h-7 sm:h-8`
- Wordmark uses the "Clash Display" font via inline style
- Full dark mode support via `dark:` variants

## Edge Cases

- Assumes `/foundit.family_logo_small_light_grey_bg.png` exists in the public directory
- Must be rendered inside a React Router context (uses `Link`)

## Dependencies

### Internal Dependencies

None.

### External Dependencies

- `react-router-dom` - `Link`

## Related Components

- `Layout` - Typical header host for the badge

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-10 | Initial documentation |
