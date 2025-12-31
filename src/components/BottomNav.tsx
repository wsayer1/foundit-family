import { useNavigate, useLocation } from 'react-router-dom';
import { List, Map, Plus, User, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 px-4 py-3 safe-area-bottom z-50">
      <div className="max-w-lg mx-auto flex items-center justify-between px-2">
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('/') ? 'text-emerald-600 dark:text-emerald-500' : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
          }`}
        >
          <List size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className="text-xs font-medium">Discover</span>
        </button>

        <button
          onClick={() => navigate('/map')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('/map') ? 'text-emerald-600 dark:text-emerald-500' : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
          }`}
        >
          <Map size={24} strokeWidth={isActive('/map') ? 2.5 : 2} />
          <span className="text-xs font-medium">Map</span>
        </button>

        <button
          onClick={() => navigate(user ? '/post' : '/auth')}
          className="flex flex-col items-center gap-1 -mt-4"
        >
          <div className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95">
            <Plus size={28} strokeWidth={2.5} />
          </div>
        </button>

        <button
          onClick={() => navigate('/leaderboard')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('/leaderboard') ? 'text-emerald-600 dark:text-emerald-500' : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
          }`}
        >
          <Trophy size={24} strokeWidth={isActive('/leaderboard') ? 2.5 : 2} />
          <span className="text-xs font-medium">Ranks</span>
        </button>

        <button
          onClick={() => navigate(user ? '/profile' : '/auth')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('/profile') ? 'text-emerald-600 dark:text-emerald-500' : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
          }`}
        >
          <User size={24} strokeWidth={isActive('/profile') ? 2.5 : 2} />
          <span className="text-xs font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
}
