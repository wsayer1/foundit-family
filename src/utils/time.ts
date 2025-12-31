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

export function calculateFreshness(createdAt: string, lastConfirmedAt?: string | null): number {
  const referenceDate = lastConfirmedAt ? new Date(lastConfirmedAt) : new Date(createdAt);
  const now = new Date();
  const elapsed = now.getTime() - referenceDate.getTime();
  const freshness = 1 - Math.min(elapsed / FRESHNESS_DURATION_MS, 1);
  return Math.max(freshness, 0);
}

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
  if (freshness > 0.7) return 'bg-emerald-500';
  if (freshness > 0.4) return 'bg-amber-500';
  return 'bg-stone-400';
}

export function getFreshnessLabel(freshness: number): string {
  if (freshness > 0.85) return 'Just posted';
  if (freshness > 0.7) return 'Fresh';
  if (freshness > 0.4) return 'May still be there';
  if (freshness > 0.15) return 'Likely gone';
  return 'Probably gone';
}

export function getDaysRemaining(createdAt: string, lastConfirmedAt?: string | null): number {
  const referenceDate = lastConfirmedAt ? new Date(lastConfirmedAt) : new Date(createdAt);
  const expiryDate = new Date(referenceDate.getTime() + FRESHNESS_DURATION_MS);
  const now = new Date();
  const remaining = expiryDate.getTime() - now.getTime();
  return Math.max(Math.ceil(remaining / (24 * 60 * 60 * 1000)), 0);
}

export function calculateRingDecay(createdAt: string, lastConfirmedAt?: string | null): number {
  const referenceDate = lastConfirmedAt ? new Date(lastConfirmedAt) : new Date(createdAt);
  const now = new Date();
  const elapsed = now.getTime() - referenceDate.getTime();
  const decayRatio = Math.min(elapsed / SEVEN_DAYS_MS, 1);
  return Math.max(1 - decayRatio, 0);
}

export function getRingColor(decayPercent: number): string {
  if (decayPercent > 0.7) return '#ffffff';
  if (decayPercent > 0.4) return 'rgba(255, 255, 255, 0.85)';
  return 'rgba(255, 255, 255, 0.6)';
}

export function getRingStrokeWidth(decayPercent: number): number {
  if (decayPercent > 0.7) return 3;
  if (decayPercent > 0.4) return 2.5;
  return 2;
}
