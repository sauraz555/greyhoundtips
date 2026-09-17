import { useEffect, useState } from 'react';
import { Route, Zap, Flag, TrendingUp } from 'lucide-react';
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
  speedScore: number;
  earlySpeed: number;
  finishPos: number;
}

export default function SpeedMap({ runners, distanceM }: Props) {
  const [animated, setAnimated] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  // Animate the dogs continuously
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 50);
    return () => clearInterval(interval);
  }, []);

  const boxes: BoxViz[] = [...runners]
    .sort((a, b) => a.box - b.box)
    .map((r) => {
      const winPct = toNum(r.win_pct);
      const top4Pct = toNum(r.top4_pct);
      const speedScore = winPct + top4Pct * 0.3;
      // Simulate early speed: higher win% = faster start, but add variance
      const earlySpeed = Math.min(speedScore * 1.2 + Math.sin(tick * 0.05 + winPct) * 3, 90);
      // Finish position based on combined score
      const finishPos = Math.min(speedScore * 1.5 + 5, 88);
      return {
        box: r.box,
        name: r.name,
        winPct,
        top4Pct,
        isTop: winPct >= 40,
        isFalseFav: r.is_false_fav,
        speedScore,
        earlySpeed,
        finishPos,
      };
    });

  if (boxes.length === 0) return null;

  // Sort by speed score for ranking display
  const ranked = [...boxes].sort((a, b) => b.speedScore - a.speedScore);

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-900">
          <Route className="h-3.5 w-3.5 text-amber-400" />
        </div>
        <h3 className="font-display text-sm tracking-wide text-ink-900">SPEED MAP PROJECTION</h3>
        <span className="ml-auto mono text-xs text-ink-400">{distanceM}m</span>
      </div>

      {/* Track visualization — curved track feel */}
      <div className="relative rounded-2xl border-2 border-green-300/40 bg-gradient-to-b from-green-50 via-green-100/60 to-green-50 p-4 overflow-hidden">
        {/* Track surface texture */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(34,197,94,0.1) 20px, rgba(34,197,94,0.1) 21px)',
          }}
        />

        {/* Lanes */}
        <div className="relative space-y-1">
          {boxes.map((pos) => (
            <div key={pos.box} className="flex items-center gap-2 group">
              {/* Box number */}
              <div className={`mono flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-transform group-hover:scale-110 ${
                pos.isTop ? 'bg-amber-500 text-ink-900 shadow-sm shadow-amber-500/30'
                  : pos.isFalseFav ? 'bg-red-500 text-white'
                  : 'bg-ink-900 text-ink-50'
              }`}>
                {pos.box}
              </div>

              {/* Lane with running dog */}
              <div className="relative flex-1 h-8 rounded-lg bg-white/50 border border-green-200/60 overflow-hidden">
                {/* Lane stripes */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex-1 border-r border-green-200/40 last:border-r-0" />
                  ))}
                </div>

                {/* Starting position marker */}
                <div className="absolute left-1 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-green-400/40" />

                {/* Running dog indicator — animated position */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out flex items-center"
                  style={{ left: animated ? `${pos.finishPos}%` : '2%' }}
                >
                  <div className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold transition-all ${
                    pos.isTop ? 'bg-amber-500 text-ink-900 shadow-sm shadow-amber-500/30'
                      : pos.isFalseFav ? 'bg-red-500 text-white'
                      : 'bg-ink-700 text-ink-50'
                  }`}>
                    {/* Animated running paw */}
                    <span className="inline-block" style={{
                      animation: 'run 0.3s ease-in-out infinite',
                      display: 'inline-block',
                    }}>
                      <Zap className="h-2.5 w-2.5" />
                    </span>
                    <span className="truncate max-w-[70px]">{pos.name}</span>
                    <span className="mono opacity-70">{pos.winPct.toFixed(0)}%</span>
                  </div>
                </div>

                {/* Speed trail effect for top runner */}
                {pos.isTop && (
                  <div className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-gradient-to-r from-transparent to-amber-400/40"
                    style={{
                      left: '2%',
                      width: animated ? `${pos.finishPos - 2}%` : '0%',
                      transition: 'width 1s ease-out',
                    }}
                  />
                )}
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

        {/* Finish line */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 border-t-2 border-dashed border-ink-300" />
          <div className="flex items-center gap-1">
            <Flag className="h-3 w-3 text-ink-400" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Finish</span>
          </div>
          <div className="flex-1 border-t-2 border-dashed border-ink-300" />
        </div>
      </div>

      {/* Early speed ranking bars */}
      <div className="mt-3">
        <h4 className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
          <TrendingUp className="h-3 w-3" />
          Early Speed Ranking
        </h4>
        <div className="flex gap-1 items-end h-12">
          {ranked.map((r, idx) => (
            <div key={r.box} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full flex items-end justify-center" style={{ height: '32px' }}>
                <div
                  className={`w-full max-w-[24px] rounded-t transition-all duration-1000 ease-out ${
                    r.isTop ? 'bg-gradient-to-t from-amber-500 to-amber-400'
                      : r.isFalseFav ? 'bg-gradient-to-t from-red-500 to-red-400'
                      : 'bg-gradient-to-t from-ink-500 to-ink-400'
                  }`}
                  style={{ height: animated ? `${Math.max(r.speedScore * 0.5, 10)}%` : '0%' }}
                />
              </div>
              <span className={`mono text-[9px] font-bold ${r.isTop ? 'text-amber-600' : 'text-ink-500'}`}>
                B{r.box}
              </span>
            </div>
          ))}
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
          <Zap className="h-3 w-3" />
          <span>Projected position</span>
        </div>
      </div>
    </div>
  );
}
