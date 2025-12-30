import { MapPin, Camera, ThumbsUp, Users, Package, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GuestHeroProps {
  stats: {
    totalItems: number;
    totalUsers: number;
    itemsThisWeek: number;
  } | null;
}

export function GuestHero({ stats }: GuestHeroProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <h1 className="text-2xl font-bold mb-2">Find free stuff near you</h1>
          <p className="text-emerald-100 text-sm mb-5 max-w-[280px]">
            Discover curbside treasures your neighbors are giving away. One person's clutter is another's find.
          </p>

          <button
            onClick={() => navigate('/auth')}
            className="bg-white text-emerald-600 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-emerald-50 transition-colors shadow-lg shadow-emerald-700/20"
          >
            Get started free
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {stats && (stats.totalItems > 0 || stats.totalUsers > 0) && (
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white dark:bg-stone-900 rounded-xl p-3 text-center shadow-sm">
            <div className="flex justify-center mb-1">
              <Package size={18} className="text-emerald-500" />
            </div>
            <div className="text-lg font-bold text-stone-800 dark:text-stone-200">
              {stats.totalItems > 0 ? stats.totalItems.toLocaleString() : '-'}
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400">Items shared</div>
          </div>
          <div className="bg-white dark:bg-stone-900 rounded-xl p-3 text-center shadow-sm">
            <div className="flex justify-center mb-1">
              <Users size={18} className="text-blue-500" />
            </div>
            <div className="text-lg font-bold text-stone-800 dark:text-stone-200">
              {stats.totalUsers > 0 ? stats.totalUsers.toLocaleString() : '-'}
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400">Members</div>
          </div>
          <div className="bg-white dark:bg-stone-900 rounded-xl p-3 text-center shadow-sm">
            <div className="flex justify-center mb-1">
              <MapPin size={18} className="text-amber-500" />
            </div>
            <div className="text-lg font-bold text-stone-800 dark:text-stone-200">
              {stats.itemsThisWeek > 0 ? stats.itemsThisWeek.toLocaleString() : '-'}
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400">This week</div>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2">
        <FeatureCard
          icon={<Camera size={20} className="text-stone-600 dark:text-stone-300" />}
          label="Snap & share"
        />
        <FeatureCard
          icon={<MapPin size={20} className="text-stone-600 dark:text-stone-300" />}
          label="Find nearby"
        />
        <FeatureCard
          icon={<ThumbsUp size={20} className="text-stone-600 dark:text-stone-300" />}
          label="Confirm finds"
        />
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
        <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
        <span>Browse recent finds</span>
        <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
      </div>
    </div>
  );
}

function FeatureCard({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="bg-stone-100 dark:bg-stone-800/50 rounded-xl p-3 flex flex-col items-center gap-1.5">
      {icon}
      <span className="text-xs text-stone-600 dark:text-stone-400 text-center">{label}</span>
    </div>
  );
}

export function GuestBottomCTA() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-stone-100 to-stone-50 dark:from-stone-800 dark:to-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl p-5 text-center mt-4">
      <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-1">
        Ready to join your community?
      </h3>
      <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
        Create a free account to post finds, save favorites, and connect with neighbors.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => navigate('/auth')}
          className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-600 transition-colors"
        >
          Sign up free
        </button>
        <button
          onClick={() => navigate('/auth')}
          className="bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 px-5 py-2.5 rounded-xl font-medium hover:bg-stone-50 dark:hover:bg-stone-600 transition-colors border border-stone-200 dark:border-stone-600"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
