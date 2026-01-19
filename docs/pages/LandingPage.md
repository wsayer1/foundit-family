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
- Full-viewport background with San Francisco skyline image
- "Made for San Francisco" badge
- Main headline: "Find Free Treasures Across SF"
- Subheadline explaining the value proposition
- "Start Exploring" and "Create Account" CTAs
- Live stats from the database (items shared, members, items this week)

### How It Works
Three-step guide with icons:
1. Snap & Share - Post items you find
2. Discover Nearby - Browse local items
3. Confirm & Claim - Verify and claim items

### Your Neighborhood Section
- Emphasizes SF-specific community focus
- Lists popular SF neighborhoods as tags
- Grid of sample item images

### Values Section
Highlights three key values:
- Build Community
- Reduce Waste
- Help Others

### Final CTA
Repeats the primary call-to-action with "Enter App" button.

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

### External Dependencies
- `lucide-react` - Icons (MapPin, Camera, ThumbsUp, etc.)
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
