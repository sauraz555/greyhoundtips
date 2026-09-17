import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import type { Runner } from '@/types/database';
import { toNum, fmtPct } from '@/lib/raceUtils';

interface Props {
  runners: Runner[];
}

interface Bar {
  box: number;
  name: string;
  pct: number;
  isTop: boolean;
  isFalseFav: boolean;
}

export default function ProbabilityChart({ runners }: Props) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, []);

  const bars: Bar[] = [...runners]
    .sort((a, b) => toNum(b.win_pct) - toNum(a.win_pct))
    .map((r) => ({
      box: r.box,
      name: r.name,
      pct: toNum(r.win_pct),
      isTop: toNum(r.win_pct) >= 40,
      isFalseFav: r.is_false_fav,
    }));

  if (bars.length === 0) return null;

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-900">
          <BarChart3 className="h-3.5 w-3.5 text-amber-400" />
        </div>
        <h3 className="font-display text-sm tracking-wide text-ink-900">WIN PROBABILITY DISTRIBUTION</h3>
        <span className="ml-auto mono text-xs text-ink-400">{bars.length} runners</span>
      </div>

      {/* Horizontal bar chart */}
      <div className="space-y-2">
        {bars.map((bar, idx) => (
          <div key={bar.box} className="group flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 w-20 flex-shrink-0">
              <span className={`mono inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold transition-transform group-hover:scale-110 ${
                bar.isTop ? 'bg-amber-500 text-ink-900' : 'bg-ink-900 text-ink-50'
              }`}>
                {bar.box}
              </span>
              <span className="text-xs text-ink-600 truncate hidden sm:inline">{bar.name}</span>
            </div>
            <div className="flex-1 h-6 relative rounded-lg bg-ink-50 overflow-hidden border border-ink-100">
              {/* Grid lines */}
              <div className="absolute inset-0 flex">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex-1 border-r border-ink-100 last:border-r-0" />
                ))}
              </div>
              {/* Bar */}
              <div
                className={`h-full rounded-lg transition-all duration-1000 ease-out flex items-center justify-end pr-2 ${
                  bar.isTop
                    ? 'bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500'
                    : bar.isFalseFav
                      ? 'bg-gradient-to-r from-red-300 to-red-400'
                      : 'bg-gradient-to-r from-ink-300 to-ink-400'
                }`}
                style={{ width: animated ? `${Math.max(bar.pct, 2)}%` : '0%' }}
              >
                <span className={`mono text-[10px] font-bold transition-opacity duration-700 ${animated ? 'opacity-100' : 'opacity-0'} ${
                  bar.pct > 15 ? 'text-white' : 'text-transparent'
                }`}>
                  {fmtPct(bar.pct, 0)}
                </span>
              </div>
              {/* Percentage label outside bar for small bars */}
              {bar.pct <= 15 && (
                <span className={`mono absolute top-1/2 -translate-y-1/2 text-[10px] font-bold text-ink-600 transition-opacity duration-700 ${animated ? 'opacity-100' : 'opacity-0'}`}
                  style={{ left: `calc(${Math.max(bar.pct, 2)}% + 6px)` }}
                >
                  {fmtPct(bar.pct, 0)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-xs text-ink-400">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-amber-500" />
          <span>Model pick</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-red-400" />
          <span>False favourite</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-ink-400" />
          <span>Field</span>
        </div>
      </div>
    </div>
  );
}
