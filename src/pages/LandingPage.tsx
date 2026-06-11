import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Camera, ArrowRight, Sparkles, CheckCircle2, User } from 'lucide-react';
import {
  AnimatedCameraIcon,
  AnimatedMapPinIcon,
  AnimatedThumbsUpIcon,
  AnimatedHeartIcon,
  AnimatedRecycleIcon,
  AnimatedUsersIcon,
} from '../components/LandingAnimatedIcons';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useAuth } from '../contexts/AuthContext';
import { useSiteStats, useFeaturedItems } from '../hooks/useSiteData';
import type { FeaturedItem } from '../hooks/useSiteData';
import { formatTimeAgo } from '../utils/time';

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


export function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const { stats } = useSiteStats(false);
  const { items: featuredItems, loading: featuredLoading } = useFeaturedItems(4);

  const state = location.state as LocationState | null;
  const fromLogo = state?.fromLogo === true;

  useEffect(() => {
    if (loading) return;

    if (fromLogo) return;

    if (user) {
      navigate('/discover', { replace: true });
    }
  }, [user, loading, navigate, fromLogo]);

  const handleEnterApp = () => {
    navigate('/discover');
  };

  const handleSignUp = () => {
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
              className="font-semibold text-lg text-white tracking-tight"
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
            className="w-full h-full object-cover opacity-50 brightness-110 animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/30 via-stone-950/60 to-stone-950" />
        </div>

        <div className="relative w-full max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div>
            <div
              className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-up"
            >
              <MapPin size={16} />
              <span>Made for San Francisco</span>
            </div>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-up"
              style={{ fontFamily: "'Clash Display', system-ui, sans-serif", animationDelay: '0.1s' }}
            >
              Find Free Treasures
              <br />
              <span className="text-emerald-400">Across SF</span>
            </h1>

            <p
              className="text-lg sm:text-xl text-stone-300 mb-8 max-w-2xl leading-relaxed animate-fade-up"
              style={{ animationDelay: '0.2s' }}
            >
              Discover curbside gems your neighbors are giving away. From vintage furniture to hidden treasures,
              one person's clutter is another's find.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-up"
              style={{ animationDelay: '0.3s' }}
            >
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
              <div className="flex flex-wrap gap-6 sm:gap-10 animate-fade-up" style={{ animationDelay: '0.45s' }}>
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

        <div className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-2.5 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-32 bg-stone-950 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4">
          <Reveal className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}
            >
              How It Works
            </h2>
            <p className="text-stone-400 text-lg max-w-2xl mx-auto">
              Join your SF neighbors in building a community of sharing and discovery
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <FeatureCard
              icon={<AnimatedCameraIcon size={40} />}
              title="Snap & Share"
              description="Spot something cool on the curb? Take a photo and share it with your neighborhood in seconds."
              step={1}
              delay={0}
            />
            <FeatureCard
              icon={<AnimatedMapPinIcon size={40} />}
              title="Discover Nearby"
              description="Browse items posted by neighbors in real-time. Filter by distance, category, or freshness."
              step={2}
              delay={120}
            />
            <FeatureCard
              icon={<AnimatedThumbsUpIcon size={40} />}
              title="Confirm & Claim"
              description="Let others know if an item is still there. Claim items you've picked up to help the community."
              step={3}
              delay={240}
            />
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-stone-900/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Reveal>
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
                    className="px-3 py-1.5 bg-stone-800/80 rounded-full text-sm text-stone-300 border border-stone-700 hover:border-emerald-500/50 hover:text-emerald-300 hover:-translate-y-0.5 transition-all duration-200 cursor-default"
                  >
                    {neighborhood}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal className="relative" delay={150}>
              {featuredLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <FeaturedItemSkeleton aspectClass="aspect-[4/5]" />
                    <FeaturedItemSkeleton aspectClass="aspect-square" />
                  </div>
                  <div className="space-y-4 pt-8">
                    <FeaturedItemSkeleton aspectClass="aspect-square" />
                    <FeaturedItemSkeleton aspectClass="aspect-[4/5]" />
                  </div>
                </div>
              ) : featuredItems.length > 0 ? (
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
                    <div className="rounded-2xl aspect-[4/5] bg-stone-800/30 border border-stone-700/50 flex items-center justify-center">
                      <div className="text-center p-4">
                        <Camera size={32} className="text-stone-600 mx-auto mb-2" />
                        <p className="text-stone-500 text-sm">Be the first to share a find!</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="rounded-2xl aspect-square bg-stone-800/30 border border-stone-700/50 flex items-center justify-center">
                      <div className="text-center p-4">
                        <MapPin size={32} className="text-stone-600 mx-auto mb-2" />
                        <p className="text-stone-500 text-sm">Finds will appear here</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="absolute -bottom-4 left-0 bg-emerald-500 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/30">
                All 100% Free
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-stone-950">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}
            >
              More Than Just Finds
            </h2>
            <p className="text-stone-400 text-lg max-w-2xl mx-auto">
              Join a movement that's good for your wallet and the planet
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard
              icon={<AnimatedHeartIcon size={36} />}
              title="Build Community"
              description="Connect with neighbors and discover the generous spirit of San Francisco."
              delay={0}
            />
            <ValueCard
              icon={<AnimatedRecycleIcon size={36} />}
              title="Reduce Waste"
              description="Keep perfectly good items out of landfills by giving them a second life."
              delay={120}
            />
            <ValueCard
              icon={<AnimatedUsersIcon size={36} />}
              title="Help Others"
              description="What you don't need might be exactly what someone else is looking for."
              delay={240}
            />
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-32 bg-gradient-to-b from-stone-900/50 to-stone-950 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <Reveal className="relative max-w-4xl mx-auto px-4 text-center">
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
        </Reveal>
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

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useScrollReveal(delay);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  step,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: number;
  delay: number;
}) {
  return (
    <Reveal
      delay={delay}
      className="group relative bg-stone-900/50 border border-stone-800 rounded-3xl p-8 hover:border-emerald-500/40 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300"
    >
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-emerald-500/30">
        {step}
      </div>
      <div className="bg-emerald-500/20 w-20 h-20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-500/30 group-hover:scale-105 transition-all duration-300">
        {icon}
      </div>
      <h3
        className="text-xl font-semibold mb-3"
        style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}
      >
        {title}
      </h3>
      <p className="text-stone-400 leading-relaxed">{description}</p>
    </Reveal>
  );
}

function ValueCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <Reveal
      delay={delay}
      className="group text-center p-8 rounded-3xl hover:bg-stone-900/50 transition-colors duration-300"
    >
      <div className="bg-emerald-500/20 w-20 h-20 rounded-2xl flex items-center justify-center text-emerald-400 mb-5 mx-auto group-hover:bg-emerald-500/30 group-hover:scale-105 transition-all duration-300">
        {icon}
      </div>
      <h3
        className="text-lg font-semibold mb-2"
        style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}
      >
        {title}
      </h3>
      <p className="text-stone-400 text-sm leading-relaxed">{description}</p>
    </Reveal>
  );
}

function FeaturedItemSkeleton({ aspectClass }: { aspectClass: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-stone-800/50 animate-pulse">
      <div className={`w-full ${aspectClass} bg-stone-700/50`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-stone-600/50" />
          <div className="flex-1 min-w-0 space-y-1">
            <div className="h-3 w-16 bg-stone-600/50 rounded" />
            <div className="h-2 w-10 bg-stone-600/50 rounded" />
          </div>
          <div className="h-4 w-10 bg-stone-600/50 rounded-full" />
        </div>
        <div className="space-y-1">
          <div className="h-3.5 w-full bg-stone-600/50 rounded" />
          <div className="h-3.5 w-2/3 bg-stone-600/50 rounded" />
        </div>
      </div>
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
  const username = item.profiles?.username || 'Anonymous';
  const avatarUrl = item.profiles?.avatar_url;

  return (
    <div className="relative group overflow-hidden rounded-2xl">
      <img
        src={item.image_url}
        alt={item.description || 'Community find'}
        className={`w-full ${aspectClass} object-cover transition-transform duration-300 group-hover:scale-105`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-3 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300">
        <div className="flex items-center gap-2 mb-2">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username}
              className="w-6 h-6 rounded-full object-cover border border-white/20"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-stone-700 flex items-center justify-center border border-white/20">
              <User size={12} className="text-stone-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{username}</p>
            <p className="text-stone-400 text-[10px]">{formatTimeAgo(item.created_at)}</p>
          </div>
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-full">
              <CheckCircle2 size={10} />
              Live
            </span>
          ) : (
            <span className="text-[10px] font-medium text-stone-400 bg-stone-700/50 px-1.5 py-0.5 rounded-full">
              Claimed
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
