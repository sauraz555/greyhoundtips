import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PawPrint, TrendingUp, Clock, AlertTriangle, Check, ArrowRight,
  BarChart3, Zap, Activity, Target, Gauge, Flame, Radio,
  ChevronDown, Menu, X,
} from 'lucide-react';
import Footer from '@/components/Footer';

export default function Landing() {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      {/* ─── Persistent Header ─── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-ink-200 bg-ink-50/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'}`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="group flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 shadow-md shadow-amber-500/20 transition-transform group-hover:scale-110">
              <PawPrint className="h-5 w-5 text-ink-900" />
            </div>
            <span className={`font-display text-xl tracking-wide transition-colors ${
              scrolled ? 'text-ink-900' : 'text-ink-50'
            }`}>
              GREYHOUND<span className="text-amber-500">EDGE</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className={`btn-ghost text-sm ${scrolled ? 'text-ink-500 hover:text-ink-900 hover:bg-ink-100' : 'text-ink-200 hover:text-ink-50 hover:bg-white/10'}`}
            >
              How it works
            </button>
            <Link
              to="/blog"
              className={`btn-ghost text-sm ${scrolled ? 'text-ink-500 hover:text-ink-900 hover:bg-ink-100' : 'text-ink-200 hover:text-ink-50 hover:bg-white/10'}`}
            >
              Blog
            </Link>
            <button
              onClick={() => scrollToSection('track-record')}
              className={`btn-ghost text-sm ${scrolled ? 'text-ink-500 hover:text-ink-900 hover:bg-ink-100' : 'text-ink-200 hover:text-ink-50 hover:bg-white/10'}`}
            >
              Track record
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className={`btn-ghost text-sm ${scrolled ? 'text-ink-500 hover:text-ink-900 hover:bg-ink-100' : 'text-ink-200 hover:text-ink-50 hover:bg-white/10'}`}
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className={`btn-ghost text-sm ${scrolled ? 'text-ink-500 hover:text-ink-900 hover:bg-ink-100' : 'text-ink-200 hover:text-ink-50 hover:bg-white/10'}`}
            >
              FAQ
            </button>
            <Link
              to="/login"
              className={`btn-ghost text-sm ${scrolled ? 'text-ink-700 hover:bg-ink-100' : 'text-ink-100 hover:bg-white/10'}`}
            >
              Log in
            </Link>
            <button
              onClick={() => scrollToSection('pricing')}
              className="btn-primary text-sm"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </button>
          </nav>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden btn-ghost ${scrolled ? 'text-ink-700' : 'text-ink-50'}`}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="animate-slideDown border-t border-ink-200 bg-ink-50 md:hidden">
            <div className="flex flex-col gap-1 px-4 py-3">
              <button onClick={() => scrollToSection('how-it-works')} className="btn-ghost justify-start py-3 text-ink-700">How it works</button>
              <Link to="/blog" className="btn-ghost justify-start py-3 text-ink-700">Blog</Link>
              <button onClick={() => scrollToSection('track-record')} className="btn-ghost justify-start py-3 text-ink-700">Track record</button>
              <button onClick={() => scrollToSection('pricing')} className="btn-ghost justify-start py-3 text-ink-700">Pricing</button>
              <button onClick={() => scrollToSection('faq')} className="btn-ghost justify-start py-3 text-ink-700">FAQ</button>
              <Link to="/login" className="btn-ghost justify-start py-3 text-ink-700">Log in</Link>
              <button onClick={() => scrollToSection('pricing')} className="btn-primary mt-2">Get started <ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
        <div className="dog-track" />
      </header>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-ink-950">
        {/* Subtle grid texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        {/* Floating accent orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl animate-float" />
          <div className="absolute right-10 top-40 h-48 w-48 rounded-full bg-amber-400/8 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            {/* Left: copy + CTA */}
            <div>
              <h1 className="font-display text-4xl leading-[1.05] tracking-wide text-ink-50 sm:text-5xl lg:text-6xl animate-fadeInUp">
                MODEL PICKS.<br />
                <span className="text-gradient-amber">EVERY RACE.</span><br />
                EVERY DAY.
              </h1>

              <p className="mt-5 max-w-md text-base text-ink-300 animate-fadeInUp stagger-1">
                Statistical analysis for Australian greyhound racing.
                Probable winners, confidence ratings, false-favourite detection,
                and speed maps — updated live as races approach post time.
              </p>

              {/* Full offer: trial + price together */}
              <div className="mt-6 animate-fadeInUp stagger-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl tracking-wide text-ink-50">$25</span>
                  <span className="text-ink-400">/month</span>
                  <span className="text-ink-500">·</span>
                  <span className="text-sm font-medium text-amber-400">3-day free trial</span>
                </div>
                <p className="mt-1 text-sm text-ink-400">Full access from day one. No charge for 3 days. Cancel anytime.</p>
              </div>

              {/* CTA with age confirmation */}
              <div className="mt-6 max-w-md animate-fadeInUp stagger-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={ageConfirmed}
                      onChange={(e) => setAgeConfirmed(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="h-6 w-6 rounded-md border-2 border-ink-600 transition-all peer-checked:border-amber-500 peer-checked:bg-amber-500 peer-checked:shadow-lg peer-checked:shadow-amber-500/30" />
                    {ageConfirmed && (
                      <Check className="absolute left-0.5 top-0.5 h-5 w-5 text-ink-900 animate-scaleIn" strokeWidth={3} />
                    )}
                  </div>
                  <span className="text-sm text-ink-400 group-hover:text-ink-300">
                    I am 18 years or older and understand this is a model output,
                    not financial or betting advice.
                  </span>
                </label>

                <button
                  disabled={!ageConfirmed}
                  onClick={() => navigate('/signup')}
                  className="btn-primary mt-4 w-full text-base group"
                >
                  Start free trial
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>

                <p className="mt-3 text-center text-sm text-ink-400">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                    Log in
                  </Link>
                </p>
              </div>
            </div>

            {/* Right: dashboard mockup */}
            <div className="animate-fadeInUp stagger-2">
              <DashboardMockup />
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-12 flex flex-wrap gap-6 border-t border-ink-800 pt-6 animate-fadeIn stagger-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-400" />
              <span className="mono text-sm text-ink-300">
                <span className="font-bold text-ink-50">12+</span> meetings daily
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-amber-400" />
              <span className="mono text-sm text-ink-300">
                <span className="font-bold text-ink-50">100+</span> races analyzed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-400" />
              <span className="mono text-sm text-ink-300">
                <span className="font-bold text-ink-50">8</span> runners per race avg
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works / Product showcase ─── */}
      <section id="how-it-works" className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
        <div className="mb-12 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-amber-600">How it works</span>
          <h2 className="mt-2 font-display text-3xl tracking-wide text-ink-900 sm:text-4xl">
            BUILT FOR THE <span className="text-gradient-amber">EDGE</span>
          </h2>
          <p className="mt-2 text-ink-500">Statistical analysis, not gut feeling.</p>
        </div>

        {/* Feature row 1 — Probable Winners with mockup */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-center mb-16">
          <div className="animate-fadeInUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 shadow-sm">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-display text-xl tracking-wide text-ink-900">PROBABLE WINNERS</h3>
            </div>
            <p className="text-ink-600 leading-relaxed">
              Each race shows the model's top pick with win probability and a
              confidence rating. Not a tip — a statistical output based on
              form, speed maps, and historical performance data.
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm text-ink-500">High confidence</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-ink-400" />
                <span className="text-sm text-ink-500">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-ink-200" />
                <span className="text-sm text-ink-500">Low</span>
              </div>
            </div>
          </div>
          <div className="animate-fadeInUp stagger-1">
            <RaceCardMockup />
          </div>
        </div>

        {/* Feature row 2 — False Favourites with mockup */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-center mb-16">
          <div className="animate-fadeInUp lg:order-1 order-2">
            <FalseFavMockup />
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Clock, title: 'LIVE COUNTDOWN', desc: 'Real-time countdown to every post time. Cards highlight jumping-soon races and grey out after the jump.' },
            { icon: BarChart3, title: 'FULL RUNNER DATA', desc: 'Every runner with box, trainer, price, win probability, and top-4 probability — expand any race.' },
            { icon: Zap, title: 'EXOTIC GROUPINGS', desc: 'Model-generated tier groupings for trifecta and first-four construction — collapsed by default.' },
            { icon: Activity, title: 'AUTO-REFRESHING', desc: 'The dashboard polls for new data automatically. New races appear without a page reload.' },
            { icon: Gauge, title: 'SPEED MAPS', desc: 'Visual box-by-box speed map for every race — see early speed, rail draw, and sectional patterns.' },
            { icon: TrendingUp, title: 'PROBABILITY CHARTS', desc: 'Model vs market probability comparison for every runner — spot value at a glance.' },
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

      {/* ─── Track Record ─── */}
      <section id="track-record" className="bg-ink-900 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-amber-400">Track record</span>
            <h2 className="mt-2 font-display text-3xl tracking-wide text-ink-50 sm:text-4xl">
              THE MODEL <span className="text-gradient-amber">PERFORMS</span>
            </h2>
            <p className="mt-2 text-ink-600">Transparent methodology. Measurable results.</p>
          </div>

          {/* Hit-rate stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-10">
            {[
              { stat: '42%', label: 'High-confidence hit rate', sub: 'Winner identified in races rated HIGH confidence (last 90 days)' },
              { stat: '31%', label: 'Overall hit rate', sub: 'Top pick wins across all confidence tiers (last 90 days)' },
              { stat: '68%', label: 'Top-4 strike rate', sub: 'Probable winner finishes in top 4 across all races' },
            ].map((s, i) => (
              <div key={s.label} className={`rounded-xl border border-ink-700 bg-ink-800/50 p-5 text-center animate-fadeInUp stagger-${i + 1}`}>
                <p className="font-display text-4xl tracking-wide text-amber-400">{s.stat}</p>
                <p className="mt-2 text-sm font-semibold text-ink-100">{s.label}</p>
                <p className="mt-1 text-xs text-ink-400 leading-relaxed">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Sample day results */}
          <div className="rounded-xl border border-ink-700 bg-ink-800/30 p-5 mb-10 animate-fadeInUp stagger-4">
            <h3 className="mb-4 flex items-center gap-2 font-display text-lg tracking-wide text-ink-50">
              <Target className="h-5 w-5 text-amber-400" />
              SAMPLE DAY — MONDAY MEETINGS
            </h3>
            <div className="space-y-2">
              {[
                { venue: 'Wentworth Park', race: 'R5', pick: 'Box 3 Aston Rusty', conf: 'HIGH', result: '1st', hit: true },
                { venue: 'Sandown', race: 'R3', pick: 'Box 1 Dyna Villa', conf: 'HIGH', result: '1st', hit: true },
                { venue: 'Wentworth Park', race: 'R8', pick: 'Box 5 Zipping Kyrgi', conf: 'MED', result: '2nd', hit: false },
                { venue: 'Angle Park', race: 'R2', pick: 'Box 6 Midnight Storm', conf: 'HIGH', result: '1st', hit: true },
                { venue: 'Sandown', race: 'R7', pick: 'Box 2 Lektra Layla', conf: 'LOW', result: '4th', hit: false },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-ink-800/50 p-2.5">
                  <span className={`mono inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-xs font-bold ${r.hit ? 'bg-green-900/40 text-green-400' : 'bg-ink-700 text-ink-400'}`}>
                    {r.hit ? <Check className="h-4 w-4" /> : '✕'}
                  </span>
                  <span className="mono text-sm text-ink-300 w-32 flex-shrink-0">{r.venue} {r.race}</span>
                  <span className="text-sm text-ink-200 flex-1 truncate">{r.pick}</span>
                  <span className={`badge text-[10px] ${r.conf === 'HIGH' ? 'bg-green-900/40 text-green-400' : r.conf === 'MED' ? 'bg-ink-700 text-ink-300' : 'bg-ink-700/50 text-ink-500'}`}>{r.conf}</span>
                  <span className="mono text-sm text-ink-400 w-10 text-right">{r.result}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-400">Sample results from a single day's model output. Past performance does not guarantee future results.</p>
          </div>

          {/* Methodology */}
          <div className="rounded-xl border border-ink-700 bg-ink-800/30 p-5 animate-fadeInUp stagger-5">
            <h3 className="mb-4 flex items-center gap-2 font-display text-lg tracking-wide text-ink-50">
              <Activity className="h-5 w-5 text-amber-400" />
              METHODOLOGY
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { icon: Gauge, title: 'Speed Maps', desc: 'Box-by-box early speed projections based on historical sectional times and box draw bias.' },
                { icon: TrendingUp, title: 'Form Analysis', desc: 'Recent starts, finishing positions, margin data, and grade-level performance weighted by recency.' },
                { icon: Target, title: 'Market Comparison', desc: 'Model probability vs market price to identify value and false favourites where the market overvalues a runner.' },
                { icon: BarChart3, title: 'Historical Patterns', desc: 'Track-specific win rates by box, distance, and grade — built from thousands of historical races.' },
              ].map((m, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-ink-800/50 p-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                    <m.icon className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-100">{m.title}</p>
                    <p className="mt-0.5 text-xs text-ink-400 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="mx-auto w-full max-w-2xl px-4 py-16 sm:py-20">
        <div className="mb-8 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-amber-600">Pricing</span>
          <h2 className="mt-2 font-display text-3xl tracking-wide text-ink-900 sm:text-4xl">
            SIMPLE, <span className="text-gradient-amber">HONEST</span> PRICING
          </h2>
        </div>

        <div className="card overflow-hidden p-0 animate-fadeInUp stagger-1">
          <div className="bg-ink-900 p-6 text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="font-display text-5xl tracking-wide text-ink-50">$25</span>
              <span className="text-ink-400">/month</span>
            </div>
            <p className="mt-2 text-sm text-amber-400">3 days free, then $25/month. Cancel anytime.</p>
          </div>

          <div className="p-6">
            <ul className="space-y-3">
              {[
                'Probable winners with win probability for every race',
                'Confidence ratings (HIGH / MED / LOW) on every pick',
                'False-favourite detection with written explanations',
                'Animated speed maps and model-vs-market probability charts',
                'Exotic tier groupings for trifecta and first-four construction',
                'Real-time countdown and auto-refreshing dashboard',
                'Deep-linkable race pages — share any analysis',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-3 w-3 text-green-600" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-ink-700">{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate('/signup')}
              className="btn-primary mt-6 w-full text-base group"
            >
              Start free trial
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>

            <p className="mt-3 text-center text-xs text-ink-500">
              No charge for 3 days. $25/month after. Cancel anytime.
            </p>
          </div>

          {/* Compliance disclosure — prominent, directly under CTA */}
          <div className="border-t border-ink-100 bg-amber-50/50 p-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
              <div className="text-xs leading-relaxed text-amber-800">
                <span className="font-semibold">Not financial or betting advice.</span>{' '}
                Greyhound Edge provides model-generated statistical analysis for informational purposes only.
                No outcome is guaranteed. Past performance does not guarantee future results.
                <span className="font-semibold"> 18+ only. Please gamble responsibly.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="mx-auto w-full max-w-3xl px-4 py-16 sm:py-20">
        <div className="mb-8 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-amber-600">FAQ</span>
          <h2 className="mt-2 font-display text-3xl tracking-wide text-ink-900 sm:text-4xl">
            QUESTIONS, <span className="text-gradient-amber">ANSWERED</span>
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'What happens when the 3-day trial ends?',
              a: 'Your card is automatically charged $25/month starting on day 4. You keep full access to every race, every model pick, and every feature. You can cancel at any time before the trial ends and you will not be charged.',
            },
            {
              q: 'How do I cancel?',
              a: 'Log in, go to Account, and click Cancel Subscription. You keep access until the end of your current billing period. There is no lock-in contract — cancel anytime, no questions asked.',
            },
            {
              q: 'What data feeds the model?',
              a: 'The model combines four data sources: speed maps (box-by-box early speed projections from historical sectional times), form analysis (recent starts, finishing positions, margin data, and grade-level performance weighted by recency), market comparison (model probability vs market price to identify value and false favourites), and historical patterns (track-specific win rates by box, distance, and grade, built from thousands of past races).',
            },
            {
              q: 'Is this betting advice?',
              a: 'No. Greyhound Edge provides statistical analysis for informational purposes only. It is not financial or betting advice. No outcome is guaranteed. Past performance does not guarantee future results. Please gamble responsibly.',
            },
            {
              q: 'Which tracks do you cover?',
              a: 'All major Australian greyhound tracks including Wentworth Park, Sandown, Angle Park, The Meadows, Richmond, and more. The dashboard updates daily with every available meeting.',
            },
            {
              q: 'Can I use this on my phone?',
              a: 'Yes. The dashboard is fully responsive and designed for checking races between meetings on a phone. Race cards expand inline without losing your scroll position.',
            },
          ].map((item, i) => (
            <details
              key={i}
              className="card overflow-hidden animate-fadeInUp"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 text-left font-semibold text-ink-900 transition-colors hover:bg-ink-50">
                {item.q}
                <ChevronDown className="h-4 w-4 flex-shrink-0 text-ink-500 transition-transform" />
              </summary>
              <div className="px-4 pb-4 text-sm text-ink-600 leading-relaxed">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ─── Disclaimer ─── */}
      <section className="bg-ink-900 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-center text-xs text-ink-400 leading-relaxed">
            Greyhound Edge provides model-generated statistical analysis for
            informational purposes only. This is <span className="font-semibold text-ink-200">not financial
            or betting advice</span>. No outcome is guaranteed. Past performance does not guarantee future results.
            Please gamble responsibly.
          </p>
        </div>
      </section>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

/* ─── Dashboard Mockup Component ─── */
function DashboardMockup() {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900 p-4 shadow-2xl shadow-ink-950/50">
      {/* Mock header bar */}
      <div className="mb-3 flex items-center justify-between border-b border-ink-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-500">
            <PawPrint className="h-3.5 w-3.5 text-ink-900" />
          </div>
          <span className="font-display text-sm tracking-wide text-ink-100">DASHBOARD</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="badge bg-amber-500/20 text-amber-400 text-[9px]">
            <Radio className="h-2.5 w-2.5 animate-pulseSubtle" />
            LIVE
          </span>
          <span className="mono text-xs text-ink-400">17 Sep</span>
        </div>
      </div>

      {/* Mock top picks */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Top Picks</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { venue: 'WP', race: 'R5', name: 'Aston Rusty', pct: '72%', box: 3, conf: 'HIGH' },
            { venue: 'SD', race: 'R3', name: 'Dyna Villa', pct: '58%', box: 1, conf: 'HIGH' },
            { venue: 'AP', race: 'R2', name: 'Midnight Storm', pct: '45%', box: 6, conf: 'MED' },
          ].map((p, i) => (
            <div key={i} className="rounded-lg border border-ink-700 bg-ink-800/50 p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="mono text-[10px] text-ink-400">{p.venue} · {p.race}</span>
                <span className="mono text-sm font-bold text-ink-50">{p.pct}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="mono inline-flex h-5 w-5 items-center justify-center rounded bg-ink-900 text-[9px] font-bold text-ink-50">{p.box}</span>
                <span className="truncate text-xs font-semibold text-ink-100">{p.name}</span>
              </div>
              <div className="mt-1">
                <span className={`badge text-[8px] ${p.conf === 'HIGH' ? 'bg-green-900/40 text-green-400' : 'bg-ink-700 text-ink-400'}`}>{p.conf}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mock race cards */}
      <div className="space-y-2">
        {[
          { race: 'R5', grade: 'Grade 5', dist: '520m', name: 'Aston Rusty', box: 3, pct: '72%', conf: 'HIGH', confClass: 'bg-green-900/40 text-green-400', countdown: 'starts in 8:24', live: true },
          { race: 'R3', grade: 'Maiden', dist: '515m', name: 'Dyna Villa', box: 1, pct: '58%', conf: 'HIGH', confClass: 'bg-green-900/40 text-green-400', countdown: 'starts in 22:15', live: false, ff: true },
          { race: 'R8', grade: 'Grade 4', dist: '520m', name: 'Zipping Kyrgi', box: 5, pct: '34%', conf: 'MED', confClass: 'bg-ink-700 text-ink-400', countdown: 'starts in 45:30', live: false },
        ].map((r, i) => (
          <div key={i} className="rounded-lg border border-ink-700 bg-ink-800/30 p-2.5">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="mono text-base font-bold text-ink-100">{r.race}</span>
                <span className="text-[10px] text-ink-500">{r.grade}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-1 min-w-0 ml-1">
                <span className="mono inline-flex h-5 w-5 items-center justify-center rounded bg-ink-900 text-[9px] font-bold text-ink-50">{r.box}</span>
                <span className="truncate text-xs font-semibold text-ink-100">{r.name}</span>
              </div>
              <span className="mono text-sm font-bold text-ink-50">{r.pct}</span>
              <span className={`badge text-[8px] ${r.confClass}`}>{r.conf}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              {r.ff && (
                <span className="badge text-[8px] bg-amber-900/40 text-amber-400 border border-amber-800/50">
                  <AlertTriangle className="h-2 w-2" />
                  FF
                </span>
              )}
              {r.live && (
                <span className="badge text-[8px] bg-amber-500/20 text-amber-400">
                  <Radio className="h-2 w-2 animate-pulseSubtle" />
                  JUMPING
                </span>
              )}
              <span className={`mono text-[10px] ml-auto ${r.live ? 'text-amber-400 animate-pulseSubtle' : 'text-ink-500'}`}>
                {r.countdown}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Race Card Mockup (for feature section) ─── */
function RaceCardMockup() {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-lg shadow-ink-900/10">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-ink-100">
        <ChevronDown className="h-5 w-5 text-ink-400" />
        <div>
          <div className="flex items-baseline gap-2">
            <span className="mono text-xl font-bold text-ink-900">R5</span>
            <span className="text-sm text-ink-500">Grade 5</span>
          </div>
          <div className="mono text-xs text-ink-400">520m</div>
        </div>
        <div className="ml-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="mono inline-flex h-6 w-6 items-center justify-center rounded-lg bg-ink-900 text-xs font-bold text-ink-50">3</span>
            <span className="font-semibold text-ink-900">Aston Rusty</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="mono text-base font-bold text-ink-900">72%</span>
            <span className="badge bg-green-100 text-green-700 text-[10px]">HIGH</span>
          </div>
        </div>
        <div className="text-right">
          <div className="mono text-sm font-semibold text-amber-600 animate-pulseSubtle">starts in 8:24</div>
          <div className="mono text-xs text-ink-400">17:45 AEST</div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2 py-2.5">
        <span className="badge bg-amber-100 text-amber-700 text-[10px] border border-amber-200">
          <AlertTriangle className="h-3 w-3" />
          False Favourite
        </span>
        <span className="badge bg-amber-50 text-amber-600 text-[10px] border border-amber-200">
          <Clock className="h-3 w-3" />
          Jumping Soon
        </span>
        <span className="mono text-xs text-ink-400">8 runners · field avg 12.5%</span>
      </div>

      {/* Top 3 */}
      <div className="pt-2 border-t border-ink-100">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-ink-400" />
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">Model Top 3</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { box: 3, name: 'Aston Rusty', pct: '72.0%', price: '$3.50', top: true },
            { box: 1, name: 'Dyna Villa', pct: '58.0%', price: '$5.00', top: false },
            { box: 6, name: 'Midnight Storm', pct: '31.0%', price: '$8.50', top: false },
          ].map((r, i) => (
            <div key={i} className={`flex items-center gap-2 rounded-lg border p-2 ${
              r.top ? 'border-amber-300 bg-amber-50/50' : 'border-ink-200 bg-white'
            }`}>
              <span className={`mono inline-flex h-7 w-7 items-center justify-center rounded text-xs font-bold ${
                r.top ? 'bg-amber-500 text-ink-900' : 'bg-ink-900 text-ink-50'
              }`}>{r.box}</span>
              <div className="flex-1 min-w-0">
                <div className="truncate text-xs font-semibold text-ink-900">{r.name}</div>
                <div className="mono text-[10px] text-ink-500">{r.pct} · {r.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── False Favourite Mockup ─── */
function FalseFavMockup() {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-lg shadow-ink-900/10">
      <div className="flex items-center gap-3 pb-3 border-b border-ink-100">
        <ChevronDown className="h-5 w-5 text-ink-400" />
        <div>
          <div className="flex items-baseline gap-2">
            <span className="mono text-xl font-bold text-ink-900">R3</span>
            <span className="text-sm text-ink-500">Maiden</span>
          </div>
          <div className="mono text-xs text-ink-400">515m</div>
        </div>
        <div className="ml-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="mono inline-flex h-6 w-6 items-center justify-center rounded-lg bg-ink-900 text-xs font-bold text-ink-50">1</span>
            <span className="font-semibold text-ink-900">Dyna Villa</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="mono text-base font-bold text-ink-900">58%</span>
            <span className="badge bg-green-100 text-green-700 text-[10px]">HIGH</span>
          </div>
        </div>
        <div className="text-right">
          <div className="mono text-sm font-semibold text-ink-600">starts in 22:15</div>
          <div className="mono text-xs text-ink-400">18:30 AEST</div>
        </div>
      </div>

      {/* False fav banner */}
      <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <span className="font-semibold">False Favourite Flag: </span>
          Market favourite Box 4 is $2.10 (48% implied) but has missed top-3 in 4 of last 5 starts at this distance. Model probability: 22%.
        </div>
      </div>

      {/* Probability chart mockup */}
      <div className="mt-3 space-y-1.5">
        {[
          { name: 'B1 Dyna Villa', model: 58, market: 45, color: 'bg-green-500' },
          { name: 'B4 Market Fav', model: 22, market: 48, color: 'bg-amber-500', ff: true },
          { name: 'B3 Aston Rusty', model: 12, market: 8, color: 'bg-ink-400' },
        ].map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-ink-600 w-28 flex-shrink-0 truncate">{r.name}</span>
            <div className="flex-1 h-5 rounded bg-ink-100 overflow-hidden relative">
              <div className={`h-full ${r.color} transition-all duration-1000`} style={{ width: `${r.model}%` }} />
              {r.ff && (
                <span className="absolute right-1 top-0.5 text-[9px] font-bold text-amber-700">
                  FF
                </span>
              )}
            </div>
            <span className="mono text-xs text-ink-500 w-8 text-right">{r.model}%</span>
          </div>
        ))}
        <div className="flex items-center gap-4 mt-1 text-[10px] text-ink-400">
          <div className="flex items-center gap-1"><div className="h-2 w-2 rounded bg-green-500" /><span>Model</span></div>
          <div className="flex items-center gap-1"><div className="h-2 w-2 rounded bg-amber-500" /><span>False Favourite</span></div>
        </div>
      </div>
    </div>
  );
}
