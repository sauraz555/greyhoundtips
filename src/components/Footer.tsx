import { Link } from 'react-router-dom';
import { Phone, ExternalLink, PawPrint } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-ink-900 text-ink-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Brand + description */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
                <PawPrint className="h-4 w-4 text-ink-900" />
              </div>
              <span className="font-display text-lg tracking-wide text-ink-50">
                GREYHOUND<span className="text-amber-500">EDGE</span>
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-400">
              Model-generated greyhound racing tips, predictions, and form analysis for
              Australian tracks. Probable winners, confidence ratings, false-favourite
              detection, and speed maps — updated daily. Not financial or betting advice.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">Greyhound Racing</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/" className="text-ink-300 transition-colors hover:text-amber-300">
                  Racing Tips & Predictions
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-ink-300 transition-colors hover:text-amber-300">
                  Racing Analysis Blog
                </Link>
              </li>
              <li>
                <Link to="/blog/evolution-australian-greyhound-racing" className="text-ink-300 transition-colors hover:text-amber-300">
                  History of Australian Racing
                </Link>
              </li>
              <li>
                <Link to="/blog/split-speeds-sectional-timing-greyhound-form-analysis" className="text-ink-300 transition-colors hover:text-amber-300">
                  Sectional Timing Guide
                </Link>
              </li>
              <li>
                <Link to="/blog/anatomy-australian-greyhound-tracks-geometry-turns-box-dynamics" className="text-ink-300 transition-colors hover:text-amber-300">
                  Track Architecture Guide
                </Link>
              </li>
              <li>
                <Link to="/blog/leading-sire-lines-bloodlines-australian-greyhound-racing" className="text-ink-300 transition-colors hover:text-amber-300">
                  Sire Lines & Bloodlines
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">Resources</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/blog/fernando-bale-benchmark-australian-greyhound-racing" className="text-ink-300 transition-colors hover:text-amber-300">
                  Fernando Bale Profile
                </Link>
              </li>
              <li>
                <Link to="/blog/tommy-shelby-peoples-dog-sire-powerhouse" className="text-ink-300 transition-colors hover:text-amber-300">
                  Tommy Shelby Profile
                </Link>
              </li>
              <li>
                <Link to="/blog/predictive-modelling-australian-greyhound-racing" className="text-ink-300 transition-colors hover:text-amber-300">
                  Predictive Modelling
                </Link>
              </li>
              <li>
                <Link to="/blog/ai-machine-learning-australian-greyhound-racing" className="text-ink-300 transition-colors hover:text-amber-300">
                  AI & Machine Learning
                </Link>
              </li>
              <li>
                <Link to="/blog/modeling-track-surface-degradation-harrow-moisture-velocity" className="text-ink-300 transition-colors hover:text-amber-300">
                  Track Surface Analysis
                </Link>
              </li>
              <li>
                <Link to="/blog/machine-learning-trainer-form-dynamics-nested-group-variances" className="text-ink-300 transition-colors hover:text-amber-300">
                  Trainer Form Analytics
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center gap-4 border-t border-ink-800 pt-6 sm:flex-row sm:justify-between">
          <div className="text-xs text-ink-500">
            <p>&copy; {new Date().getFullYear()} Greyhound Edge. Australian greyhound racing predictions and form analysis.</p>
          </div>
          <div className="flex flex-col items-center gap-3 sm:items-end">
            <a
              href="https://www.gamblinghelponline.org.au/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300 transition-colors hover:bg-amber-500/20"
            >
              <Phone className="h-4 w-4" />
              Gambling Help Online — 1800 858 858
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>
            <p className="text-xs text-ink-500">
              Free, confidential 24/7 support. 18+ only. Gamble responsibly.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
