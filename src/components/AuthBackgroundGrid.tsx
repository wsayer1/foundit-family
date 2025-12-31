import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ItemWithProfile } from '../types/database';
import { getThumbnailUrl } from '../utils/image';

const CARDS_PER_ROW = 8;
const TOTAL_CARDS = CARDS_PER_ROW * 2;

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
];

interface CardData {
  image: string;
  title: string;
  category: string;
  id: string;
}

interface ItemCardProps {
  data: CardData;
  isExpanded: boolean;
  onTap: () => void;
}

function ItemCard({ data, isExpanded, onTap }: ItemCardProps) {
  return (
    <div
      className={`flex-shrink-0 p-1.5 transition-all duration-300 ease-out cursor-pointer ${
        isExpanded ? 'w-72 h-56 sm:w-80 sm:h-60 scale-105 z-10' : 'w-56 h-44 sm:w-64 sm:h-48'
      }`}
      onClick={onTap}
    >
      <div className={`relative w-full h-full overflow-hidden rounded-2xl bg-stone-200 dark:bg-stone-800 shadow-lg transition-shadow duration-300 ${
        isExpanded ? 'shadow-2xl ring-2 ring-emerald-500/50' : ''
      }`}>
        <img
          src={data.image}
          alt={data.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white font-medium text-sm line-clamp-2 leading-snug mb-1">
            {data.title}
          </p>
          {data.category && (
            <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white/90">
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
  rowIndex: number;
  pausedCardId: string | null;
  onCardTap: (cardId: string, rowIndex: number) => void;
}

function ScrollingRow({ cards, direction, duration, rowIndex, pausedCardId, onCardTap }: ScrollingRowProps) {
  const duplicatedCards = [...cards, ...cards];
  const isPaused = pausedCardId !== null && cards.some(c => c.id === pausedCardId);

  return (
    <div className="relative overflow-hidden flex-1 flex items-center">
      <div
        className="flex items-center"
        style={{
          animation: isPaused ? 'none' : `scroll-${direction} ${duration}s linear infinite`,
          width: 'max-content',
        }}
      >
        {duplicatedCards.map((card, index) => (
          <ItemCard
            key={`${rowIndex}-${index}-${card.id}`}
            data={card}
            isExpanded={pausedCardId === card.id}
            onTap={() => onCardTap(card.id, rowIndex)}
          />
        ))}
      </div>
    </div>
  );
}

export function AuthBackgroundGrid() {
  const [items, setItems] = useState<ItemWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [pausedCard, setPausedCard] = useState<{ id: string; row: number } | null>(null);

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

  const handleCardTap = useCallback((cardId: string, rowIndex: number) => {
    setPausedCard(prev => {
      if (prev?.id === cardId) {
        return null;
      }
      return { id: cardId, row: rowIndex };
    });
  }, []);

  const rows = useMemo(() => {
    const allCards: CardData[] = Array.from({ length: TOTAL_CARDS }, (_, i) => {
      const item = items[i];
      if (item) {
        return {
          id: item.id,
          image: getThumbnailUrl(item.image_url),
          title: item.description,
          category: item.category || '',
        };
      }
      const placeholder = PLACEHOLDERS[i % PLACEHOLDERS.length];
      return {
        id: `placeholder-${i}`,
        image: placeholder.image,
        title: placeholder.title,
        category: placeholder.category,
      };
    });

    return [
      allCards.slice(0, CARDS_PER_ROW),
      allCards.slice(CARDS_PER_ROW, CARDS_PER_ROW * 2),
    ];
  }, [items]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-stone-100 dark:bg-stone-900">
        <div className="flex flex-col h-full gap-4 p-4 justify-center">
          {[0, 1].map((row) => (
            <div key={row} className="flex-1 flex gap-3 overflow-hidden items-center max-h-60">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-56 h-44 sm:w-64 sm:h-48 rounded-2xl bg-stone-200 dark:bg-stone-800 animate-pulse"
                />
              ))}
            </div>
          ))}
        </div>
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

      <div className="flex flex-col h-full py-4 justify-center gap-2">
        <ScrollingRow
          cards={rows[0]}
          direction="right"
          duration={50}
          rowIndex={0}
          pausedCardId={pausedCard?.row === 0 ? pausedCard.id : null}
          onCardTap={handleCardTap}
        />
        <ScrollingRow
          cards={rows[1]}
          direction="left"
          duration={45}
          rowIndex={1}
          pausedCardId={pausedCard?.row === 1 ? pausedCard.id : null}
          onCardTap={handleCardTap}
        />
      </div>
    </div>
  );
}
