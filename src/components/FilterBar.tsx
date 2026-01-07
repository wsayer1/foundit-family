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
