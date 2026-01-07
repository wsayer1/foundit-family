import { ReactNode } from 'react';
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
