import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function Layout({ children, hideNav }: LayoutProps) {
  return (
    <div className="h-screen-safe bg-stone-50 dark:bg-stone-950 flex flex-col overflow-hidden">
      <main className="flex-1 flex flex-col pb-20 min-h-0">
        {children}
      </main>

      {!hideNav && <BottomNav />}
    </div>
  );
}

export function Header({ title, showBack, rightAction }: { title?: string; showBack?: boolean; rightAction?: ReactNode }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border-b border-stone-200/50 dark:border-stone-800/50">
      <div className="px-4 h-14 flex items-center">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-1.5 rounded-lg">
              <MapPin size={18} className="text-white" />
            </div>
            <span className="font-semibold text-stone-900 dark:text-stone-100">Street Finds</span>
          </div>
        )}

        {title && (
          <h1 className="flex-1 text-center font-semibold text-stone-900 dark:text-stone-100">
            {title}
          </h1>
        )}

        <div className="ml-auto">
          {rightAction}
        </div>
      </div>
    </header>
  );
}
