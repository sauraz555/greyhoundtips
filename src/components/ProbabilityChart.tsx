import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, ArrowRight } from 'lucide-react';
import type { Runner } from '@/types/database';
import { toNum, fmtPct, fmtPrice } from '@/lib/raceUtils';

interface Props {
  runners: Runner[];
}

interface Bar {
  box: number;
  name: string;
  pct: number;
  price: number;
  impliedPct: number;
  edge: number;
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
    .map((r) => {
      const pct = toNum(r.win_pct);
      const price = toNum(r.price);
      const impliedPct = price > 0 ? (1 / price) * 100 : 0;
      return {
        box: r.box,
        name: r.name,
        pct,
        price,
        impliedPct,
        edge: pct - impliedPct,
        isTop: pct >= 40,
        isFalseFav: r.is_false_fav,
      };
    });

  if (bars.length === 0) return null;

  const maxPct = Math.max(...bars.map((b) => Math.max(b.pct, b.impliedPct)), 10);

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-900">
          <BarChart3 className="h-3.5 w-3.5 text-amber-400" />
        </div>
        <h3 className="font-display text-sm tracking-wide text-ink-900">WIN PROBABILITY DISTRIBUTION</h3>
        <span className="ml-auto mono text-xs text-ink-400">{bars.length} runners</span>
      </div>

      {/* Chart */}
      <div className="space-y-2.5">
        {bars.map((bar) => (
          <div key={bar.box} className="group">
            <div className="flex items-center gap-2.5 mb-1">
              <span className={`mono inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold transition-transform group-hover:scale-110 ${
                bar.isTop ? 'bg-amber-500 text-ink-900' : 'bg-ink-900 text-ink-50'
              }`}>
                {bar.box}
              </span>
              <span className="text-xs text-ink-600 truncate flex-1">{bar.name}</span>
              {/* Edge indicator */}
              {Math.abs(bar.edge) > 2 && (
                <span className={`mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  bar.edge > 0 ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'
                }`}>
                  {bar.edge > 0 ? '+' : ''}{bar.edge.toFixed(1)}%
                </span>
              )}
            </div>
            {/* Dual bar: model vs market */}
            <div className="flex items-center gap-2 ml-8">
              <div className="flex-1 h-5 relative rounded-lg bg-ink-50 overflow-hidden border border-ink-100">
                {/* Grid */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex-1 border-r border-ink-100/60 last:border-r-0" />
                  ))}
                </div>
                {/* Model bar */}
                <div
                  className={`h-full rounded-lg transition-all duration-1000 ease-out flex items-center justify-end pr-2 ${
                    bar.isTop
                      ? 'bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500'
                      : bar.isFalseFav
                        ? 'bg-gradient-to-r from-red-300 to-red-400'
                        : 'bg-gradient-to-r from-ink-300 to-ink-400'
                  }`}
                  style={{ width: animated ? `${Math.max((bar.pct / maxPct) * 100, 2)}%` : '0%' }}
                >
                  <span className={`mono text-[10px] font-bold transition-opacity duration-700 ${animated ? 'opacity-100' : 'opacity-0'} ${
                    (bar.pct / maxPct) * 100 > 25 ? 'text-white' : 'text-transparent'
                  }`}>
                    {fmtPct(bar.pct, 0)}
                  </span>
                </div>
                {/* Market implied bar (outline) */}
                <div
                  className="absolute top-0 h-full border-2 border-dashed border-ink-400/40 rounded-lg pointer-events-none transition-all duration-1000 ease-out"
                  style={{ width: animated ? `${Math.max((bar.impliedPct / maxPct) * 100, 2)}%` : '0%' }}
                />
              </div>
              <span className="mono text-[10px] text-ink-400 w-10 text-right">{fmtPrice(bar.price)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-xs text-ink-400 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-amber-500" />
          <span>Model probability</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded border-2 border-dashed border-ink-400/60" />
          <span>Market implied</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="mono text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">+%</span>
          <span>Model edge</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-red-400" />
          <span>False favourite</span>
        </div>
      </div>
    </div>
  );
}
