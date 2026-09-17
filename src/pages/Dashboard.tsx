import { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown, ChevronRight, AlertCircle, Filter, RefreshCw, MapPin, Radio,
  Activity, AlertTriangle, TrendingUp, Scan, Search, ArrowUpDown, Flame,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Meeting, Race, Runner } from '@/types/database';
import { getRaceStatus, toNum, getAESTDate, fmtPct } from '@/lib/raceUtils';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import RaceCard from '@/components/RaceCard';

type FilterType = 'all' | 'soon' | 'falsefav';
type SortType = 'time' | 'edge';
const REFRESH_INTERVAL = 60_000;

interface MeetingGroup {
  meeting: Meeting;
  races: Race[];
}

function ScanningLoader() {
  const [scanText, setScanText] = useState('');
  const messages = [
    'Connecting to race data feed...',
    'Scanning today\'s meetings...',
    'Ingesting form data for 8 tracks...',
    'Running probability model...',
    'Calculating speed maps...',
    'Detecting false favourites patterns...',
    'Generating confidence scores...',
    'Compiling race analysis...',
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setScanText(messages[i % messages.length]);
      i++;
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative">
        <div className="h-16 w-16 animate-spin rounded-full border-2 border-ink-200 border-t-amber-500" />
      </div>
      <div className="text-center">
        <p className="font-display text-sm tracking-wide text-ink-700">ANALYZING RACE DATA</p>
        <p className="mono mt-1 text-xs text-amber-600 animate-pulseSubtle">{scanText}</p>
      </div>
      <div className="w-48 h-1 rounded-full bg-ink-100 overflow-hidden">
        <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-ink-100 animate-pulse" />
        <div className="space-y-1.5">
          <div className="h-6 w-20 rounded bg-ink-100 animate-pulse" />
          <div className="h-3 w-16 rounded bg-ink-100 animate-pulse" />
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-48 rounded bg-ink-100 animate-pulse" />
          <div className="h-2 w-32 rounded-full bg-ink-100 animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <div className="h-4 w-24 rounded bg-ink-100 animate-pulse" />
          <div className="h-3 w-16 rounded bg-ink-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

interface TopPick {
  race: Race;
  venueName: string;
  winPct: number;
  isFalseFav: boolean;
  status: string;
}

export default function Dashboard() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [runners, setRunners] = useState<Record<string, Runner[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('time');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedMeetings, setCollapsedMeetings] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(new Date());
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeDate, setActiveDate] = useState<string>('');

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    const aestDate = getAESTDate();

    const { data: meetingData, error: meetingError } = await supabase
      .from('meetings')
      .select('*')
      .eq('date', aestDate)
      .order('venue_name');

    if (meetingError) {
      setError('Could not load meetings. Please try again.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    let effectiveMeetings: Meeting[] = (meetingData ?? []) as Meeting[];

    if ((meetingData ?? []).length === 0) {
      const { data: futureMeetings } = await supabase
        .from('meetings')
        .select('*')
        .gte('date', aestDate)
        .order('date')
        .limit(1);

      if (futureMeetings && futureMeetings.length > 0) {
        const nextDate = (futureMeetings[0] as Meeting).date;
        setActiveDate(nextDate);
        const { data: nextMeetingData } = await supabase
          .from('meetings')
          .select('*')
          .eq('date', nextDate)
          .order('venue_name');
        effectiveMeetings = (nextMeetingData ?? []) as Meeting[];
      } else {
        setMeetings([]);
        setRaces([]);
        setRunners({});
        setLoading(false);
        setRefreshing(false);
        setLastRefresh(new Date());
        return;
      }
    } else {
      setActiveDate(aestDate);
    }

    const meetingIds = effectiveMeetings.map((m) => m.id);
    if (meetingIds.length === 0) {
      setMeetings([]);
      setRaces([]);
      setRunners({});
      setLoading(false);
      setRefreshing(false);
      setLastRefresh(new Date());
      return;
    }

    const { data: raceData, error: raceError } = await supabase
      .from('races')
      .select('*')
      .in('meeting_id', meetingIds)
      .order('start_time');

    if (raceError) {
      setError('Could not load races. Please try again.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const raceIds = (raceData ?? []).map((r) => r.id);
    let runnerMap: Record<string, Runner[]> = {};
    if (raceIds.length > 0) {
      const { data: runnerData } = await supabase
        .from('runners')
        .select('*')
        .in('race_id', raceIds)
        .order('box');

      runnerMap = (runnerData ?? []).reduce((acc, r) => {
        const rid = r.race_id as string;
        if (!acc[rid]) acc[rid] = [];
        acc[rid].push(r as Runner);
        return acc;
      }, {} as Record<string, Runner[]>);
    }

    setMeetings(effectiveMeetings);
    setRaces((raceData ?? []) as Race[]);
    setRunners(runnerMap);
    setLoading(false);
    setRefreshing(false);
    setLastRefresh(new Date());
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoRefresh) {
      timerRef.current = setInterval(() => fetchData(true), REFRESH_INTERVAL);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh]);

  // Build a lookup from meetingId → venue name
  const meetingLookup = useMemo(() => {
    const map: Record<string, Meeting> = {};
    meetings.forEach((m) => { map[m.id] = m; });
    return map;
  }, [meetings]);

  // Top picks: highest win-pct races, excluding finished
  const topPicks: TopPick[] = useMemo(() => {
    return races
      .filter((r) => getRaceStatus(r.start_time, now) !== 'finished')
      .map((r) => ({
        race: r,
        venueName: meetingLookup[r.meeting_id]?.venue_name ?? '',
        winPct: toNum(r.probable_winner_win_pct),
        isFalseFav: r.false_fav_flag,
        status: getRaceStatus(r.start_time, now),
      }))
      .sort((a, b) => b.winPct - a.winPct)
      .slice(0, 5);
  }, [races, meetingLookup, now]);

  // Filtered + sorted meeting groups
  const meetingGroups: MeetingGroup[] = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    return meetings
      .filter((m) => {
        if (!search) return true;
        return (
          m.venue_name.toLowerCase().includes(search) ||
          m.venue_code?.toLowerCase().includes(search) ||
          m.state?.toLowerCase().includes(search)
        );
      })
      .map((m) => ({
        meeting: m,
        races: races
          .filter((r) => r.meeting_id === m.id)
          .filter((r) => {
            if (filter === 'all') return true;
            if (filter === 'falsefav') return r.false_fav_flag;
            if (filter === 'soon') {
              const status = getRaceStatus(r.start_time, now);
              return status === 'starting-soon' || status === 'in-progress';
            }
            return true;
          })
          .sort((a, b) => {
            if (sortBy === 'edge') {
              return toNum(b.probable_winner_win_pct) - toNum(a.probable_winner_win_pct);
            }
            return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
          }),
      }))
      .filter((mg) => mg.races.length > 0 || (filter === 'all' && search === ''));
  }, [meetings, races, filter, sortBy, searchQuery, now]);

  // Merged metrics
  const totalRaces = races.length;
  const falseFavCount = races.filter((r) => r.false_fav_flag).length;
  const soonCount = races.filter((r) => {
    const s = getRaceStatus(r.start_time, now);
    return s === 'starting-soon' || s === 'in-progress';
  }).length;
  const highConfidenceCount = races.filter((r) => r.confidence === 'High').length;
  const totalRunners = Object.values(runners).reduce((sum, r) => sum + r.length, 0);
  const avgWinPct = totalRaces > 0
    ? races.reduce((sum, r) => sum + toNum(r.probable_winner_win_pct), 0) / totalRaces
    : 0;

  // Edge calculation
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
      const impliedPct = (1 / price) * 100;
      const edge = modelPct - impliedPct;
      if (edge > 3) {
        edgeCount++;
        totalEdge += edge;
      }
    }
  }
  const avgEdge = edgeCount > 0 ? totalEdge / edgeCount : 0;

  const toggleMeeting = (id: string) => {
    setCollapsedMeetings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const displayDate = activeDate && activeDate !== getAESTDate()
    ? new Date(activeDate + 'T00:00:00').toLocaleDateString('en-AU', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : new Date().toLocaleDateString('en-AU', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      });

  const metrics = [
    { label: 'Races', value: totalRaces, icon: Activity, color: 'text-ink-900', iconBg: 'bg-ink-100', iconColor: 'text-ink-500' },
    { label: 'Meetings', value: meetings.length, icon: MapPin, color: 'text-ink-900', iconBg: 'bg-ink-100', iconColor: 'text-ink-500' },
    { label: 'Jumping', value: soonCount, icon: Radio, color: soonCount > 0 ? 'text-amber-600' : 'text-ink-900', iconBg: soonCount > 0 ? 'bg-amber-100' : 'bg-ink-100', iconColor: soonCount > 0 ? 'text-amber-600' : 'text-ink-500', live: soonCount > 0 },
    { label: 'High Conf', value: highConfidenceCount, icon: TrendingUp, color: highConfidenceCount > 0 ? 'text-green-600' : 'text-ink-900', iconBg: highConfidenceCount > 0 ? 'bg-green-100' : 'bg-ink-100', iconColor: highConfidenceCount > 0 ? 'text-green-600' : 'text-ink-500' },
    { label: 'False Favs', value: falseFavCount, icon: AlertTriangle, color: falseFavCount > 0 ? 'text-amber-600' : 'text-ink-900', iconBg: falseFavCount > 0 ? 'bg-amber-100' : 'bg-ink-100', iconColor: falseFavCount > 0 ? 'text-amber-600' : 'text-ink-500' },
    { label: 'Avg Pick', value: `${avgWinPct.toFixed(0)}%`, icon: Flame, color: 'text-ink-900', iconBg: 'bg-ink-100', iconColor: 'text-ink-500' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Nav />

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-4">
        {/* Functional header — date, live/refresh, search, sort */}
        <div className="mb-4 animate-fadeIn">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="font-display text-3xl tracking-wide text-ink-900">TODAY'S RACES</h1>
              <p className="mono mt-0.5 text-sm text-ink-500">{displayDate}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  autoRefresh
                    ? 'bg-green-50 text-green-600 border border-green-200 shadow-sm'
                    : 'bg-ink-100 text-ink-500 border border-ink-200'
                }`}
              >
                <Radio className={`h-4 w-4 ${autoRefresh ? 'animate-pulseSubtle' : ''}`} />
                <span>{autoRefresh ? 'Live' : 'Paused'}</span>
              </button>
              <button
                onClick={() => fetchData(true)}
                className="btn-secondary text-sm"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              {lastRefresh && (
                <span className="mono text-xs text-ink-500 hidden md:inline">
                  Updated {lastRefresh.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Merged metrics strip — clickable to expand insights */}
        {!loading && totalRaces > 0 && (
          <>
            <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-3 lg:grid-cols-6 animate-fadeInUp">
              {metrics.map((m, i) => (
                <button
                  key={m.label}
                  onClick={() => m.label === 'Avg Pick' || m.label === 'High Conf' || m.label === 'False Favs' ? setShowInsights(!showInsights) : undefined}
                  className={`stat-card text-left animate-fadeInUp stagger-${Math.min(i + 1, 6)} group ${showInsights && (m.label === 'Avg Pick' || m.label === 'High Conf' || m.label === 'False Favs') ? 'ring-2 ring-amber-300' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{m.label}</p>
                      <p className={`mono mt-1 text-2xl font-bold ${m.color} transition-transform group-hover:scale-110 origin-left`}>
                        {m.value}
                      </p>
                    </div>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${m.iconBg} transition-colors`}>
                      <m.icon className={`h-4 w-4 ${m.iconColor} transition-colors`} />
                    </div>
                  </div>
                  {m.live && <div className="dog-track mt-2" />}
                </button>
              ))}
            </div>

            {/* Expandable insights detail */}
            {showInsights && (
              <div className="mb-4 card p-4 animate-slideDown">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {/* Model Edge */}
                  <div className="rounded-xl border border-ink-100 bg-ink-50/50 p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
                        <Flame className="h-3.5 w-3.5 text-amber-600" />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">Model Edge</span>
                    </div>
                    <p className="mono text-xl font-bold text-amber-600">+{avgEdge.toFixed(1)}%</p>
                    <p className="text-[10px] text-ink-500 mt-0.5">{edgeCount} races with edge {'>'} 3%</p>
                  </div>

                  {/* Confidence distribution */}
                  <div className="rounded-xl border border-ink-100 bg-ink-50/50 p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
                        <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">Confidence Distribution</span>
                    </div>
                    <div className="flex h-5 w-full overflow-hidden rounded-lg bg-ink-100">
                      <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${totalRaces > 0 ? (highConfidenceCount / totalRaces) * 100 : 0}%` }} />
                      <div className="h-full bg-ink-400 transition-all duration-1000" style={{ width: `${totalRaces > 0 ? (races.filter((r) => r.confidence === 'Medium').length / totalRaces) * 100 : 0}%` }} />
                      <div className="h-full bg-ink-200 transition-all duration-1000" style={{ width: `${totalRaces > 0 ? (races.filter((r) => r.confidence === 'Low').length / totalRaces) * 100 : 0}%` }} />
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 text-[10px] text-ink-500">
                      <div className="flex items-center gap-1"><div className="h-2 w-2 rounded bg-green-500" /><span>HIGH ({highConfidenceCount})</span></div>
                      <div className="flex items-center gap-1"><div className="h-2 w-2 rounded bg-ink-400" /><span>MED</span></div>
                      <div className="flex items-center gap-1"><div className="h-2 w-2 rounded bg-ink-200" /><span>LOW</span></div>
                    </div>
                  </div>

                  {/* False favourites detail */}
                  <div className="rounded-xl border border-ink-100 bg-ink-50/50 p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">False Favourites</span>
                    </div>
                    <p className="mono text-xl font-bold text-amber-600">{falseFavCount}</p>
                    <p className="text-[10px] text-ink-500 mt-0.5">Market overvalued runners flagged</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInsights(false)}
                  className="btn-ghost mt-3 text-xs"
                >
                  <ChevronDown className="h-3 w-3" />
                  Collapse
                </button>
              </div>
            )}
          </>
        )}

        {/* Top Picks module */}
        {!loading && totalRaces > 0 && topPicks.length > 0 && (
          <div className="mb-6 animate-fadeInUp stagger-1">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 shadow-sm">
                <Flame className="h-4 w-4 text-ink-900" />
              </div>
              <h2 className="font-display text-lg tracking-wide text-ink-900">TOP PICKS</h2>
              <span className="mono text-xs text-ink-500">Highest model confidence</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {topPicks.map((pick, idx) => {
                const status = getRaceStatus(pick.race.start_time, now);
                const isLive = status === 'starting-soon' || status === 'in-progress';
                return (
                  <Link
                    key={pick.race.id}
                    to={`/race/${pick.race.id}`}
                    className={`card card-hover p-3 group animate-fadeInUp stagger-${Math.min(idx + 1, 5)} ${
                      isLive ? 'ring-1 ring-amber-300/40' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="mono text-xs text-ink-500">
                        {pick.venueName} · R{pick.race.race_number}
                      </span>
                      <span className="mono text-lg font-bold text-ink-900">
                        {fmtPct(pick.race.probable_winner_win_pct, 0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="mono inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-ink-900 text-[10px] font-bold text-ink-50">
                        {pick.race.probable_winner_box}
                      </span>
                      <span className="truncate text-sm font-semibold text-ink-900 group-hover:text-amber-600 transition-colors">
                        {pick.race.probable_winner_name}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      {pick.race.confidence && (
                        <span className={`badge text-[10px] ${
                          pick.race.confidence === 'High' ? 'bg-green-100 text-green-700' :
                          pick.race.confidence === 'Medium' ? 'bg-ink-100 text-ink-600' :
                          'bg-ink-50 text-ink-400'
                        }`}>
                          {pick.race.confidence === 'High' ? 'HIGH' : pick.race.confidence === 'Medium' ? 'MED' : 'LOW'}
                        </span>
                      )}
                      {pick.isFalseFav && (
                        <span className="badge text-[10px] bg-amber-100 text-amber-700">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          FF
                        </span>
                      )}
                      {isLive && (
                        <span className="badge text-[10px] bg-amber-50 text-amber-600">
                          <Radio className="h-2.5 w-2.5 animate-pulseSubtle" />
                          LIVE
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 animate-fadeIn">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            <span className="font-semibold">Model output — not financial or betting advice.</span>{' '}
            No outcome is guaranteed. Please gamble responsibly.
          </span>
        </div>

        {/* Search + Sort + Filter bar */}
        {!loading && totalRaces > 0 && (
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fadeIn">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search venue..."
                className="input-field pl-9 py-2 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Sort toggle */}
              <button
                onClick={() => setSortBy(sortBy === 'time' ? 'edge' : 'time')}
                className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-600 transition-all hover:bg-ink-50"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                {sortBy === 'time' ? 'By time' : 'By edge %'}
              </button>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-ink-400" />
                <div className="flex gap-1 rounded-lg bg-ink-100 p-1">
                  <button
                    onClick={() => setFilter('all')}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                      filter === 'all' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('soon')}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                      filter === 'soon' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                    }`}
                  >
                    Jumping
                    {soonCount > 0 && (
                      <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1 text-xs font-bold text-ink-900 animate-scaleIn">
                        {soonCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setFilter('falsefav')}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                      filter === 'falsefav' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                    }`}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    FF
                    {falseFavCount > 0 && (
                      <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-100 px-1 text-xs font-bold text-amber-700 animate-scaleIn">
                        {falseFavCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="card border-red-200 p-6 text-center text-red-600">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-400" />
            <p>{error}</p>
            <button onClick={() => fetchData()} className="btn-secondary mt-4">Try again</button>
          </div>
        ) : meetingGroups.length === 0 ? (
          <div className="card p-12 text-center">
            <Scan className="mx-auto mb-3 h-10 w-10 text-ink-400" />
            <p className="text-ink-600">No races available for today.</p>
            <p className="mt-1 text-sm text-ink-600">The model is waiting for race data to be published.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetingGroups.map(({ meeting, races: meetingRaces }, mIdx) => {
              if (meetingRaces.length === 0 && filter !== 'all') return null;
              const isCollapsed = collapsedMeetings.has(meeting.id);
              const meetingHighConf = meetingRaces.filter((r) => r.confidence === 'High').length;
              const meetingFalseFav = meetingRaces.filter((r) => r.false_fav_flag).length;

              return (
                <div key={meeting.id} className={`animate-fadeInUp stagger-${Math.min(mIdx + 1, 8)}`}>
                  {/* Sticky meeting header */}
                  <div className="sticky top-[57px] z-20 -mx-1 px-1 py-1">
                    <button
                      onClick={() => toggleMeeting(meeting.id)}
                      className="group flex w-full items-center gap-3 rounded-xl border border-ink-300 bg-ink-900 p-3 shadow-md transition-all hover:border-amber-500 hover:shadow-lg"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-ink-800 text-ink-50 transition-transform group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-ink-900">
                        {isCollapsed ? (
                          <ChevronRight className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <MapPin className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        <h2 className="font-display text-lg tracking-wide text-ink-50 group-hover:text-amber-400 transition-colors truncate">
                          {meeting.venue_name}
                        </h2>
                        <span className="badge bg-ink-800 text-ink-300 flex-shrink-0">{meeting.state}</span>
                        <span className="mono text-sm text-ink-400 hidden sm:inline">{meeting.venue_code}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {meetingHighConf > 0 && (
                          <span className="badge bg-green-900/40 text-green-400 border border-green-800">
                            <TrendingUp className="h-3 w-3" />
                            {meetingHighConf} HIGH
                          </span>
                        )}
                        {meetingFalseFav > 0 && (
                          <span className="badge bg-amber-900/40 text-amber-400 border border-amber-800">
                            <AlertTriangle className="h-3 w-3" />
                            {meetingFalseFav} FF
                          </span>
                        )}
                        <span className="mono text-sm text-ink-400 flex-shrink-0 hidden sm:inline">
                          {meetingRaces.length} race{meetingRaces.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <span className="mono text-sm text-ink-400 sm:hidden flex-shrink-0">
                        {meetingRaces.length}
                      </span>
                    </button>
                  </div>

                  {/* Races */}
                  {!isCollapsed && (
                    <div className="mt-3 space-y-3 animate-slideDown">
                      {meetingRaces.length === 0 ? (
                        <p className="py-4 text-center text-sm text-ink-500">
                          No races match this filter.
                        </p>
                      ) : (
                        meetingRaces.map((race, rIdx) => (
                          <div key={race.id} className={`animate-fadeInUp stagger-${Math.min(rIdx + 1, 8)}`}>
                            <RaceCard
                              race={race}
                              runners={runners[race.id] ?? []}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
