import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown, AlertTriangle, ExternalLink, Clock, Layers, Zap,
  TrendingUp, Flame, Gauge, Brain, Target, ArrowRight,
} from 'lucide-react';
import type { Race, Runner } from '@/types/database';
import {
  getRaceStatus, formatCountdown, formatPostTime,
  confidenceColor, confidenceBadge, toNum, fmtPct, fmtPrice,
  type RaceStatus,
} from '@/lib/raceUtils';
import RunnerTable from './RunnerTable';
import ProbabilityChart from './ProbabilityChart';
import SpeedMap from './SpeedMap';

interface Props {
  race: Race;
  runners: Runner[];
  defaultExpanded?: boolean;
}

export default function RaceCard({ race, runners, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showExotics, setShowExotics] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const status: RaceStatus = getRaceStatus(race.start_time, now);
  const countdown = formatCountdown(race.start_time, now);
  const postTime = formatPostTime(race.start_time);
  const confBadge = confidenceBadge(race.confidence);
  const isFinished = status === 'finished';
  const isInProgress = status === 'in-progress';
  const isStartingSoon = status === 'starting-soon';

  const cardOpacity = isFinished ? 'opacity-50' : '';
  const borderClass = confidenceColor(race.confidence);
  const winnerPct = toNum(race.probable_winner_win_pct);

  const sortedRunners = [...runners].sort((a, b) => toNum(b.win_pct) - toNum(a.win_pct));
  const top3 = sortedRunners.slice(0, 3);
  const fieldAvg = runners.length > 0
    ? runners.reduce((s, r) => s + toNum(r.win_pct), 0) / runners.length
    : 0;

  const exoticTiers = [
    { label: 'Key Runners (Top 4 %)', runners: sortedRunners.filter((r) => toNum(r.top4_pct) >= 60) },
    { label: 'Value Options (Win % 10-25)', runners: sortedRunners.filter((r) => {
      const w = toNum(r.win_pct);
      return w >= 10 && w <= 25;
    }) },
    { label: 'Trifecta Combinations', runners: sortedRunners.slice(0, 4) },
  ];

  const statusGlow = isStartingSoon
    ? 'shadow-lg shadow-amber-500/10 ring-1 ring-amber-300/40'
    : isInProgress
      ? 'shadow-lg shadow-green-500/10 ring-1 ring-green-300/40'
      : '';

  return (
    <div
      className={`card border-l-4 ${borderClass} ${cardOpacity} ${statusGlow} card-hover transition-all duration-300`}
    >
      {/* Compact header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        {/* Expand indicator */}
        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-ink-100 transition-all ${expanded ? 'bg-amber-100' : ''}`}>
          <ChevronDown className={`h-5 w-5 text-ink-500 transition-transform duration-300 ${expanded ? 'rotate-0' : '-rotate-90'}`} />
        </div>

        {/* Race number badge */}
        <div className="flex-shrink-0">
          <div className="flex items-baseline gap-2">
            <span className="mono text-2xl font-bold text-ink-900">R{race.race_number}</span>
            <span className="text-sm text-ink-500">{race.grade}</span>
          </div>
          <div className="mono text-xs text-ink-400">{race.distance_m}m</div>
        </div>

        {/* Probable winner */}
        <div className="ml-2 flex-1 min-w-0">
          {race.probable_winner_name && (
            <div className="flex items-center gap-2">
              <span className="mono inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-ink-900 text-xs font-bold text-ink-50 shadow-sm">
                {race.probable_winner_box}
              </span>
              <span className="truncate font-semibold text-ink-900">{race.probable_winner_name}</span>
              {race.probable_winner_win_pct != null && (
                <span className="mono text-sm font-bold text-amber-600 whitespace-nowrap">
                  {fmtPct(race.probable_winner_win_pct)}
                </span>
              )}
            </div>
          )}
          {race.probable_winner_win_pct != null && (
            <div className="mt-1.5 h-2 w-full max-w-[220px] overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 transition-all duration-1000 ease-out"
                style={{ width: `${winnerPct}%` }}
              />
            </div>
          )}
        </div>

        {/* Confidence badge */}
        {race.confidence && (
          <span className={`badge hidden flex-shrink-0 sm:inline-flex ${confBadge.classes}`}>
            {confBadge.label}
          </span>
        )}

        {/* Timer */}
        <div className="flex-shrink-0 text-right">
          <div
            className={`mono text-sm font-semibold transition-colors ${
              isStartingSoon
                ? 'text-amber-600 animate-pulseSubtle'
                : isInProgress
                  ? 'text-green-600'
                  : isFinished
                    ? 'text-ink-400'
                    : 'text-ink-600'
            }`}
          >
            {countdown}
          </div>
          <div className="mono text-xs text-ink-400">{postTime} AEST</div>
        </div>
      </button>

      {/* Tags row */}
      <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
        {race.false_fav_flag && (
          <span className="badge inline-flex items-center gap-1 bg-amber-100 text-amber-700 animate-scaleIn border border-amber-200">
            <AlertTriangle className="h-3 w-3" />
            False Favourite
          </span>
        )}
        {isStartingSoon && (
          <span className="badge bg-amber-50 text-amber-600 animate-scaleIn border border-amber-200">
            <Clock className="h-3 w-3" />
            Jumping Soon
          </span>
        )}
        {isInProgress && (
          <span className="badge bg-green-50 text-green-600 animate-scaleIn border border-green-200">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulseSubtle" />
            In Progress
          </span>
        )}
        {isFinished && (
          <span className="badge bg-ink-100 text-ink-400">Completed</span>
        )}
        {race.confidence && (
          <span className={`badge sm:hidden ${confBadge.classes}`}>{confBadge.label}</span>
        )}
        {/* Runner count + field avg */}
        <div className="flex items-center gap-2 text-xs text-ink-400">
          <span className="mono">{runners.length} runners</span>
          <span className="text-ink-300">·</span>
          <span className="mono">field avg {fieldAvg.toFixed(1)}%</span>
        </div>
        <Link
          to={`/race/${race.id}`}
          className="btn-ghost ml-auto text-xs group"
        >
          <ExternalLink className="h-3 w-3 transition-transform group-hover:scale-110" />
          Open
        </Link>
      </div>

      {/* Expanded analysis panel */}
      {expanded && (
        <div className="animate-slideDown border-t border-ink-100">
          {/* False fav reason banner */}
          {race.false_fav_flag && race.false_fav_reason && (
            <div className="mx-4 mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 animate-fadeIn">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <span className="font-semibold">False Favourite Flag: </span>
                {race.false_fav_reason}
              </div>
            </div>
          )}

          {/* Top 3 model picks — card style */}
          <div className="px-4 pt-4">
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
              <Target className="h-3.5 w-3.5" />
              Model Top 3
            </h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {top3.map((r, idx) => (
                <div
                  key={r.id}
                  className={`flex items-center gap-2.5 rounded-xl border p-3 transition-all hover:shadow-md animate-fadeInUp stagger-${idx + 1} ${
                    idx === 0
                      ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-amber-50/30 shadow-sm'
                      : 'border-ink-200 bg-white'
                  }`}
                >
                  <span className={`mono inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-transform hover:scale-110 ${
                    idx === 0 ? 'bg-amber-500 text-ink-900 shadow-md shadow-amber-500/20' : 'bg-ink-900 text-ink-50'
                  }`}>
                    {r.box}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-semibold text-ink-900">{r.name}</div>
                    <div className="mono text-xs text-ink-500 mt-0.5">
                      {fmtPct(r.win_pct)} · {fmtPrice(r.price)}
                    </div>
                  </div>
                  {idx === 0 && (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-md">
                      <Flame className="h-3 w-3" />
                      PICK
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Probability distribution chart + Speed map */}
          <div className="px-4 pt-4 space-y-3">
            <ProbabilityChart runners={runners} />
            <SpeedMap runners={runners} distanceM={race.distance_m} />
          </div>

          {/* Full runner table */}
          <div className="px-4 pt-4">
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
              <Gauge className="h-3.5 w-3.5" />
              Full Runner Table
            </h4>
            <RunnerTable runners={runners} />
          </div>

          {/* Exotic suggestions — collapsed by default */}
          <div className="mx-4 mb-4 border-t border-ink-100 pt-3">
            <button
              onClick={() => setShowExotics(!showExotics)}
              className="group flex items-center gap-2 text-sm font-semibold text-ink-600 transition-colors hover:text-ink-900"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-100 group-hover:bg-amber-100 transition-colors">
                <Layers className="h-4 w-4" />
              </div>
              Exotic Bet Suggestions
              {showExotics ? <ChevronDown className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </button>
            {showExotics && (
              <div className="animate-slideDown mt-3 space-y-3">
                {exoticTiers.map((tier, tIdx) => (
                  <div key={tier.label} className={`rounded-xl bg-ink-50 p-3 border border-ink-100 animate-fadeInUp stagger-${tIdx + 1}`}>
                    <h5 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
                      <Zap className="h-3 w-3 text-amber-500" />
                      {tier.label}
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {tier.runners.map((r) => (
                        <span
                          key={r.id}
                          className="mono inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs transition-all hover:border-amber-300 hover:shadow-sm hover:bg-amber-50/50"
                        >
                          <span className="font-bold text-ink-900">B{r.box}</span>
                          <span className="text-ink-600">{r.name}</span>
                          <span className="text-ink-400 border-l border-ink-200 pl-1">
                            {tier.label.includes('Top 4') ? fmtPct(r.top4_pct, 0) : fmtPct(r.win_pct, 0)}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <p className="text-xs italic text-ink-400">
                  Model-generated groupings for exotic bet construction. Not betting advice.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
