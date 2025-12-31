import { useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  className?: string;
}

const THRESHOLD = 80;
const MAX_PULL = 120;
const RESISTANCE = 2.5;
const MIN_PULL_TIME_MS = 100;

export function PullToRefresh({ onRefresh, children, className = '' }: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const pullStartTime = useRef(0);
  const wasAtTopOnStart = useRef(false);

  const isAtTop = useCallback(() => {
    if (!containerRef.current) return false;
    return containerRef.current.scrollTop <= 0;
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isRefreshing) return;

    const atTop = isAtTop();
    wasAtTopOnStart.current = atTop;

    if (!atTop) return;

    startY.current = e.touches[0].clientY;
    currentY.current = e.touches[0].clientY;
    pullStartTime.current = Date.now();
    setIsPulling(true);
  }, [isAtTop, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || isRefreshing || !wasAtTopOnStart.current) return;

    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    if (diff > 0 && isAtTop()) {
      e.preventDefault();
      const dampedDistance = Math.min(diff / RESISTANCE, MAX_PULL);
      setPullDistance(dampedDistance);
    } else if (diff <= 0) {
      setPullDistance(0);
    }
  }, [isPulling, isRefreshing, isAtTop]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    setIsPulling(false);

    const pullDuration = Date.now() - pullStartTime.current;
    const validPull = wasAtTopOnStart.current &&
                      pullDuration >= MIN_PULL_TIME_MS &&
                      isAtTop();

    if (pullDistance >= THRESHOLD && !isRefreshing && validPull) {
      setIsRefreshing(true);
      setPullDistance(60);

      try {
        await onRefresh();
      } finally {
        await new Promise(resolve => setTimeout(resolve, 300));
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }

    wasAtTopOnStart.current = false;
  }, [isPulling, pullDistance, isRefreshing, onRefresh, isAtTop]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const rotation = progress * 180;
  const scale = 0.5 + progress * 0.5;
  const opacity = Math.min(progress * 1.5, 1);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto relative ${className}`}
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
      }}
    >
      <div
        className="absolute left-0 right-0 flex justify-center pointer-events-none z-10"
        style={{
          top: -50,
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
            isRefreshing || progress >= 1
              ? 'bg-emerald-500 text-white'
              : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300'
          }`}
          style={{
            opacity,
            transform: `scale(${scale})`,
            transition: isPulling ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <RefreshCw
            size={20}
            className={isRefreshing ? 'animate-spin' : ''}
            style={{
              transform: isRefreshing ? 'none' : `rotate(${rotation}deg)`,
              transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>
      </div>

      <div
        ref={contentRef}
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
