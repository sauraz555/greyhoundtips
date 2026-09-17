import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, AlertTriangle, ExternalLink, Clock, Layers, Zap, TrendingUp } from 'lucide-react';
import type { Race, Runner } from '@/types/database';
import {
  getRaceStatus,
  formatCountdown,
  formatPostTime,
  confidenceColor,
  confidenceBadge,
  toNum,
  fmtPct,
  fmtPrice,
  type RaceStatus,
} from '@/lib/raceUtils';
import RunnerTable from './RunnerTable';

interface Props {
  race: Race;
  runners: Runner[];
  defaultExpanded?: boolean;
}

export default function RaceCard({ race, runners, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showExotics, setShowExotics] = useState(false);
  const [now, setNow] = useState(new Date());
  const [barAnimated, setBarAnimated] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setBarAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const status: RaceStatus = getRaceStatus(race.start_time, now);
  const countdown = formatCountdown(race.start_time, now);
  const postTime = formatPostTime(race.start_time);
  const confBadge = confidenceBadge(race.confidence);
  const isFinished = status === 'finished';
  const isInProgress = status === 'in-progress';
  const isStartingSoon = status === 'starting-soon';

  const cardOpacity = isFinished ? 'opacity-40' : '';
  const borderClass = confidenceColor(race.confidence);
  const winnerPct = toNum(race.probable_winner_win_pct);

  const sortedRunners = [...runners].sort((a, b) => toNum(b.win_pct) - toNum(a.win_pct));
  const top3 = sortedRunners.slice(0, 3);

  const exoticTiers = [
    { label: 'Key Runners (Top 4 %)', runners: sortedRunners.filter((r) => toNum(r.top4_pct) >= 60) },
    { label: 'Value Options (Win % 10-25)', runners: sortedRunners.filter((r) => {
      const w = toNum(r.win_pct);
      return w >= 10 && w <= 25;
    }) },
    { label: 'Trifecta Combinations', runners: sortedRunners.slice(0, 4) },
  ];

  const statusGlow = isStartingSoon
    ? 'shadow-lg shadow-amber-500/10 ring-1 ring-amber-300/30'
    : isInProgress
      ? 'shadow-lg shadow-green-500/10 ring-1 ring-green-300/30'
      : '';

  return (
    <div
      className={`card border-l-4 ${borderClass} ${cardOpacity} ${statusGlow} card-hover transition-all duration-300`}
    >
      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div className="flex-shrink-0 transition-transform duration-200" style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(0deg)' }}>
          {expanded ? (
            <ChevronDown className="h-5 w-5 text-ink-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-ink-400" />
          )}
        </div>

        {/* Race number + grade */}
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
              <span className="mono inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-ink-900 text-xs font-bold text-ink-50 transition-transform hover:scale-110">
                {race.probable_winner_box}
              </span>
              <span className="truncate font-semibold text-ink-900">{race.probable_winner_name}</span>
              {race.probable_winner_win_pct != null && (
                <span className="mono text-sm font-bold text-amber-600">
                  {fmtPct(race.probable_winner_win_pct)}
                </span>
              )}
            </div>
          )}
          {race.probable_winner_win_pct != null && (
            <div className="mt-1 h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700 ease-out"
                style={{ width: barAnimated ? `${winnerPct}%` : '0%' }}
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
          <span className="badge inline-flex items-center gap-1 bg-amber-100 text-amber-700 animate-scaleIn">
            <AlertTriangle className="h-3 w-3" />
            False Favourite
          </span>
        )}
        {isStartingSoon && (
          <span className="badge bg-amber-50 text-amber-600 animate-scaleIn">
            <Clock className="h-3 w-3" />
            Jumping Soon
          </span>
        )}
        {isInProgress && (
          <span className="badge bg-green-50 text-green-600 animate-scaleIn">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulseSubtle" />
            In Progress
          </span>
        )}
        {isFinished && (
          <span className="badge bg-ink-100 text-ink-400">
            Completed
          </span>
        )}
        <Link
          to={`/race/${race.id}`}
          className="btn-ghost ml-auto text-xs group"
        >
          <ExternalLink className="h-3 w-3 transition-transform group-hover:scale-110" />
          Open
        </Link>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="animate-slideDown border-t border-ink-100 px-4 py-4">
          {/* False fav reason */}
          {race.false_fav_flag && race.false_fav_reason && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 animate-fadeIn border border-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>
                <span className="font-semibold">False Favourite Flag: </span>
                {race.false_fav_reason}
              </span>
            </div>
          )}

          {/* Top 3 quick view */}
          <div className="mb-4">
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
              <TrendingUp className="h-3.5 w-3.5" />
              Model Top 3
            </h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {top3.map((r, idx) => (
                <div
                  key={r.id}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 transition-all hover:shadow-sm animate-fadeInUp stagger-${idx + 1} ${
                    idx === 0 ? 'border-amber-300 bg-amber-50 shadow-sm' : 'border-ink-200 bg-ink-50'
                  }`}
                >
                  <span className="mono inline-flex h-6 w-6 items-center justify-center rounded bg-ink-900 text-xs font-bold text-ink-50">
                    {r.box}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium text-ink-900">{r.name}</div>
                    <div className="mono text-xs text-ink-500">
                      {fmtPct(r.win_pct)} · {fmtPrice(r.price)}
                    </div>
                  </div>
                  {idx === 0 && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">PICK</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Full runner table */}
          <div className="mb-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Full Runner Table
            </h4>
            <RunnerTable runners={runners} />
          </div>

          {/* Exotic suggestions — collapsed by default */}
          <div className="border-t border-ink-100 pt-3">
            <button
              onClick={() => setShowExotics(!showExotics)}
              className="group flex items-center gap-2 text-sm font-semibold text-ink-600 transition-colors hover:text-ink-900"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-100 group-hover:bg-amber-100 transition-colors">
                <Layers className="h-4 w-4" />
              </div>
              Exotic Bet Suggestions
              {showExotics ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {showExotics && (
              <div className="animate-slideDown mt-3 space-y-3">
                {exoticTiers.map((tier, tIdx) => (
                  <div key={tier.label} className={`rounded-lg bg-ink-50 p-3 border border-ink-100 animate-fadeInUp stagger-${tIdx + 1}`}>
                    <h5 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
                      <Zap className="h-3 w-3 text-amber-500" />
                      {tier.label}
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {tier.runners.map((r) => (
                        <span
                          key={r.id}
                          className="mono inline-flex items-center gap-1 rounded-md border border-ink-200 bg-white px-2 py-1 text-xs transition-all hover:border-amber-300 hover:shadow-sm"
                        >
                          <span className="font-bold text-ink-900">B{r.box}</span>
                          <span className="text-ink-600">{r.name}</span>
                          <span className="text-ink-400">
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
