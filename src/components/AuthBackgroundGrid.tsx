import { useState, useEffect, useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ItemWithProfile } from '../types/database';
import { getThumbnailUrl } from '../utils/image';

const CARDS_PER_ROW = 7;
const TOTAL_CARDS = CARDS_PER_ROW * 3;

const PLACEHOLDERS = [
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
  { title: 'Rattan Chair', category: 'Furniture', image: 'https://images.pexels.com/photos/2762247/pexels-photo-2762247.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { title: 'Table Lamp', category: 'Lighting', image: 'https://images.pexels.com/photos/1123262/pexels-photo-1123262.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { title: 'Ceramic Vases', category: 'Decor', image: 'https://images.pexels.com/photos/1879061/pexels-photo-1879061.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { title: 'Woven Rug', category: 'Decor', image: 'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { title: 'Console Table', category: 'Furniture', image: 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { title: 'Accent Chair', category: 'Furniture', image: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

interface CardData {
  image: string;
  title: string;
  category: string;
}

interface ItemCardProps {
  data: CardData;
}

function ItemCard({ data }: ItemCardProps) {
  return (
    <div className="flex-shrink-0 w-64 h-48 sm:w-72 sm:h-52 lg:w-80 lg:h-56 p-2">
      <div className="relative w-full h-full overflow-hidden rounded-2xl bg-stone-200 dark:bg-stone-800 shadow-lg">
        <img
          src={data.image}
          alt={data.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-medium text-sm line-clamp-2 leading-snug mb-1.5">
            {data.title}
          </p>
          {data.category && (
            <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white/90">
              {data.category}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface ScrollingRowProps {
  cards: CardData[];
  direction: 'left' | 'right';
  duration: number;
}

function ScrollingRow({ cards, direction, duration }: ScrollingRowProps) {
  const duplicatedCards = [...cards, ...cards];

  return (
    <div className="relative overflow-hidden flex-1">
      <div
        className="flex"
        style={{
          animation: `scroll-${direction} ${duration}s linear infinite`,
          width: 'max-content',
        }}
      >
        {duplicatedCards.map((card, index) => (
          <ItemCard key={`${index}-${card.title}`} data={card} />
        ))}
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
        .limit(TOTAL_CARDS);

      setItems((data as ItemWithProfile[]) || []);
      setLoading(false);
    }

    fetchItems();
  }, []);

  const rows = useMemo(() => {
    const allCards: CardData[] = Array.from({ length: TOTAL_CARDS }, (_, i) => {
      const item = items[i];
      if (item) {
        return {
          image: getThumbnailUrl(item.image_url),
          title: item.description,
          category: item.category || '',
        };
      }
      const placeholder = PLACEHOLDERS[i % PLACEHOLDERS.length];
      return {
        image: placeholder.image,
        title: placeholder.title,
        category: placeholder.category,
      };
    });

    return [
      allCards.slice(0, CARDS_PER_ROW),
      allCards.slice(CARDS_PER_ROW, CARDS_PER_ROW * 2),
      allCards.slice(CARDS_PER_ROW * 2, CARDS_PER_ROW * 3),
    ];
  }, [items]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-stone-100 dark:bg-stone-900">
        <div className="flex flex-col h-full gap-4 p-4">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex-1 flex gap-4 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-64 h-full rounded-2xl bg-stone-200 dark:bg-stone-800 animate-pulse"
                />
              ))}
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-black/40" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-stone-100 dark:bg-stone-900">
      <style>{`
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes scroll-left {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div className="flex flex-col h-full py-4">
        <ScrollingRow cards={rows[0]} direction="right" duration={60} />
        <ScrollingRow cards={rows[1]} direction="left" duration={55} />
        <ScrollingRow cards={rows[2]} direction="right" duration={65} />
      </div>

      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/60 text-sm">
        <MapPin size={14} />
        <span>Discover curbside treasures in your neighborhood</span>
      </div>
    </div>
  );
}
