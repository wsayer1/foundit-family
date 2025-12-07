import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { FilterState } from '../components/FilterBar';

const FILTER_STORAGE_KEY = 'streetfinds_filters';

const DEFAULT_FILTERS: FilterState = {
  distance: 'any',
  time: 'all',
  sort: 'recent',
};

function loadFilters(): FilterState {
  try {
    const stored = localStorage.getItem(FILTER_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_FILTERS, ...JSON.parse(stored) };
    }
  } catch {
  }
  return DEFAULT_FILTERS;
}

function saveFilters(filters: FilterState): void {
  try {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  } catch {
  }
}

interface FilterContextType {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

const FilterContext = createContext<FilterContextType | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<FilterState>(loadFilters);

  const setFilters = useCallback((newFilters: FilterState) => {
    setFiltersState(newFilters);
    saveFilters(newFilters);
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    saveFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters =
    filters.distance !== 'any' ||
    filters.time !== 'all' ||
    filters.sort !== 'recent';

  return (
    <FilterContext.Provider value={{ filters, setFilters, resetFilters, hasActiveFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}

export { DEFAULT_FILTERS };
