export type DistanceFilter = 'any' | '500' | '1000' | '2000' | '5000' | '10000' | '25000';
export type TimeFilter = 'all' | '2h' | '8h' | '24h' | '48h' | 'week';
export type SortOption = 'nearest' | 'recent' | 'verified';
export type CategoryFilter = string;

export interface FilterState {
  distance: DistanceFilter;
  time: TimeFilter;
  sort: SortOption;
  category: CategoryFilter;
}

export const distanceOptions: { value: DistanceFilter; label: string }[] = [
  { value: 'any', label: 'Any Distance' },
  { value: '500', label: '500m' },
  { value: '1000', label: '1 km' },
  { value: '2000', label: '2 km' },
  { value: '5000', label: '5 km' },
  { value: '10000', label: '10 km' },
  { value: '25000', label: '25 km' },
];

export const timeOptions: { value: TimeFilter; label: string }[] = [
  { value: '2h', label: 'Last 2 hours' },
  { value: '8h', label: 'Last 8 hours' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '48h', label: 'Last 48 hours' },
  { value: 'week', label: 'Last week' },
  { value: 'all', label: 'All time' },
];

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'nearest', label: 'Nearest' },
  { value: 'verified', label: 'Most Verified' },
];
