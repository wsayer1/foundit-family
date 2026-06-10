import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const PRIORITY_CATEGORIES = ['couch', 'chair', 'table', 'bookshelf', 'lamp', 'tv'];
const MAX_CATEGORIES = 10;

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('items')
        .select('category')
        .eq('status', 'available')
        .not('category', 'is', null);

      if (data) {
        const uniqueCategories = [...new Set(data.map((item) => item.category as string))];
        const sortedCategories = uniqueCategories.sort((a, b) => {
          const aIndex = PRIORITY_CATEGORIES.indexOf(a.toLowerCase());
          const bIndex = PRIORITY_CATEGORIES.indexOf(b.toLowerCase());
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return a.localeCompare(b);
        });
        setCategories(sortedCategories.slice(0, MAX_CATEGORIES));
      }
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, refresh: fetchCategories };
}
