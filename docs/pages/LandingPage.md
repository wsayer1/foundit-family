# LandingPage

Marketing landing page for foundit.family with San Francisco focus that serves as the entry point for new visitors.

## Purpose

The LandingPage serves as the primary marketing entry point for foundit.family:
- Introduces the app's value proposition to new visitors
- Highlights the San Francisco-specific focus
- Provides clear calls-to-action to enter the app or create an account
- Automatically redirects returning users and logged-in users to the main Discover feed

## Props / Parameters

This component has no props - it is a standalone page component.

## Routing Behavior

### New Visitors
New visitors landing on `/` see the full marketing landing page.

### Returning Visitors
Users who have previously clicked "Enter App" are automatically redirected to `/discover`. This is tracked via `localStorage` with the key `foundit_landing_visited`.

### Authenticated Users
Logged-in users are automatically redirected to `/discover` regardless of the localStorage flag.

## Page Sections

### Header
- Logo and brand name
- "Sign in" text link
- "Enter App" primary button

### Hero Section
- Full-viewport background with San Francisco skyline image (slow ken-burns zoom)
- Hero text spans the full nav-width container (`max-w-6xl`), matching the header
- "Made for San Francisco" badge
- Main headline: "Find Free Treasures Across SF"
- Subheadline explaining the value proposition
- "Start Exploring" and "Create Account" CTAs
- Live stats from the database (items shared, members, items this week)
- Staggered fade-up entrance animations on badge, headline, paragraph, CTAs, and stats

### How It Works
Three-step guide with larger custom animated SVG icons (see `docs/components/LandingAnimatedIcons.md`):
1. Snap & Share - animated camera (pulsing lens, flash blink)
2. Discover Nearby - animated map pin (bounce with ground ripple)
3. Confirm & Claim - animated thumbs-up (tilt with self-drawing checkmark)

Cards have scroll-reveal entrances (staggered) and hover lift with an emerald glow.

### Your Neighborhood Section
- Emphasizes SF-specific community focus
- Lists popular SF neighborhoods as tags (hover highlight and lift)
- Grid of sample item images
- Both columns reveal on scroll

### Values Section
Highlights three key values with larger animated SVG icons:
- Build Community (heartbeat heart)
- Reduce Waste (rotating recycle arrows)
- Help Others (bobbing people figures)

### Final CTA
Repeats the primary call-to-action with "Enter App" button over a soft emerald glow backdrop; content reveals on scroll.

### Footer
- Logo
- Privacy Policy and Terms of Service links

## Usage

The landing page is configured as the default route `/` in `App.tsx`:

```tsx
<Route path="/" element={<LandingPage />} />
```

## Visitor Flow

```
New Visitor → Landing Page → "Enter App" → /discover (sets localStorage)
                          ↓
Returning Visitor → / → Redirects to /discover (localStorage check)
                          ↓
Logged-in User → / → Redirects to /discover (auth check)
```

## localStorage Key

- Key: `foundit_landing_visited`
- Value: `"true"`
- Purpose: Tracks whether user has entered the app before

## Dependencies

### Internal Dependencies
- `useAuth` - Authentication context for user state
- `useSiteStats` - Hook for fetching live statistics
- `useScrollReveal` - IntersectionObserver hook powering scroll-reveal animations
- `LandingAnimatedIcons` - Animated SVG icons for feature and value cards

### External Dependencies
- `lucide-react` - Icons (MapPin, Camera, ArrowRight, etc.)
- `react-router-dom` - Navigation

## Stock Images Used

All images are from Pexels:
- SF Skyline: `pexels-photo-1006965.jpeg`
- Sample items: Various furniture and decor images

## Responsive Design

- Mobile-first design
- Responsive typography scaling
- Stack layout on mobile, side-by-side on desktop
- Safe area insets for iOS devices

## Related Files

- `src/pages/DiscoverPage.tsx` - Main app feed users navigate to
- `src/pages/AuthPage.tsx` - Authentication page
- `src/components/BottomNav.tsx` - Updated to use `/discover` route

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-19 | Initial implementation |
| 1.1.0 | 2026-06-11 | Widened hero to match nav width; replaced static icons with animated SVGs; added scroll-reveal, entrance animations, ken-burns hero, hover polish |
