# Component Documentation Index

This directory contains documentation for all React components in `src/components/`.

## Documentation Status

### Documented Components

| Component | Documentation | Source |
|-----------|---------------|--------|
| AuthBackgroundGrid | [docs/components/AuthBackgroundGrid.md](components/AuthBackgroundGrid.md) | [src/components/AuthBackgroundGrid.tsx](../src/components/AuthBackgroundGrid.tsx) |
| CameraCapture | [docs/components/CameraCapture.md](components/CameraCapture.md) | [src/components/CameraCapture.tsx](../src/components/CameraCapture.tsx) |
| ConfirmationPhotoCapture | [docs/components/ConfirmationPhotoCapture.md](components/ConfirmationPhotoCapture.md) | [src/components/ConfirmationPhotoCapture.tsx](../src/components/ConfirmationPhotoCapture.tsx) |
| DescriptionEditor | [docs/components/DescriptionEditor.md](components/DescriptionEditor.md) | [src/components/DescriptionEditor.tsx](../src/components/DescriptionEditor.tsx) |
| DiscoverMapView | [docs/components/DiscoverMapView.md](components/DiscoverMapView.md) | [src/components/DiscoverMapView.tsx](../src/components/DiscoverMapView.tsx) |
| EditItemModal | [docs/components/EditItemModal.md](components/EditItemModal.md) | [src/components/EditItemModal.tsx](../src/components/EditItemModal.tsx) |
| FeedbackModal | [docs/components/FeedbackModal.md](components/FeedbackModal.md) | [src/components/FeedbackModal.tsx](../src/components/FeedbackModal.tsx) |
| FilterBar | [docs/components/FilterBar.md](components/FilterBar.md) | [src/components/FilterBar.tsx](../src/components/FilterBar.tsx) |
| FilterSidebar | [docs/components/FilterSidebar.md](components/FilterSidebar.md) | [src/components/FilterSidebar.tsx](../src/components/FilterSidebar.tsx) |
| FloatingAuthCard | [docs/components/FloatingAuthCard.md](components/FloatingAuthCard.md) | [src/components/FloatingAuthCard.tsx](../src/components/FloatingAuthCard.tsx) |
| ItemCard | [docs/components/ItemCard.md](components/ItemCard.md) | [src/components/ItemCard.tsx](../src/components/ItemCard.tsx) |
| ItemDetailMap | [docs/components/ItemDetailMap.md](components/ItemDetailMap.md) | [src/components/ItemDetailMap.tsx](../src/components/ItemDetailMap.tsx) |
| LeaderboardSidebar | [docs/components/LeaderboardSidebar.md](components/LeaderboardSidebar.md) | [src/components/LeaderboardSidebar.tsx](../src/components/LeaderboardSidebar.tsx) |
| LocationPermissionScreen | [docs/components/LocationPermissionScreen.md](components/LocationPermissionScreen.md) | [src/components/LocationPermissionScreen.tsx](../src/components/LocationPermissionScreen.tsx) |
| LogoBadge | [docs/components/LogoBadge.md](components/LogoBadge.md) | [src/components/LogoBadge.tsx](../src/components/LogoBadge.tsx) |
| MapStyleToggle | [docs/components/MapStyleToggle.md](components/MapStyleToggle.md) | [src/components/MapStyleToggle.tsx](../src/components/MapStyleToggle.tsx) |
| PendingPostCard | [docs/components/PendingPostCard.md](components/PendingPostCard.md) | [src/components/PendingPostCard.tsx](../src/components/PendingPostCard.tsx) |
| PreviewCard | [docs/components/PreviewCard.md](components/PreviewCard.md) | [src/components/PreviewCard.tsx](../src/components/PreviewCard.tsx) |
| PullToRefresh | [docs/components/PullToRefresh.md](components/PullToRefresh.md) | [src/components/PullToRefresh.tsx](../src/components/PullToRefresh.tsx) |
| SettingsModal | [docs/components/SettingsModal.md](components/SettingsModal.md) | [src/components/SettingsModal.tsx](../src/components/SettingsModal.tsx) |
| UserLocationMarker | [docs/components/UserLocationMarker.md](components/UserLocationMarker.md) | [src/components/UserLocationMarker.tsx](../src/components/UserLocationMarker.tsx) |

### Undocumented Components

The following components require documentation. Use [COMPONENT_TEMPLATE.md](COMPONENT_TEMPLATE.md) as a starting point.

| Component | Source | Priority |
|-----------|--------|----------|
| BottomNav | [src/components/BottomNav.tsx](../src/components/BottomNav.tsx) | Medium |
| FloatingFilterDropdown | [src/components/FloatingFilterDropdown.tsx](../src/components/FloatingFilterDropdown.tsx) | Medium |
| GuestHero | [src/components/GuestHero.tsx](../src/components/GuestHero.tsx) | Low |
| Layout | [src/components/Layout.tsx](../src/components/Layout.tsx) | Medium |
| LocationPicker | [src/components/LocationPicker.tsx](../src/components/LocationPicker.tsx) | High |
| MapZoomControls | [src/components/MapZoomControls.tsx](../src/components/MapZoomControls.tsx) | Low |
| OnboardingGuide | [src/components/OnboardingGuide.tsx](../src/components/OnboardingGuide.tsx) | Medium |

## Creating New Documentation

1. Copy `COMPONENT_TEMPLATE.md` to `components/[ComponentName].md`
2. Fill in all applicable sections
3. Update this index to move the component to the "Documented" table

## Updating Documentation

When modifying a component:

1. Review the existing documentation
2. Update props table if props changed
3. Update usage examples if behavior changed
4. Add changelog entry with date and description
