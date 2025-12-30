import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Award, Package, ShoppingBag, User, Settings } from 'lucide-react';
import { Layout, Header } from '../components/Layout';
import { ItemCard } from '../components/ItemCard';
import { EditItemModal } from '../components/EditItemModal';
import { SettingsModal } from '../components/SettingsModal';
import { useAuth } from '../contexts/AuthContext';
import { useUserItems } from '../hooks/useItems';
import { useLocation } from '../contexts/LocationContext';
import { getAvatarUrl } from '../utils/image';
import type { ItemWithProfile } from '../types/database';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { items, loading, refresh } = useUserItems(user?.id);
  const { location } = useLocation();
  const [activeTab, setActiveTab] = useState<'posted' | 'claimed'>('posted');
  const [editingItem, setEditingItem] = useState<ItemWithProfile | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user || !profile) {
    return (
      <Layout>
        <Header />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="bg-stone-100 dark:bg-stone-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-stone-400 dark:text-stone-500" size={32} />
          </div>
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">Sign in to view your profile</h2>
          <p className="text-stone-600 dark:text-stone-400 mb-6">Track your finds and earn points</p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
          >
            Sign in
          </button>
        </div>
      </Layout>
    );
  }

  const userCoords = location ? { lat: location.latitude, lng: location.longitude } : null;
  const postedItems = items.filter(item => item.user_id === user.id);
  const claimedItems = items.filter(item => item.claimed_by === user.id);

  return (
    <Layout>
      <Header
        rightAction={
          <button
            onClick={handleSignOut}
            className="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
          >
            <LogOut size={20} />
          </button>
        }
      />

      <div className="flex-1 overflow-auto">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm flex-shrink-0">
              {profile.avatar_url ? (
                <img
                  src={getAvatarUrl(profile.avatar_url, 128)}
                  alt={profile.username || 'Avatar'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={28} className="text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">{profile.username || 'User'}</h1>
              <p className="text-emerald-100 text-sm truncate">{user.email}</p>
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors flex-shrink-0"
              aria-label="Open settings"
            >
              <Settings size={20} className="text-white" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
            <Award size={24} className="text-amber-300" />
            <span className="text-3xl font-bold">{profile.points}</span>
            <span className="text-emerald-100">points</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2.5 rounded-xl">
                <Package className="text-emerald-600 dark:text-emerald-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{profile.items_posted}</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">Posted</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 dark:bg-amber-900/50 p-2.5 rounded-xl">
                <ShoppingBag className="text-amber-600 dark:text-amber-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{profile.items_claimed}</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">Claimed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
            <button
              onClick={() => setActiveTab('posted')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'posted'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              My Posts ({postedItems.length})
            </button>
            <button
              onClick={() => setActiveTab('claimed')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'claimed'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              Claimed ({claimedItems.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-stone-900 rounded-2xl p-4 animate-pulse">
                <div className="aspect-video bg-stone-200 dark:bg-stone-700 rounded-xl mb-3" />
                <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {(activeTab === 'posted' ? postedItems : claimedItems).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-stone-500 dark:text-stone-400">
                  {activeTab === 'posted'
                    ? "You haven't posted any finds yet"
                    : "You haven't claimed any finds yet"}
                </p>
              </div>
            ) : (
              (activeTab === 'posted' ? postedItems : claimedItems).map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  userLocation={userCoords}
                  currentUserId={activeTab === 'posted' ? user?.id : undefined}
                  onClick={() => navigate(`/item/${item.id}`)}
                  onEdit={activeTab === 'posted' ? () => setEditingItem(item) : undefined}
                />
              ))
            )}
          </div>
        )}
      </div>
      </div>

      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={() => {
            setEditingItem(null);
            refresh();
          }}
          onDeleted={() => {
            setEditingItem(null);
            refreshProfile();
            refresh();
          }}
        />
      )}

      {settingsOpen && (
        <SettingsModal onClose={() => setSettingsOpen(false)} />
      )}
    </Layout>
  );
}
