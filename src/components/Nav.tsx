import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PawPrint, LayoutDashboard, UserCircle, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { isSubscriptionActive, isProfileInTrial } from '@/lib/subscription';

export default function Nav() {
  const { user, profile, subscription, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const isTrialing = subscription?.status === 'trialing' || isProfileInTrial(profile?.created_at);
  const isPaid = subscription?.status === 'active' || subscription?.status === 'past_due';

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-ink-50/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to={user ? '/dashboard' : '/'} className="group flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 shadow-md shadow-amber-500/20 transition-transform group-hover:scale-110">
            <PawPrint className="h-5 w-5 text-ink-900" />
          </div>
          <div className="font-display text-xl tracking-wide text-ink-900">
            GREYHOUND<span className="text-amber-500">EDGE</span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {user && (
            <>
              {isTrialing && (
                <span className="hidden items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 sm:flex">
                  <Sparkles className="h-3 w-3" />
                  Trial
                </span>
              )}
              {isPaid && (
                <span className="hidden items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 sm:flex">
                  <Sparkles className="h-3 w-3" />
                  Pro
                </span>
              )}
              <nav className="flex items-center gap-1">
                <Link
                  to="/dashboard"
                  className={`btn-ghost transition-all ${isActive('/dashboard') ? 'text-amber-600 bg-amber-50 shadow-sm' : ''}`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link
                  to="/account"
                  className={`btn-ghost transition-all ${isActive('/account') ? 'text-amber-600 bg-amber-50 shadow-sm' : ''}`}
                >
                  <UserCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Account</span>
                </Link>
                <button onClick={handleSignOut} className="btn-ghost group">
                  <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </nav>
            </>
          )}
        </div>
      </div>
      {/* Animated track line */}
      <div className="dog-track" />
    </header>
  );
}
