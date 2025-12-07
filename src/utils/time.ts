const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_FRESHNESS = 0.2;

export function getFreshness(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const ageMs = now.getTime() - date.getTime();

  if (ageMs <= 0) return 1;
  if (ageMs >= SEVEN_DAYS_MS) return MIN_FRESHNESS;

  const progress = ageMs / SEVEN_DAYS_MS;
  return 1 - (progress * (1 - MIN_FRESHNESS));
}

export function getFreshnessLabel(freshness: number): string {
  if (freshness >= 0.9) return 'Just posted';
  if (freshness >= 0.7) return 'Very fresh';
  if (freshness >= 0.5) return 'Fresh';
  if (freshness >= 0.35) return 'Getting stale';
  return 'Old listing';
}

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
