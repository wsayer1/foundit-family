# Component Documentation Index

This directory contains documentation for all React components in `src/components/`.

## Documentation Status

### Documented Components

| Component | Documentation | Source |
|-----------|---------------|--------|
| CameraCapture | [docs/components/CameraCapture.md](components/CameraCapture.md) | [src/components/CameraCapture.tsx](../src/components/CameraCapture.tsx) |
| FeedbackModal | [docs/components/FeedbackModal.md](components/FeedbackModal.md) | [src/components/FeedbackModal.tsx](../src/components/FeedbackModal.tsx) |
| FilterBar | [docs/components/FilterBar.md](components/FilterBar.md) | [src/components/FilterBar.tsx](../src/components/FilterBar.tsx) |
| ItemCard | [docs/components/ItemCard.md](components/ItemCard.md) | [src/components/ItemCard.tsx](../src/components/ItemCard.tsx) |
| PullToRefresh | [docs/components/PullToRefresh.md](components/PullToRefresh.md) | [src/components/PullToRefresh.tsx](../src/components/PullToRefresh.tsx) |

### Undocumented Components

The following components require documentation. Use [COMPONENT_TEMPLATE.md](COMPONENT_TEMPLATE.md) as a starting point.

| Component | Source | Priority |
|-----------|--------|----------|
| AuthBackgroundGrid | [src/components/AuthBackgroundGrid.tsx](../src/components/AuthBackgroundGrid.tsx) | Low |
| BottomNav | [src/components/BottomNav.tsx](../src/components/BottomNav.tsx) | Medium |
| DescriptionEditor | [src/components/DescriptionEditor.tsx](../src/components/DescriptionEditor.tsx) | Medium |
| DiscoverMapView | [src/components/DiscoverMapView.tsx](../src/components/DiscoverMapView.tsx) | High |
| EditItemModal | [src/components/EditItemModal.tsx](../src/components/EditItemModal.tsx) | High |
| FloatingAuthCard | [src/components/FloatingAuthCard.tsx](../src/components/FloatingAuthCard.tsx) | Low |
| FloatingFilterDropdown | [src/components/FloatingFilterDropdown.tsx](../src/components/FloatingFilterDropdown.tsx) | Medium |
| GuestHero | [src/components/GuestHero.tsx](../src/components/GuestHero.tsx) | Low |
| Layout | [src/components/Layout.tsx](../src/components/Layout.tsx) | Medium |
| LocationPermissionScreen | [src/components/LocationPermissionScreen.tsx](../src/components/LocationPermissionScreen.tsx) | Medium |
| LocationPicker | [src/components/LocationPicker.tsx](../src/components/LocationPicker.tsx) | High |
| MapZoomControls | [src/components/MapZoomControls.tsx](../src/components/MapZoomControls.tsx) | Low |
| SettingsModal | [src/components/SettingsModal.tsx](../src/components/SettingsModal.tsx) | High |
| UserLocationMarker | [src/components/UserLocationMarker.tsx](../src/components/UserLocationMarker.tsx) | Low |

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
