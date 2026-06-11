# LandingAnimatedIcons

Set of six animated inline SVG icons used on the marketing landing page.

## Purpose

Provides custom, continuously-animated SVG icons that replace static Lucide icons on the landing page to make the "How It Works" and "More Than Just Finds" sections more engaging:

- `AnimatedCameraIcon` - camera with a pulsing lens ring and periodic flash blink
- `AnimatedMapPinIcon` - bouncing map pin with a fading ground ripple
- `AnimatedThumbsUpIcon` - tilting thumbs-up with a checkmark that draws itself in
- `AnimatedHeartIcon` - heart with a heartbeat pulse
- `AnimatedRecycleIcon` - recycle arrows rotating slowly
- `AnimatedUsersIcon` - two figures bobbing gently with staggered timing

All icons are stroke-based (Lucide-style, `stroke="currentColor"`, stroke width 2, round caps) so they inherit the surrounding text color (emerald-400 on the landing page).

## Props / Parameters

Each icon component accepts the same props:

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `size` | `number` | No | `40` (feature icons) / `36` (value icons) | Width and height of the rendered SVG in pixels |

## Usage Examples

```tsx
import { AnimatedCameraIcon, AnimatedHeartIcon } from '../components/LandingAnimatedIcons';

<div className="text-emerald-400">
  <AnimatedCameraIcon size={40} />
</div>
```

## Animation Implementation

- Animations are defined as global CSS keyframes in `src/index.css` (`pulse-ring`, `flash-blink`, `pin-bounce`, `ripple-fade`, `draw-check`, `thumb-tilt`, `heartbeat`, `spin-slow`, `gentle-bob`).
- Animated SVG parts carry the `icon-anim` class plus an inline `animation` style.
- A `prefers-reduced-motion: reduce` media query in `src/index.css` disables all icon animations for users who opt out of motion.

## Accessibility

- All SVGs are decorative and marked `aria-hidden="true"`.
- Motion is disabled under `prefers-reduced-motion`.

## Dependencies

### Internal Dependencies

- Keyframes defined in `src/index.css`

### External Dependencies

- None (pure inline SVG; no runtime libraries)

## Related Components

- `LandingPage` - the only consumer of these icons

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-11 | Initial implementation |
