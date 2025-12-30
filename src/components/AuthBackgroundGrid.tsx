import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ItemWithProfile } from '../types/database';
import { getThumbnailUrl } from '../utils/image';

interface BackgroundItemCardProps {
  item: ItemWithProfile;
}

function BackgroundItemCard({ item }: BackgroundItemCardProps) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-stone-200 dark:bg-stone-800">
      <img
        src={getThumbnailUrl(item.image_url)}
        alt={item.description}
        loading="lazy"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white font-medium text-sm line-clamp-2 leading-snug mb-1">
          {item.description}
        </p>
        {item.category && (
          <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white/90">
            {item.category}
          </span>
        )}
      </div>
    </div>
  );
}

function PlaceholderCard({ index }: { index: number }) {
  const placeholders = [
    { title: 'Vintage Armchair', category: 'Furniture', image: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { title: 'Mid-Century Coffee Table', category: 'Furniture', image: 'https://images.pexels.com/photos/2451264/pexels-photo-2451264.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { title: 'Standing Lamp', category: 'Lighting', image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { title: 'Bookshelf Unit', category: 'Storage', image: 'https://images.pexels.com/photos/2177482/pexels-photo-2177482.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { title: 'Wooden Desk', category: 'Furniture', image: 'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { title: 'Leather Sofa', category: 'Furniture', image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { title: 'Dining Chairs Set', category: 'Furniture', image: 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { title: 'Floor Mirror', category: 'Decor', image: 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { title: 'Potted Plants', category: 'Garden', image: 'https://images.pexels.com/photos/1084188/pexels-photo-1084188.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { title: 'Vintage Dresser', category: 'Furniture', image: 'https://images.pexels.com/photos/2079249/pexels-photo-2079249.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { title: 'Kitchen Table', category: 'Furniture', image: 'https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { title: 'Office Chair', category: 'Furniture', image: 'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { title: 'Bedside Table', category: 'Furniture', image: 'https://images.pexels.com/photos/2082087/pexels-photo-2082087.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { title: 'Storage Baskets', category: 'Storage', image: 'https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { title: 'Wall Art', category: 'Decor', image: 'https://images.pexels.com/photos/1939485/pexels-photo-1939485.jpeg?auto=compress&cs=tinysrgb&w=400' },
  ];

  const placeholder = placeholders[index % placeholders.length];

  return (
    <div className="relative w-full h-full overflow-hidden bg-stone-200 dark:bg-stone-800">
      <img
        src={placeholder.image}
        alt={placeholder.title}
        loading="lazy"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white font-medium text-sm line-clamp-2 leading-snug mb-1">
          {placeholder.title}
        </p>
        <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white/90">
          {placeholder.category}
        </span>
      </div>
    </div>
  );
}

export function AuthBackgroundGrid() {
  const [items, setItems] = useState<ItemWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      const { data } = await supabase
        .from('items')
        .select(`*, profiles!items_user_id_fkey (username, avatar_url)`)
        .eq('status', 'available')
        .not('image_url', 'is', null)
        .neq('image_url', '')
        .order('created_at', { ascending: false })
        .limit(15);

      setItems((data as ItemWithProfile[]) || []);
      setLoading(false);
    }

    fetchItems();
  }, []);

  const gridItems = Array.from({ length: 15 }, (_, i) => items[i] || null);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 grid-rows-6 sm:grid-rows-5 lg:grid-rows-3 h-full w-full">
        {gridItems.map((item, index) => (
          <div key={index} className="relative overflow-hidden">
            {loading ? (
              <div className="w-full h-full bg-stone-200 dark:bg-stone-800 animate-pulse" />
            ) : item ? (
              <BackgroundItemCard item={item} />
            ) : (
              <PlaceholderCard index={index} />
            )}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/60 text-sm">
        <MapPin size={14} />
        <span>Discover curbside treasures in your neighborhood</span>
      </div>
    </div>
  );
}
