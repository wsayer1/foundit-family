import type { ItemWithProfile } from '../types/database';
import type { TimeFilter } from '../components/FilterBar';
import { calculateRingDecay } from '../utils/time';

export const ITEMS_WITH_PROFILES_SELECT = `
  *,
  profiles!items_user_id_fkey (username, avatar_url),
  claimer_profile:profiles!items_claimed_by_fkey (username, avatar_url)
`;

export function visibleItemsOrFilter(): string {
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  return `status.eq.available,and(status.eq.claimed,claimed_at.gte.${fortyEightHoursAgo})`;
}

export function getTimeFilterDate(filter: TimeFilter): Date | null {
  const now = new Date();
  switch (filter) {
    case '2h':
      return new Date(now.getTime() - 2 * 60 * 60 * 1000);
    case '8h':
      return new Date(now.getTime() - 8 * 60 * 60 * 1000);
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '48h':
      return new Date(now.getTime() - 48 * 60 * 60 * 1000);
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

export function filterActiveItems(items: ItemWithProfile[]): ItemWithProfile[] {
  return items.filter((item) => calculateRingDecay(item.created_at, item.last_confirmed_at) > 0);
}
