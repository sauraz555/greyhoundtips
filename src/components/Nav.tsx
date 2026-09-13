import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PawPrint, LayoutDashboard, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Nav() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-ink-50/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500">
            <PawPrint className="h-5 w-5 text-ink-900" />
          </div>
          <div className="font-display text-xl tracking-wide text-ink-900">
            GREYHOUND<span className="text-amber-500">EDGE</span>
          </div>
        </Link>

        {user && (
          <nav className="flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`btn-ghost ${isActive('/dashboard') ? 'text-amber-600 bg-amber-50' : ''}`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
              to="/account"
              className={`btn-ghost ${isActive('/account') ? 'text-amber-600 bg-amber-50' : ''}`}
            >
              <UserCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </Link>
            <button onClick={handleSignOut} className="btn-ghost">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
