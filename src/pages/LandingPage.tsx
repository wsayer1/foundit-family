import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Camera, ThumbsUp, Users, ArrowRight, Sparkles, Heart, Recycle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSiteStats, useFeaturedItems } from '../hooks/useItems';
import type { FeaturedItem } from '../hooks/useItems';

interface LocationState {
  fromLogo?: boolean;
}

const SF_NEIGHBORHOODS = [
  'Mission District',
  'SOMA',
  'Castro',
  'Noe Valley',
  'Hayes Valley',
  'Marina',
  'Haight-Ashbury',
  'Sunset',
  'Richmond',
  'Potrero Hill',
];

const LANDING_VISITED_KEY = 'foundit_landing_visited';

export function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const { stats } = useSiteStats(false);
  const { items: featuredItems } = useFeaturedItems(4);

  const state = location.state as LocationState | null;
  const fromLogo = state?.fromLogo === true;

  useEffect(() => {
    if (loading) return;

    if (fromLogo) return;

    const hasVisited = localStorage.getItem(LANDING_VISITED_KEY);
    if (user || hasVisited) {
      navigate('/discover', { replace: true });
    }
  }, [user, loading, navigate, fromLogo]);

  const handleEnterApp = () => {
    localStorage.setItem(LANDING_VISITED_KEY, 'true');
    navigate('/discover');
  };

  const handleSignUp = () => {
    localStorage.setItem(LANDING_VISITED_KEY, 'true');
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 safe-area-top">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/foundit.family_logo_small_light_grey_bg.png"
              alt="Foundit.Family"
              className="h-9 w-auto rounded-lg"
            />
            <span
              className="font-semibold text-lg text-white tracking-tight hidden sm:inline"
              style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}
            >
              foundit.family
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!user && (
              <button
                onClick={handleSignUp}
                className="text-stone-300 hover:text-white text-sm font-medium transition-colors"
              >
                Sign in
              </button>
            )}
            <button
              onClick={handleEnterApp}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              Enter App
            </button>
          </div>
        </div>
      </header>

      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.pexels.com/photos/1006965/pexels-photo-1006965.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="San Francisco skyline"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-stone-950/80 to-stone-950" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MapPin size={16} />
              <span>Made for San Francisco</span>
            </div>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
              style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}
            >
              Find Free Treasures
              <br />
              <span className="text-emerald-400">Across SF</span>
            </h1>

            <p className="text-lg sm:text-xl text-stone-300 mb-8 max-w-xl leading-relaxed">
              Discover curbside gems your neighbors are giving away. From vintage furniture to hidden treasures,
              one person's clutter is another's find.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={handleEnterApp}
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                Start Exploring
                <ArrowRight size={20} />
              </button>
              {!user && (
                <button
                  onClick={handleSignUp}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all border border-white/20"
                >
                  Create Account
                </button>
              )}
            </div>

            {stats && (stats.totalItems > 0 || stats.totalUsers > 0) && (
              <div className="flex flex-wrap gap-6 sm:gap-10">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {stats.totalItems > 0 ? stats.totalItems.toLocaleString() : '0'}+
                  </div>
                  <div className="text-sm text-stone-400">Items shared</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {stats.totalUsers > 0 ? stats.totalUsers.toLocaleString() : '0'}+
                  </div>
                  <div className="text-sm text-stone-400">Community members</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {stats.itemsThisWeek > 0 ? stats.itemsThisWeek.toLocaleString() : '0'}
                  </div>
                  <div className="text-sm text-stone-400">Posted this week</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-2.5 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-stone-950">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}
            >
              How It Works
            </h2>
            <p className="text-stone-400 text-lg max-w-2xl mx-auto">
              Join your SF neighbors in building a community of sharing and discovery
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <FeatureCard
              icon={<Camera size={28} />}
              title="Snap & Share"
              description="Spot something cool on the curb? Take a photo and share it with your neighborhood in seconds."
              step={1}
            />
            <FeatureCard
              icon={<MapPin size={28} />}
              title="Discover Nearby"
              description="Browse items posted by neighbors in real-time. Filter by distance, category, or freshness."
              step={2}
            />
            <FeatureCard
              icon={<ThumbsUp size={28} />}
              title="Confirm & Claim"
              description="Let others know if an item is still there. Claim items you've picked up to help the community."
              step={3}
            />
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-stone-900/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles size={16} />
                <span>Built for SF</span>
              </div>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
                style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}
              >
                Your Neighborhood,
                <br />
                <span className="text-emerald-400">Your Community</span>
              </h2>
              <p className="text-stone-300 text-lg mb-8 leading-relaxed">
                Foundit.family is made specifically for San Francisco. Whether you're in the Mission or the Marina,
                Sunset or SOMA, discover what your neighbors are sharing right around the corner.
              </p>

              <div className="flex flex-wrap gap-2">
                {SF_NEIGHBORHOODS.map((neighborhood) => (
                  <span
                    key={neighborhood}
                    className="px-3 py-1.5 bg-stone-800/80 rounded-full text-sm text-stone-300 border border-stone-700"
                  >
                    {neighborhood}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              {featuredItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <FeaturedItemCard item={featuredItems[0]} aspectClass="aspect-[4/5]" />
                    {featuredItems[1] && <FeaturedItemCard item={featuredItems[1]} aspectClass="aspect-square" />}
                  </div>
                  <div className="space-y-4 pt-8">
                    {featuredItems[2] && <FeaturedItemCard item={featuredItems[2]} aspectClass="aspect-square" />}
                    {featuredItems[3] && <FeaturedItemCard item={featuredItems[3]} aspectClass="aspect-[4/5]" />}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="rounded-2xl w-full aspect-[4/5] bg-stone-800/50 animate-pulse" />
                    <div className="rounded-2xl w-full aspect-square bg-stone-800/50 animate-pulse" />
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="rounded-2xl w-full aspect-square bg-stone-800/50 animate-pulse" />
                    <div className="rounded-2xl w-full aspect-[4/5] bg-stone-800/50 animate-pulse" />
                  </div>
                </div>
              )}
              <div className="absolute -bottom-4 -left-4 bg-emerald-500 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/30">
                All 100% Free
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-stone-950">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}
            >
              More Than Just Finds
            </h2>
            <p className="text-stone-400 text-lg max-w-2xl mx-auto">
              Join a movement that's good for your wallet and the planet
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard
              icon={<Heart size={24} />}
              title="Build Community"
              description="Connect with neighbors and discover the generous spirit of San Francisco."
            />
            <ValueCard
              icon={<Recycle size={24} />}
              title="Reduce Waste"
              description="Keep perfectly good items out of landfills by giving them a second life."
            />
            <ValueCard
              icon={<Users size={24} />}
              title="Help Others"
              description="What you don't need might be exactly what someone else is looking for."
            />
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-gradient-to-b from-stone-900/50 to-stone-950">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
            style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}
          >
            Ready to Explore?
          </h2>
          <p className="text-stone-300 text-lg mb-10 max-w-xl mx-auto">
            Join your SF neighbors and start discovering free treasures in your neighborhood today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleEnterApp}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              Enter App
              <ArrowRight size={20} />
            </button>
          </div>

          <p className="text-stone-500 text-sm mt-6">
            {user
              ? "Welcome back! Ready to explore?"
              : "No account required to browse. Create one when you're ready to post."}
          </p>
        </div>
      </section>

      <footer className="py-8 border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/foundit.family_logo_small_light_grey_bg.png"
                alt="Foundit.Family"
                className="h-8 w-auto rounded-lg"
              />
              <span
                className="font-semibold text-white"
                style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}
              >
                foundit.family
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-stone-400">
              <a href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="/tos" className="hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  step,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: number;
}) {
  return (
    <div className="relative bg-stone-900/50 border border-stone-800 rounded-3xl p-8 hover:border-stone-700 transition-colors">
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-sm font-bold">
        {step}
      </div>
      <div className="bg-emerald-500/20 w-14 h-14 rounded-2xl flex items-center justify-center text-emerald-400 mb-6">
        {icon}
      </div>
      <h3
        className="text-xl font-semibold mb-3"
        style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}
      >
        {title}
      </h3>
      <p className="text-stone-400 leading-relaxed">{description}</p>
    </div>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6">
      <div className="bg-emerald-500/20 w-14 h-14 rounded-2xl flex items-center justify-center text-emerald-400 mb-4 mx-auto">
        {icon}
      </div>
      <h3
        className="text-lg font-semibold mb-2"
        style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}
      >
        {title}
      </h3>
      <p className="text-stone-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function FeaturedItemCard({
  item,
  aspectClass,
}: {
  item: FeaturedItem;
  aspectClass: string;
}) {
  const isAvailable = item.status === 'available';

  return (
    <div className="relative group overflow-hidden rounded-2xl">
      <img
        src={item.image_url}
        alt={item.description || 'Community find'}
        className={`w-full ${aspectClass} object-cover transition-transform duration-300 group-hover:scale-105`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <div className="flex items-center gap-2 mb-1">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
              <CheckCircle2 size={12} />
              Available now
            </span>
          ) : (
            <span className="text-xs font-medium text-stone-400">
              Recently claimed
            </span>
          )}
        </div>
        <p className="text-white text-sm font-medium line-clamp-2">
          {item.description || item.category || 'Free find'}
        </p>
      </div>
    </div>
  );
}
