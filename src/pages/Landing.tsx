import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PawPrint, TrendingUp, Clock, AlertTriangle, Check, ArrowRight, BarChart3, Zap, Eye, Activity, Target, Gauge } from 'lucide-react';
import Footer from '@/components/Footer';

const HERO_IMG = 'https://images.pexels.com/photos/28457519/pexels-photo-28457519.jpeg?auto=compress&cs=tinysrgb&w=1600';
const SECTION_IMG = 'https://images.pexels.com/photos/13957885/pexels-photo-13957885.jpeg?auto=compress&cs=tinysrgb&w=1200';
const SECTION_IMG2 = 'https://images.pexels.com/photos/29857098/pexels-photo-29857098.jpeg?auto=compress&cs=tinysrgb&w=1200';

export default function Landing() {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      {/* Hero with greyhound image */}
      <section className="relative min-h-[600px] overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={HERO_IMG}
            alt="Greyhound in motion"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>

        {/* Floating accent orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl animate-float" />
          <div className="absolute right-10 top-40 h-48 w-48 rounded-full bg-amber-400/8 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="flex items-center gap-2 mb-8 animate-fadeIn">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 shadow-lg shadow-amber-500/30">
              <PawPrint className="h-6 w-6 text-ink-900" />
            </div>
            <span className="font-display text-2xl tracking-wide text-ink-50">
              GREYHOUND<span className="text-amber-500">EDGE</span>
            </span>
          </div>

          <h1 className="font-display text-5xl leading-[1.05] tracking-wide text-ink-50 sm:text-7xl lg:text-8xl animate-fadeInUp">
            MODEL PICKS.<br />
            <span className="text-gradient-amber">EVERY RACE.</span><br />
            EVERY DAY.
          </h1>

          <p className="mt-6 max-w-xl text-lg text-ink-200 animate-fadeInUp stagger-1">
            Free daily model-generated analysis for Australian greyhound racing.
            Probable winners, confidence ratings, and false-favourite detection —
            updated live as races approach post time.
          </p>

          {/* Stats strip */}
          <div className="mt-8 flex flex-wrap gap-6 animate-fadeInUp stagger-2">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-400" />
              <span className="mono text-sm text-ink-200">
                <span className="font-bold text-ink-50">12+</span> meetings daily
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-amber-400" />
              <span className="mono text-sm text-ink-200">
                <span className="font-bold text-ink-50">100+</span> races analyzed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-400" />
              <span className="mono text-sm text-ink-200">
                <span className="font-bold text-ink-50">Variable</span> field sizes
              </span>
            </div>
          </div>

          {/* CTA with age confirmation */}
          <div className="mt-10 max-w-md animate-fadeInUp stagger-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-6 w-6 rounded-md border-2 border-ink-400 transition-all peer-checked:border-amber-500 peer-checked:bg-amber-500 peer-checked:shadow-lg peer-checked:shadow-amber-500/30" />
                {ageConfirmed && (
                  <Check className="absolute left-0.5 top-0.5 h-5 w-5 text-ink-900 animate-scaleIn" strokeWidth={3} />
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
              className="btn-primary mt-4 w-full text-base group"
            >
              Sign up free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>

            <p className="mt-3 text-center text-sm text-ink-300">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom fade into page */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-ink-50" />
      </section>

      {/* Features with images */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl tracking-wide text-ink-900 sm:text-4xl">
            BUILT FOR THE <span className="text-gradient-amber">EDGE</span>
          </h2>
          <p className="mt-2 text-ink-500">Statistical analysis, not gut feeling.</p>
        </div>

        {/* Feature row 1 — with image */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-center mb-16">
          <div className="animate-fadeInUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 shadow-sm">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-display text-xl tracking-wide text-ink-900">PROBABLE WINNERS</h3>
            </div>
            <p className="text-ink-600 leading-relaxed">
              Each race shows the model's top pick with win probability and a
              visual confidence bar. Not a tip — a statistical output based on
              form, speed maps, and historical performance data.
            </p>
            <div className="mt-4 flex gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm text-ink-500">High confidence</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-sm text-ink-500">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-ink-300" />
                <span className="text-sm text-ink-500">Low</span>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl shadow-lg animate-fadeInUp stagger-1">
            <img
              src={SECTION_IMG}
              alt="Greyhound portrait"
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/40 to-transparent" />
          </div>
        </div>

        {/* Feature row 2 — reversed */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-center mb-16">
          <div className="relative overflow-hidden rounded-2xl shadow-lg animate-fadeInUp lg:order-1 order-2">
            <img
              src={SECTION_IMG2}
              alt="Greyhound running"
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/40 to-transparent" />
          </div>
          <div className="animate-fadeInUp stagger-1 lg:order-2 order-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 shadow-sm">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-display text-xl tracking-wide text-ink-900">FALSE FAVOURITES</h3>
            </div>
            <p className="text-ink-600 leading-relaxed">
              The model flags short-priced favourites whose form doesn't stack up —
              with a written explanation of exactly why. Price says 60% win chance,
              but the stats say otherwise. See through the market.
            </p>
          </div>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: Clock, title: 'LIVE COUNTDOWN', desc: 'Real-time countdown to every post time. Cards highlight jumping-soon races and grey out after the jump.' },
            { icon: BarChart3, title: 'FULL RUNNER DATA', desc: 'Every runner with box, trainer, price, win probability, and top-4 probability — expand any race.' },
            { icon: Zap, title: 'EXOTIC GROUPINGS', desc: 'Model-generated tier groupings for trifecta and first-four construction — collapsed by default.' },
            { icon: Eye, title: 'SHAREABLE LINKS', desc: 'Every race has its own URL — share a deep link to a specific race analysis with anyone.' },
            { icon: Activity, title: 'AUTO-REFRESHING', desc: 'The dashboard polls for new data automatically. New races appear without a page reload.' },
            { icon: Gauge, title: 'CONFIDENCE TIERS', desc: 'Color-coded confidence ratings on every race card — know which picks the model trusts most.' },
          ].map((f, i) => (
            <div
              key={f.title}
              className={`card card-hover p-5 animate-fadeInUp stagger-${i + 1}`}
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 shadow-sm">
                <f.icon className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="font-display text-base tracking-wide text-ink-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
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
