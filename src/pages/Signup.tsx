import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PawPrint, Check, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Footer from '@/components/Footer';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!ageConfirmed) {
      setError('You must confirm you are 18+ to create an account.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { age_confirmed: true },
      },
    });

    if (signUpError) {
      const code = signUpError.message.toLowerCase();
      if (code.includes('already') || code.includes('exists') || code.includes('registered')) {
        // Do not confirm whether an address already has an account.
        navigate('/login', {
          state: {
            message:
              'Check your inbox to finish setting up your account, then log in below.',
          },
        });
        return;
      }
      setError('Could not create your account. Please check your details and try again.');
      setLoading(false);
      return;
    }

    if (data.session) {
      navigate('/subscribe');
    } else {
      navigate('/login', {
        state: {
          message: 'Check your inbox to finish setting up your account, then log in below.',
        },
      });
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500">
              <PawPrint className="h-6 w-6 text-ink-900" />
            </div>
            <span className="font-display text-2xl tracking-wide text-ink-900">
              GREYHOUND<span className="text-amber-500">EDGE</span>
            </span>
          </Link>

          <div className="card p-6 sm:p-8">
            <h1 className="font-display text-2xl tracking-wide text-ink-900">CREATE ACCOUNT</h1>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
              <Sparkles className="h-3 w-3" />
              3-day free trial included
            </div>
            <p className="mt-2 text-sm text-ink-500">Full access to every race, every model pick.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="input-field"
                  placeholder="At least 6 characters"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-6 rounded-md border-2 border-ink-300 transition-colors peer-checked:border-amber-500 peer-checked:bg-amber-500" />
                  {ageConfirmed && (
                    <Check className="absolute left-0.5 top-0.5 h-5 w-5 text-ink-900" strokeWidth={3} />
                  )}
                </div>
                <span className="text-sm text-ink-600 group-hover:text-ink-900">
                  I am 18 years or older and understand this is a model output,
                  not financial or betting advice.
                </span>
              </label>

              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-ink-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-amber-600 hover:text-amber-500">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
