import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ItemWithProfile } from '../types/database';
import { getThumbnailUrl } from '../utils/image';
import { Clock, CheckCircle } from 'lucide-react';

const CARDS_PER_ROW = 5;
const MOBILE_ROW_COUNT = 2;
const DESKTOP_ROW_COUNT = 5;
const CARD_HEIGHT = 180;
const CARD_WIDTH = 200;
const ROW_GAP = 8;

const PLACEHOLDERS = [
  { title: 'Vintage Armchair', category: 'Furniture', image: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'claimed' },
  { title: 'Mid-Century Coffee Table', category: 'Furniture', image: 'https://images.pexels.com/photos/2451264/pexels-photo-2451264.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'expired' },
  { title: 'Standing Lamp', category: 'Lighting', image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'claimed' },
  { title: 'Bookshelf Unit', category: 'Storage', image: 'https://images.pexels.com/photos/2177482/pexels-photo-2177482.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'expired' },
  { title: 'Wooden Desk', category: 'Furniture', image: 'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'claimed' },
  { title: 'Leather Sofa', category: 'Furniture', image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'expired' },
  { title: 'Dining Chairs Set', category: 'Furniture', image: 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'claimed' },
  { title: 'Floor Mirror', category: 'Decor', image: 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'expired' },
  { title: 'Potted Plants', category: 'Garden', image: 'https://images.pexels.com/photos/1084188/pexels-photo-1084188.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'claimed' },
  { title: 'Vintage Dresser', category: 'Furniture', image: 'https://images.pexels.com/photos/2079249/pexels-photo-2079249.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'expired' },
  { title: 'Kitchen Table', category: 'Furniture', image: 'https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'claimed' },
  { title: 'Office Chair', category: 'Furniture', image: 'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'expired' },
  { title: 'Bedside Table', category: 'Furniture', image: 'https://images.pexels.com/photos/2082087/pexels-photo-2082087.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'claimed' },
  { title: 'Storage Baskets', category: 'Storage', image: 'https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'expired' },
  { title: 'Wall Art', category: 'Decor', image: 'https://images.pexels.com/photos/1939485/pexels-photo-1939485.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'claimed' },
  { title: 'Rattan Chair', category: 'Furniture', image: 'https://images.pexels.com/photos/2762247/pexels-photo-2762247.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'expired' },
  { title: 'Table Lamp', category: 'Lighting', image: 'https://images.pexels.com/photos/1123262/pexels-photo-1123262.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'claimed' },
  { title: 'Ceramic Vases', category: 'Decor', image: 'https://images.pexels.com/photos/1879061/pexels-photo-1879061.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'expired' },
  { title: 'Woven Rug', category: 'Decor', image: 'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'claimed' },
  { title: 'Console Table', category: 'Furniture', image: 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'expired' },
  { title: 'Accent Chair', category: 'Furniture', image: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'claimed' },
  { title: 'Side Table', category: 'Furniture', image: 'https://images.pexels.com/photos/2079246/pexels-photo-2079246.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'expired' },
  { title: 'Desk Lamp', category: 'Lighting', image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'claimed' },
  { title: 'Plant Stand', category: 'Garden', image: 'https://images.pexels.com/photos/1084188/pexels-photo-1084188.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'expired' },
  { title: 'TV Stand', category: 'Furniture', image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400', status: 'claimed' },
];

interface CardData {
  image: string;
  title: string;
  category: string;
  id: string;
  status: 'available' | 'claimed' | 'expired';
}

interface ItemCardProps {
  data: CardData;
  isExpanded: boolean;
  onTap: () => void;
}

function ItemCard({ data, isExpanded, onTap }: ItemCardProps) {
  const isClaimed = data.status === 'claimed';
  const isExpired = data.status === 'expired';
  const isUnavailable = isClaimed || isExpired;

  return (
    <div
      className={`flex-shrink-0 p-1.5 transition-all duration-300 ease-out cursor-pointer`}
      style={{
        width: isExpanded ? CARD_WIDTH + 32 : CARD_WIDTH,
        height: isExpanded ? CARD_HEIGHT + 16 : CARD_HEIGHT
      }}
      onClick={onTap}
    >
      <div className={`relative w-full h-full overflow-hidden rounded-2xl bg-stone-800 shadow-lg transition-all duration-300 ${
        isExpanded ? 'shadow-2xl ring-2 ring-emerald-500/50 scale-105' : 'shadow-md'
      }`}>
        <img
          src={data.image}
          alt={data.title}
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-300 ${
            isUnavailable ? 'grayscale opacity-70' : ''
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent" />

        {isUnavailable && (
          <div className="absolute top-2.5 right-2.5">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
              isClaimed
                ? 'bg-emerald-500/80 text-white'
                : 'bg-stone-600/80 text-stone-200'
            }`}>
              {isClaimed ? (
                <>
                  <CheckCircle size={12} />
                  <span>Claimed</span>
                </>
              ) : (
                <>
                  <Clock size={12} />
                  <span>Expired</span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white font-medium text-sm line-clamp-2 leading-snug mb-1">
            {data.title}
          </p>
          {data.category && (
            <span className="inline-block px-2 py-0.5 bg-emerald-500/20 backdrop-blur-sm rounded-full text-xs text-emerald-300 font-medium">
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
  const duplicatedCards = [...cards, ...cards, ...cards];
  const isPaused = pausedCardId !== null && cards.some(c => c.id === pausedCardId);

  return (
    <div
      className="relative overflow-hidden flex items-center"
      style={{ height: CARD_HEIGHT + 8 }}
    >
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

function useResponsiveRowCount() {
  const [rowCount, setRowCount] = useState(MOBILE_ROW_COUNT);

  useEffect(() => {
    const checkWidth = () => {
      setRowCount(window.innerWidth >= 768 ? DESKTOP_ROW_COUNT : MOBILE_ROW_COUNT);
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  return rowCount;
}

export function AuthBackgroundGrid() {
  const [items, setItems] = useState<ItemWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [pausedCard, setPausedCard] = useState<{ id: string; row: number } | null>(null);
  const rowCount = useResponsiveRowCount();
  const totalCards = CARDS_PER_ROW * rowCount;

  useEffect(() => {
    async function fetchItems() {
      const { data } = await supabase
        .from('items')
        .select(`*, profiles!items_user_id_fkey (username, avatar_url)`)
        .not('image_url', 'is', null)
        .neq('image_url', '')
        .order('created_at', { ascending: false })
        .limit(totalCards);

      setItems((data as ItemWithProfile[]) || []);
      setLoading(false);
    }

    fetchItems();
  }, [totalCards]);

  const handleCardTap = useCallback((cardId: string, rowIndex: number) => {
    setPausedCard(prev => {
      if (prev?.id === cardId) {
        return null;
      }
      return { id: cardId, row: rowIndex };
    });
  }, []);

  const rows = useMemo(() => {
    const allCards: CardData[] = Array.from({ length: totalCards }, (_, i) => {
      const item = items[i];
      if (item) {
        return {
          id: item.id,
          image: getThumbnailUrl(item.image_url),
          title: item.description,
          category: item.category || '',
          status: item.status as 'available' | 'claimed' | 'expired',
        };
      }
      const placeholder = PLACEHOLDERS[i % PLACEHOLDERS.length];
      return {
        id: `placeholder-${i}`,
        image: placeholder.image,
        title: placeholder.title,
        category: placeholder.category,
        status: placeholder.status as 'claimed' | 'expired',
      };
    });

    const rowsData = [];
    for (let i = 0; i < rowCount; i++) {
      rowsData.push(allCards.slice(i * CARDS_PER_ROW, (i + 1) * CARDS_PER_ROW));
    }
    return rowsData;
  }, [items, rowCount, totalCards]);

  const totalRowsHeight = rowCount * (CARD_HEIGHT + ROW_GAP);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-stone-950">
        <div
          className="absolute left-0 right-0 flex flex-col pt-2"
          style={{
            top: 0,
            height: `calc(100vh - 280px)`
          }}
        >
          {Array.from({ length: rowCount }).map((_, row) => (
            <div
              key={row}
              className="flex gap-3 overflow-hidden items-center px-1.5"
              style={{ height: CARD_HEIGHT + ROW_GAP }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 rounded-2xl bg-stone-800/50 animate-pulse"
                  style={{ width: CARD_WIDTH - 12, height: CARD_HEIGHT - 12 }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-stone-950">
      <style>{`
        @keyframes scroll-right {
          0% { transform: translateX(-33.33%); }
          100% { transform: translateX(0%); }
        }
        @keyframes scroll-left {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>

      <div
        className="absolute left-0 right-0 flex flex-col justify-end md:justify-center"
        style={{
          top: 0,
          bottom: 'calc(280px + env(safe-area-inset-bottom, 0px))',
          paddingTop: '8px'
        }}
      >
        <div
          className="flex flex-col"
          style={{ gap: ROW_GAP }}
        >
          {rows.map((rowCards, index) => (
            <ScrollingRow
              key={index}
              cards={rowCards}
              direction={index % 2 === 0 ? 'right' : 'left'}
              duration={30 + index * 5}
              rowIndex={index}
              pausedCardId={pausedCard?.row === index ? pausedCard.id : null}
              onCardTap={handleCardTap}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-950 via-stone-950/90 to-transparent pointer-events-none" />
    </div>
  );
}
