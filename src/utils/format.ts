import type { ItemWithProfile } from '../types/database';

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function getClaimerFirstName(item: ItemWithProfile): string {
  const username = item.claimer_profile?.username;
  if (!username) return 'Someone';
  const firstName = username.split(' ')[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
}
