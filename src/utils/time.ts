export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) {
    return 'just now';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return `${weeks}w ago`;
  }

  return date.toLocaleDateString();
}

const FRESHNESS_DURATION_MS = 14 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function getFreshnessOpacity(freshness: number): number {
  const elapsed = (1 - freshness) * FRESHNESS_DURATION_MS;

  if (elapsed <= SEVEN_DAYS_MS) {
    return 1 - (elapsed / SEVEN_DAYS_MS) * 0.8;
  } else {
    const daysAfterSeven = (elapsed - SEVEN_DAYS_MS) / (24 * 60 * 60 * 1000);
    return Math.max(0.2 - (daysAfterSeven / 7) * 0.2, 0);
  }
}

export function getFreshnessColor(freshness: number): string {
  if (freshness > 0.857) return 'bg-green-500';
  if (freshness > 0.714) return 'bg-green-400';
  if (freshness > 0.571) return 'bg-lime-500';
  if (freshness > 0.429) return 'bg-yellow-500';
  if (freshness > 0.286) return 'bg-orange-500';
  if (freshness > 0.143) return 'bg-rose-500';
  return 'bg-red-500';
}

export function calculateRingDecay(createdAt: string, lastConfirmedAt?: string | null): number {
  const referenceDate = lastConfirmedAt ? new Date(lastConfirmedAt) : new Date(createdAt);
  const now = new Date();
  const elapsed = now.getTime() - referenceDate.getTime();
  const decayRatio = Math.min(elapsed / SEVEN_DAYS_MS, 1);
  return Math.max(1 - decayRatio, 0);
}

export function getRingColor(decayPercent: number): string {
  if (decayPercent > 0.857) return '#22c55e';
  if (decayPercent > 0.714) return '#4ade80';
  if (decayPercent > 0.571) return '#84cc16';
  if (decayPercent > 0.429) return '#eab308';
  if (decayPercent > 0.286) return '#f97316';
  if (decayPercent > 0.143) return '#f43f5e';
  return '#ef4444';
}
