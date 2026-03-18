# LeaderboardSidebar

Desktop sidebar for the Leaderboard page showing community stats, recent activity, and points breakdown.

## Purpose

Fills the extra screen space on desktop viewports (lg: and up) beside the leaderboard list. Contains three modules designed to encourage engagement: community-wide stats, a feed of recently posted items, and a guide explaining the points system.

## Props / Parameters

No props. This is a self-contained component that fetches its own data.

## Sub-modules

### CommunityStatsModule
Displays aggregate stats: total items posted, total claimed, community member count, and weekly posting activity. Includes a "Today" section when there is same-day activity.

### RecentActivityModule
Shows the 5 most recently posted items with thumbnail, description, poster name, and time ago. Each item is clickable and navigates to the item detail page. Green/grey status dot indicates availability.

### PointsBreakdownModule
Static card explaining the scoring system: posting (+10), claiming (+5), item getting claimed (+5 bonus), confirming (+2).

## Usage Examples

```tsx
<LeaderboardSidebar />
```

## Styling

- Each module: White card with rounded corners, border, shadow
- Loading states: Skeleton animations matching card layout
- Stat cards: 2-column grid with accent colors for key metrics
- Dark mode: Full support

## Dependencies

### Internal Dependencies

- `useCommunityStats` hook - Fetches aggregate stats from Supabase
- `useRecentActivity` hook - Fetches recent items from Supabase
- `formatTimeAgo` - Time formatting utility
- `getPreviewUrl` - Image URL helper

### External Dependencies

- `lucide-react` - Icons
- `react-router-dom` - Navigation for activity items

## Related Components

- `LeaderboardPage` - Parent page, renders this in the right column on desktop

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-18 | Initial implementation with three sidebar modules |
