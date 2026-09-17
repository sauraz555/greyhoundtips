import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PawPrint, Check, AlertCircle, Loader2, Sparkles, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

const PRICE_ID = 'price_1UGdvdK5ffGf1vlHcnVqKF3o';

export default function Subscribe() {
  const { user, subscription, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkoutStatus = searchParams.get('checkout');

  const handleSubscribe = async () => {
    setError(null);
    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setError('Please log in to start your subscription.');
        navigate('/login');
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: PRICE_ID,
          success_url: `${window.location.origin}/dashboard?checkout=success`,
          cancel_url: `${window.location.origin}/subscribe?checkout=cancelled`,
          mode: 'subscription',
        }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `Request failed (${response.status})`);
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error('No checkout URL returned.');
      }

      window.location.href = data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not start checkout.';
      setError(message);
      setLoading(false);
    }
  };

  const trialEnd = subscription?.trial_end ? new Date(Number(subscription.trial_end) * 1000) : null;
  const daysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const isActive = subscription?.status === 'trialing' || subscription?.status === 'active' || subscription?.status === 'past_due';

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Nav />
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
        {/* Checkout status banner */}
        {checkoutStatus === 'cancelled' && (
          <div className="mb-6 flex items-start gap-2 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 animate-fadeIn">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>Checkout was cancelled. You can start your subscription at any time.</span>
          </div>
        )}

        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500">
            <PawPrint className="h-6 w-6 text-ink-900" />
          </div>
          <span className="font-display text-2xl tracking-wide text-ink-900">
            GREYHOUND<span className="text-amber-500">EDGE</span>
          </span>
        </div>

        {isActive ? (
          <>
            <div className="card p-8 text-center animate-scaleIn">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" strokeWidth={2.5} />
              </div>
              <h1 className="font-display text-2xl tracking-wide text-ink-900">
                {subscription?.status === 'trialing' ? 'TRIAL ACTIVE' : 'SUBSCRIPTION ACTIVE'}
              </h1>
              {subscription?.status === 'trialing' && trialEnd && (
                <p className="mt-2 text-ink-500">
                  {daysLeft > 0
                    ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left in your free trial.`
                    : 'Your trial ends today.'}
                </p>
              )}
              <p className="mt-1 text-sm text-ink-400">
                You have full access to all model picks and race analysis.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary mt-6 w-full"
              >
                Go to dashboard
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center animate-fadeIn">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-700">
                <Sparkles className="h-4 w-4" />
                3-day free trial
              </div>
              <h1 className="font-display text-4xl tracking-wide text-ink-900 sm:text-5xl">
                UNLOCK THE <span className="text-gradient-amber">EDGE</span>
              </h1>
              <p className="mt-3 text-ink-500">
                Full access to every race, every model pick, every speed map.
              </p>
            </div>

            {/* Pricing card */}
            <div className="card mt-8 overflow-hidden p-0 animate-fadeInUp stagger-1">
              <div className="bg-ink-900 p-6 text-center">
                <p className="text-sm font-medium text-ink-300">Monthly subscription</p>
                <div className="mt-2 flex items-baseline justify-center gap-1">
                  <span className="font-display text-5xl tracking-wide text-ink-50">$25</span>
                  <span className="text-ink-400">/month</span>
                </div>
                <p className="mt-2 text-sm text-amber-400">3 days free, then $25/month</p>
              </div>

              <div className="p-6">
                <ul className="space-y-3">
                  {[
                    { icon: TrendingUp, text: 'Probable winners with win probability for every race' },
                    { icon: Zap, text: 'Animated speed maps and model-vs-market probability charts' },
                    { icon: Sparkles, text: 'False-favourite detection with written explanations' },
                    { icon: Check, text: 'Exotic tier groupings for trifecta and first-four' },
                    { icon: Check, text: 'Real-time countdown and auto-refreshing dashboard' },
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                        <f.icon className="h-3.5 w-3.5 text-amber-600" />
                      </div>
                      <span className="text-sm text-ink-700">{f.text}</span>
                    </li>
                  ))}
                </ul>

                {error && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="btn-primary mt-6 w-full text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Starting checkout...
                    </>
                  ) : (
                    'Start 3-day free trial'
                  )}
                </button>

                <p className="mt-3 text-center text-xs text-ink-400">
                  Cancel anytime. No charge during your trial.
                </p>
              </div>
            </div>

            {!user && (
              <p className="mt-6 text-center text-sm text-ink-500">
                Need an account first?{' '}
                <Link to="/signup" className="font-semibold text-amber-600 hover:text-amber-500">
                  Sign up free
                </Link>
              </p>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
