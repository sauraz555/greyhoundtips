import { Link } from 'react-router-dom';
import { Phone, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-ink-900 text-ink-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="text-sm text-ink-300">
            <p className="font-semibold text-ink-100">Greyhound Edge</p>
            <p className="mt-1">Model-generated race analysis. Not financial or betting advice.</p>
          </div>
          <div className="flex flex-col items-center gap-3 sm:items-end">
            <Link to="/blog" className="text-sm font-semibold text-ink-200 hover:text-amber-300 transition-colors">
              Engineering Blog
            </Link>
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
            <p className="text-xs text-ink-400">
              Free, confidential 24/7 support. 18+ only.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
