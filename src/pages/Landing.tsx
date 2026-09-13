import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PawPrint, TrendingUp, Clock, AlertTriangle, Check, ArrowRight, BarChart3, Zap, Eye } from 'lucide-react';
import Footer from '@/components/Footer';

export default function Landing() {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-900 text-ink-50">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #d97706 0%, transparent 50%), radial-gradient(circle at 80% 80%, #d97706 0%, transparent 50%)'
        }} />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500">
              <PawPrint className="h-6 w-6 text-ink-900" />
            </div>
            <span className="font-display text-2xl tracking-wide">
              GREYHOUND<span className="text-amber-500">EDGE</span>
            </span>
          </div>

          <h1 className="font-display text-5xl leading-tight tracking-wide sm:text-7xl">
            MODEL PICKS.<br />
            <span className="text-amber-500">EVERY RACE.</span><br />
            EVERY DAY.
          </h1>

          <p className="mt-6 max-w-xl text-lg text-ink-200">
            Free daily model-generated analysis for Australian greyhound racing.
            Probable winners, confidence ratings, and false-favourite detection —
            updated live as races approach post time.
          </p>

          {/* CTA with age confirmation */}
          <div className="mt-8 max-w-md">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-6 w-6 rounded-md border-2 border-ink-400 transition-colors peer-checked:border-amber-500 peer-checked:bg-amber-500" />
                {ageConfirmed && (
                  <Check className="absolute left-0.5 top-0.5 h-5 w-5 text-ink-900" strokeWidth={3} />
                )}
              </div>
              <span className="text-sm text-ink-200 group-hover:text-ink-100">
                I am 18 years or older and understand this is a model output,
                not financial or betting advice.
              </span>
            </label>

            <button
              disabled={!ageConfirmed}
              onClick={() => navigate('/signup')}
              className="btn-primary mt-4 w-full text-base"
            >
              Sign up free
              <ArrowRight className="h-5 w-5" />
            </button>

            <p className="mt-3 text-center text-sm text-ink-300">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-amber-400 hover:text-amber-300">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-display text-lg tracking-wide text-ink-900">PROBABLE WINNERS</h3>
            <p className="mt-2 text-sm text-ink-500">
              Each race shows the model's top pick with win probability and a
              visual confidence bar — not a tip, a statistical output.
            </p>
          </div>

          <div className="card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-display text-lg tracking-wide text-ink-900">LIVE COUNTDOWN</h3>
            <p className="mt-2 text-sm text-ink-500">
              Real-time countdown to every race post time. Cards highlight
              jumping-soon races and grey out after the jump.
            </p>
          </div>

          <div className="card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-display text-lg tracking-wide text-ink-900">FALSE FAVOURITES</h3>
            <p className="mt-2 text-sm text-ink-500">
              The model flags short-priced favourites whose form doesn't stack up —
              with a written explanation of why.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <BarChart3 className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-display text-lg tracking-wide text-ink-900">FULL RUNNER DATA</h3>
            <p className="mt-2 text-sm text-ink-500">
              Every runner with box, trainer, price, win probability, and
              top-4 probability — expand any race for the complete table.
            </p>
          </div>

          <div className="card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <Zap className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-display text-lg tracking-wide text-ink-900">EXOTIC GROUPINGS</h3>
            <p className="mt-2 text-sm text-ink-500">
              Model-generated tier groupings for trifecta and first-four
              construction — collapsed by default, available on demand.
            </p>
          </div>

          <div className="card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <Eye className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-display text-lg tracking-wide text-ink-900">SHAREABLE LINKS</h3>
            <p className="mt-2 text-sm text-ink-500">
              Every race has its own URL — share a deep link to a specific
              race's full analysis with anyone on Greyhound Edge.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer band */}
      <section className="bg-ink-900 py-8">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-center text-sm text-ink-300">
            Greyhound Edge provides model-generated statistical analysis for
            informational purposes only. This is <span className="font-semibold text-ink-100">not financial
            or betting advice</span>. No outcome is guaranteed. Please gamble responsibly.
          </p>
        </div>
      </section>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
