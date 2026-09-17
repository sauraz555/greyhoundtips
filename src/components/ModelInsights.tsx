import { useEffect, useState } from 'react';
import {
  Brain, TrendingUp, AlertTriangle, Target, Gauge,
  Activity, BarChart3, Sparkles,
} from 'lucide-react';
import type { Race, Runner } from '@/types/database';
import { toNum } from '@/lib/raceUtils';

interface Props {
  races: Race[];
  runners: Record<string, Runner[]>;
}

interface Insight {
  label: string;
  value: string;
  detail: string;
  icon: typeof Brain;
  color: string;
  bg: string;
}

export default function ModelInsights({ races, runners }: Props) {
  const [animated, setAnimated] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  // Pulse the edge detection value
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  // Calculate insights from the data
  const totalRaces = races.length;
  const highConfCount = races.filter((r) => r.confidence === 'High').length;
  const falseFavCount = races.filter((r) => r.false_fav_flag).length;
  const avgWinnerPct = totalRaces > 0
    ? races.reduce((s, r) => s + toNum(r.probable_winner_win_pct), 0) / totalRaces
    : 0;

  // Market vs model edge: find races where we have runner data
  let edgeCount = 0;
  let totalEdge = 0;
  for (const race of races) {
    const raceRunners = runners[race.id] ?? [];
    if (raceRunners.length === 0) continue;
    const winner = raceRunners.find((r) => r.box === race.probable_winner_box);
    if (!winner) continue;
    const modelPct = toNum(winner.win_pct);
    const price = toNum(winner.price);
    if (price > 0 && modelPct > 0) {
      // Implied probability from price = 1/price * 100 (rough market probability)
      const impliedPct = (1 / price) * 100;
      const edge = modelPct - impliedPct;
      if (edge > 3) {
        edgeCount++;
        totalEdge += edge;
      }
    }
  }
  const avgEdge = edgeCount > 0 ? totalEdge / edgeCount : 0;

  // Confidence distribution
  const highPct = totalRaces > 0 ? (highConfCount / totalRaces) * 100 : 0;
  const medPct = totalRaces > 0
    ? (races.filter((r) => r.confidence === 'Medium').length / totalRaces) * 100
    : 0;
  const lowPct = totalRaces > 0
    ? (races.filter((r) => r.confidence === 'Low').length / totalRaces) * 100
    : 0;

  const insights: Insight[] = [
    {
      label: 'Model Edge',
      value: `+${avgEdge.toFixed(1)}%`,
      detail: `${edgeCount} races with edge > 3%`,
      icon: Sparkles,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
    {
      label: 'Avg Pick Strength',
      value: `${avgWinnerPct.toFixed(0)}%`,
      detail: 'Mean winner probability',
      icon: Gauge,
      color: 'text-ink-700',
      bg: 'bg-ink-100',
    },
    {
      label: 'High Confidence',
      value: `${highConfCount}`,
      detail: `${highPct.toFixed(0)}% of races`,
      icon: Target,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      label: 'False Favourites',
      value: `${falseFavCount}`,
      detail: 'Market overvalued runners',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
  ];

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900">
          <Brain className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <h3 className="font-display text-sm tracking-wide text-ink-900">MODEL INSIGHTS</h3>
          <p className="text-xs text-ink-400">Edge detection & analysis metrics</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-green-600">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulseSubtle" />
          Computing
        </span>
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {insights.map((insight, idx) => (
          <div
            key={insight.label}
            className={`rounded-xl border border-ink-100 bg-ink-50/50 p-3 transition-all hover:shadow-sm animate-fadeInUp stagger-${idx + 1} group`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${insight.bg} transition-transform group-hover:scale-110`}>
                <insight.icon className={`h-3.5 w-3.5 ${insight.color}`} />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">{insight.label}</span>
            </div>
            <p className={`mono text-xl font-bold ${insight.color} transition-transform group-hover:scale-105 origin-left`}>
              {insight.value}
            </p>
            <p className="text-[10px] text-ink-400 mt-0.5">{insight.detail}</p>
          </div>
        ))}
      </div>

      {/* Confidence distribution bar */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
            <BarChart3 className="h-3 w-3" />
            Confidence Distribution
          </span>
          <span className="mono text-[10px] text-ink-400">{totalRaces} races</span>
        </div>
        <div className="flex h-6 w-full overflow-hidden rounded-lg bg-ink-100">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-1000 ease-out flex items-center justify-center"
            style={{ width: animated ? `${highPct}%` : '0%' }}
          >
            {highPct > 15 && <span className="mono text-[10px] font-bold text-white">{highPct.toFixed(0)}%</span>}
          </div>
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-1000 ease-out flex items-center justify-center"
            style={{ width: animated ? `${medPct}%` : '0%' }}
          >
            {medPct > 15 && <span className="mono text-[10px] font-bold text-ink-900">{medPct.toFixed(0)}%</span>}
          </div>
          <div
            className="h-full bg-gradient-to-r from-ink-300 to-ink-400 transition-all duration-1000 ease-out flex items-center justify-center"
            style={{ width: animated ? `${lowPct}%` : '0%' }}
          >
            {lowPct > 15 && <span className="mono text-[10px] font-bold text-white">{lowPct.toFixed(0)}%</span>}
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-4 text-[10px] text-ink-400">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded bg-green-500" />
            <span>High ({highConfCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded bg-amber-500" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded bg-ink-400" />
            <span>Low</span>
          </div>
        </div>
      </div>

      {/* Live edge pulse */}
      <div className="mt-3 flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2 border border-ink-100">
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs text-ink-500">Edge detection engine</span>
        </div>
        <div className="flex items-center gap-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-amber-500 transition-all duration-300"
              style={{
                height: `${6 + Math.abs(Math.sin(tick * 0.3 + i * 0.5)) * 10}px`,
                opacity: 0.3 + (i / 6) * 0.7,
              }}
            />
          ))}
          <span className="mono ml-1 text-xs font-bold text-ink-700">
            {edgeCount > 0 ? `${edgeCount} edges found` : 'scanning...'}
          </span>
        </div>
      </div>
    </div>
  );
}
