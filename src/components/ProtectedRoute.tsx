import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isSubscriptionActive } from '@/lib/subscription';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, profile, subscription, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-300 border-t-amber-500" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const hasActiveSubscription = isSubscriptionActive(subscription?.status, profile?.created_at);

  if (!hasActiveSubscription) {
    return <Navigate to="/subscribe" replace />;
  }

  return <>{children}</>;
}
