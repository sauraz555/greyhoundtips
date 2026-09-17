import { useEffect, useState } from 'react';
import { Route } from 'lucide-react';
import type { Runner } from '@/types/database';
import { toNum } from '@/lib/raceUtils';

interface Props {
  runners: Runner[];
  distanceM: number;
}

interface BoxViz {
  box: number;
  name: string;
  winPct: number;
  top4Pct: number;
  isTop: boolean;
  isFalseFav: boolean;
}

export default function SpeedMap({ runners, distanceM }: Props) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  const boxes: BoxViz[] = [...runners]
    .sort((a, b) => a.box - b.box)
    .map((r) => ({
      box: r.box,
      name: r.name,
      winPct: toNum(r.win_pct),
      top4Pct: toNum(r.top4_pct),
      isTop: toNum(r.win_pct) >= 40,
      isFalseFav: r.is_false_fav,
    }));

  if (boxes.length === 0) return null;

  // Simulate early speed positions (higher win% = better early position)
  const positions = boxes.map((b) => {
    const speedScore = b.winPct + (b.top4Pct * 0.3);
    return { ...b, speedScore };
  });

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-900">
          <Route className="h-3.5 w-3.5 text-amber-400" />
        </div>
        <h3 className="font-display text-sm tracking-wide text-ink-900">SPEED MAP PROJECTION</h3>
        <span className="ml-auto mono text-xs text-ink-400">{distanceM}m</span>
      </div>

      {/* Track visualization */}
      <div className="relative rounded-xl border border-ink-200 bg-gradient-to-b from-green-50 to-green-100/50 p-4 overflow-hidden">
        {/* Track lane markers */}
        <div className="space-y-1.5">
          {positions.map((pos, idx) => (
            <div key={pos.box} className="flex items-center gap-2 group">
              {/* Box number */}
              <div className={`mono flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-transform group-hover:scale-110 ${
                pos.isTop ? 'bg-amber-500 text-ink-900 shadow-sm shadow-amber-500/30'
                  : pos.isFalseFav ? 'bg-red-500 text-white'
                  : 'bg-ink-900 text-ink-50'
              }`}>
                {pos.box}
              </div>

              {/* Lane */}
              <div className="relative flex-1 h-7 rounded-lg bg-white/60 border border-green-200 overflow-hidden">
                {/* Lane stripes */}
                <div className="absolute inset-0 flex">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex-1 border-r border-green-200/50 last:border-r-0" />
                  ))}
                </div>

                {/* Dog position indicator */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
                  style={{ left: animated ? `${Math.min(pos.speedScore * 1.5 + 5, 85)}%` : '5%' }}
                >
                  <div className={`flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold transition-all ${
                    pos.isTop ? 'bg-amber-500 text-ink-900 shadow-sm'
                      : pos.isFalseFav ? 'bg-red-500 text-white'
                      : 'bg-ink-700 text-ink-50'
                  }`}>
                    <span className="truncate max-w-[80px]">{pos.name}</span>
                    <span className="mono opacity-70">{pos.winPct.toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Top 4 indicator */}
              <div className="flex-shrink-0 w-12 text-right">
                <div className={`mono text-xs font-bold ${pos.isTop ? 'text-amber-600' : 'text-ink-500'}`}>
                  {pos.top4Pct.toFixed(0)}%
                </div>
                <div className="text-[9px] text-ink-400 uppercase">T4</div>
              </div>
            </div>
          ))}
        </div>

        {/* Finish line indicator */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 border-t-2 border-dashed border-ink-300" />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Finish</span>
          <div className="flex-1 border-t-2 border-dashed border-ink-300" />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-xs text-ink-400">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-amber-500" />
          <span>Model pick</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-red-500" />
          <span>False favourite</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Route className="h-3 w-3" />
          <span>Projected early position</span>
        </div>
      </div>
    </div>
  );
}
