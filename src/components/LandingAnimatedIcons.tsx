interface IconProps {
  size?: number;
}

const svgProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  style: { overflow: 'visible' as const },
};

export function AnimatedCameraIcon({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps} aria-hidden="true">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
      <circle
        className="icon-anim"
        cx="12"
        cy="13"
        r="3"
        strokeWidth={1.5}
        style={{
          animation: 'pulse-ring 2.4s ease-out infinite',
          transformOrigin: '12px 13px',
        }}
      />
      <circle
        className="icon-anim"
        cx="18.5"
        cy="9.5"
        r="1"
        fill="currentColor"
        stroke="none"
        style={{ animation: 'flash-blink 3.2s ease-in-out infinite' }}
      />
    </svg>
  );
}

export function AnimatedMapPinIcon({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps} aria-hidden="true">
      <ellipse
        className="icon-anim"
        cx="12"
        cy="21.5"
        rx="5"
        ry="1.5"
        strokeWidth={1}
        style={{
          animation: 'ripple-fade 2.2s ease-out infinite',
          transformOrigin: '12px 21.5px',
        }}
      />
      <g
        className="icon-anim"
        style={{ animation: 'pin-bounce 2.2s ease-in-out infinite' }}
      >
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" transform="scale(0.92) translate(1 0)" />
        <circle cx="12" cy="9.2" r="2.8" />
      </g>
    </svg>
  );
}

export function AnimatedThumbsUpIcon({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps} aria-hidden="true">
      <g
        className="icon-anim"
        style={{
          animation: 'thumb-tilt 3s ease-in-out infinite',
          transformOrigin: '6px 18px',
        }}
      >
        <path d="M7 10v12" transform="scale(0.85) translate(0.5 2)" />
        <path
          d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"
          transform="scale(0.85) translate(0.5 2)"
        />
      </g>
      <polyline
        className="icon-anim"
        points="15.5 4.5 18 7 22.5 2.5"
        strokeWidth={2.2}
        style={{
          strokeDasharray: 24,
          strokeDashoffset: 24,
          animation: 'draw-check 3s ease-in-out infinite',
        }}
      />
    </svg>
  );
}

export function AnimatedHeartIcon({ size = 36 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps} aria-hidden="true">
      <g
        className="icon-anim"
        style={{
          animation: 'heartbeat 2.4s ease-in-out infinite',
          transformOrigin: '12px 12px',
        }}
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </g>
    </svg>
  );
}

export function AnimatedRecycleIcon({ size = 36 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps} aria-hidden="true">
      <g
        className="icon-anim"
        style={{
          animation: 'spin-slow 10s linear infinite',
          transformOrigin: '12px 12px',
        }}
      >
        <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
        <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
        <path d="m14 16-3 3 3 3" />
        <path d="M8.293 13.596 7.196 9.5 3.1 10.598" />
        <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843" />
        <path d="m13.378 9.633 4.096 1.098 1.097-4.096" />
      </g>
    </svg>
  );
}

export function AnimatedUsersIcon({ size = 36 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgProps} aria-hidden="true">
      <g
        className="icon-anim"
        style={{ animation: 'gentle-bob 2.6s ease-in-out infinite' }}
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </g>
      <g
        className="icon-anim"
        style={{ animation: 'gentle-bob 2.6s ease-in-out 0.6s infinite' }}
      >
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </g>
    </svg>
  );
}


export { AnimatedCameraIcon, AnimatedMapPinIcon, AnimatedThumbsUpIcon, AnimatedHeartIcon, AnimatedRecycleIcon, AnimatedUsersIcon }