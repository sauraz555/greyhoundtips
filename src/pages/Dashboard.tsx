import { useEffect, useState, useMemo, useRef } from 'react';
import {
  ChevronDown, ChevronRight, AlertCircle, Filter, RefreshCw, MapPin, Radio,
  Activity, AlertTriangle, TrendingUp, Calendar, Flame, Zap, Scan, Cpu,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Meeting, Race, Runner } from '@/types/database';
import { getRaceStatus, toNum, getAESTDate } from '@/lib/raceUtils';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import RaceCard from '@/components/RaceCard';
import ModelStatus from '@/components/ModelStatus';
import ModelInsights from '@/components/ModelInsights';

type FilterType = 'all' | 'soon' | 'falsefav';
const REFRESH_INTERVAL = 60_000;

const HERO_IMG = 'https://images.pexels.com/photos/28457519/pexels-photo-28457519.jpeg?auto=compress&cs=tinysrgb&w=1600';

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
        <div className="absolute inset-0 flex items-center justify-center">
          <Cpu className="h-6 w-6 text-amber-500 animate-pulseSubtle" />
        </div>
      </div>
      <div className="text-center">
        <p className="font-display text-sm tracking-wide text-ink-700">ANALYZING RACE DATA</p>
        <p className="mono mt-1 text-xs text-amber-600 animate-pulseSubtle">{scanText}</p>
      </div>
      {/* Scanning bar */}
      <div className="w-48 h-1 rounded-full bg-ink-100 overflow-hidden">
        <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card border-l-4 border-l-ink-200 p-4">
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
      <div className="mt-3 flex gap-2">
        <div className="h-5 w-28 rounded-full bg-ink-100 animate-pulse" />
        <div className="h-5 w-20 rounded-full bg-ink-100 animate-pulse" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [runners, setRunners] = useState<Record<string, Runner[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [collapsedMeetings, setCollapsedMeetings] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(new Date());
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

    // Use AEST date, not UTC
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

    let effectiveMeetings: Meeting[] = meetingData as Meeting[] ?? [];

    // Fallback: if no meetings for today, find the next available date
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

    const meetingIds = (effectiveMeetings ?? []).map((m) => m.id);
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

    setMeetings(effectiveMeetings as Meeting[]);
    setRaces(raceData as Race[]);
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

  const meetingGroups: MeetingGroup[] = useMemo(() => {
    return meetings.map((m) => ({
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
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    }));
  }, [meetings, races, filter, now]);

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
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-AU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Nav />

      {/* Hero banner */}
      <div className="relative h-36 overflow-hidden sm:h-48">
        <img src={HERO_IMG} alt="Greyhound racing" className="h-full w-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-10 top-4 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl animate-float" />
        </div>
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-4">
          <div className="flex items-center gap-2 text-amber-400 mb-1 animate-fadeIn">
            <Calendar className="h-4 w-4" />
            <span className="mono text-sm font-medium">{displayDate}</span>
          </div>
          <h1 className="font-display text-3xl tracking-wide text-ink-50 sm:text-5xl animate-fadeInUp">
            TODAY'S RACES
          </h1>
          <p className="mt-1 text-sm text-ink-200 animate-fadeInUp stagger-1">
            {totalRaces} races · {meetings.length} meetings · {totalRunners} runners analyzed
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-ink-50" />
      </div>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {/* Model pipeline + activity feed */}
        {!loading && totalRaces > 0 && (
          <div className="mb-6 animate-fadeInUp">
            <ModelStatus />
          </div>
        )}

        {/* Control bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              <span className="mono text-xs text-ink-400 hidden md:inline">
                Updated {lastRefresh.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* Animated stat cards */}
        {!loading && totalRaces > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="stat-card animate-fadeInUp stagger-1 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Races</p>
                  <p className="mono mt-1 text-2xl font-bold text-ink-900 transition-transform group-hover:scale-110 origin-left">{totalRaces}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 group-hover:bg-amber-100 transition-colors">
                  <Activity className="h-4 w-4 text-ink-500 group-hover:text-amber-600 transition-colors" />
                </div>
              </div>
            </div>
            <div className="stat-card animate-fadeInUp stagger-2 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Meetings</p>
                  <p className="mono mt-1 text-2xl font-bold text-ink-900 transition-transform group-hover:scale-110 origin-left">{meetings.length}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 group-hover:bg-amber-100 transition-colors">
                  <MapPin className="h-4 w-4 text-ink-500 group-hover:text-amber-600 transition-colors" />
                </div>
              </div>
            </div>
            <div className="stat-card animate-fadeInUp stagger-3 group relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Jumping</p>
                  <p className={`mono mt-1 text-2xl font-bold transition-transform group-hover:scale-110 origin-left ${soonCount > 0 ? 'text-amber-600' : 'text-ink-900'}`}>
                    {soonCount}
                  </p>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${soonCount > 0 ? 'bg-amber-100 animate-glow' : 'bg-ink-100'}`}>
                  <Radio className={`h-4 w-4 ${soonCount > 0 ? 'text-amber-600' : 'text-ink-500'}`} />
                </div>
              </div>
              {soonCount > 0 && <div className="dog-track mt-2" />}
            </div>
            <div className="stat-card animate-fadeInUp stagger-4 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">High Conf</p>
                  <p className={`mono mt-1 text-2xl font-bold transition-transform group-hover:scale-110 origin-left ${highConfidenceCount > 0 ? 'text-green-600' : 'text-ink-900'}`}>
                    {highConfidenceCount}
                  </p>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${highConfidenceCount > 0 ? 'bg-green-100' : 'bg-ink-100'}`}>
                  <TrendingUp className={`h-4 w-4 ${highConfidenceCount > 0 ? 'text-green-600' : 'text-ink-500'}`} />
                </div>
              </div>
            </div>
            <div className="stat-card animate-fadeInUp stagger-5 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">False Favs</p>
                  <p className={`mono mt-1 text-2xl font-bold transition-transform group-hover:scale-110 origin-left ${falseFavCount > 0 ? 'text-amber-600' : 'text-ink-900'}`}>
                    {falseFavCount}
                  </p>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${falseFavCount > 0 ? 'bg-amber-100' : 'bg-ink-100'}`}>
                  <AlertTriangle className={`h-4 w-4 ${falseFavCount > 0 ? 'text-amber-600' : 'text-ink-500'}`} />
                </div>
              </div>
            </div>
            <div className="stat-card animate-fadeInUp stagger-6 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Avg Pick</p>
                  <p className="mono mt-1 text-2xl font-bold text-ink-900 transition-transform group-hover:scale-110 origin-left">
                    {avgWinPct.toFixed(0)}<span className="text-base text-ink-400">%</span>
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 group-hover:bg-amber-100 transition-colors">
                  <Flame className="h-4 w-4 text-ink-500 group-hover:text-amber-600 transition-colors" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Model insights — edge detection */}
        {!loading && totalRaces > 0 && (
          <div className="mb-6 animate-fadeInUp stagger-2">
            <ModelInsights races={races} runners={runners} />
          </div>
        )}

        {/* Disclaimer */}
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 animate-fadeIn">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            <span className="font-semibold">Model output — not financial or betting advice.</span>{' '}
            No outcome is guaranteed. Please gamble responsibly.
          </span>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-2">
          <Filter className="h-4 w-4 text-ink-400" />
          <div className="flex gap-1 rounded-lg bg-ink-100 p-1">
            <button
              onClick={() => setFilter('all')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
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
              <Zap className="h-3.5 w-3.5" />
              Jumping Soon
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
              False-Fav
              {falseFavCount > 0 && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-100 px-1 text-xs font-bold text-amber-700 animate-scaleIn">
                  {falseFavCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <ScanningLoader />
        ) : error ? (
          <div className="card border-red-200 p-6 text-center text-red-600">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-400" />
            <p>{error}</p>
            <button onClick={() => fetchData()} className="btn-secondary mt-4">Try again</button>
          </div>
        ) : meetingGroups.length === 0 ? (
          <div className="card p-12 text-center">
            <Scan className="mx-auto mb-3 h-10 w-10 text-ink-300" />
            <p className="text-ink-400">No races available for today.</p>
            <p className="mt-1 text-sm text-ink-400">The model is waiting for race data to be published.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {meetingGroups.map(({ meeting, races: meetingRaces }, mIdx) => {
              if (meetingRaces.length === 0 && filter !== 'all') return null;
              const isCollapsed = collapsedMeetings.has(meeting.id);
              const meetingHighConf = meetingRaces.filter((r) => r.confidence === 'High').length;
              const meetingFalseFav = meetingRaces.filter((r) => r.false_fav_flag).length;

              return (
                <div key={meeting.id} className={`animate-fadeInUp stagger-${Math.min(mIdx + 1, 8)}`}>
                  {/* Meeting header */}
                  <button
                    onClick={() => toggleMeeting(meeting.id)}
                    className="group mb-3 flex w-full items-center gap-3 rounded-xl border border-ink-200 bg-white p-3 shadow-sm transition-all hover:shadow-md hover:border-amber-300"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-ink-900 text-ink-50 transition-transform group-hover:scale-110 group-hover:bg-amber-500">
                      {isCollapsed ? (
                        <ChevronRight className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-ink-400 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                        <h2 className="font-display text-lg tracking-wide text-ink-900 group-hover:text-amber-600 transition-colors truncate">
                          {meeting.venue_name}
                        </h2>
                      </div>
                      <span className="badge bg-ink-100 text-ink-500 flex-shrink-0">{meeting.state}</span>
                      <span className="mono text-sm text-ink-400 hidden sm:inline">{meeting.venue_code}</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      {meetingHighConf > 0 && (
                        <span className="badge bg-green-50 text-green-600 border border-green-200">
                          <TrendingUp className="h-3 w-3" />
                          {meetingHighConf} High
                        </span>
                      )}
                      {meetingFalseFav > 0 && (
                        <span className="badge bg-amber-50 text-amber-600 border border-amber-200">
                          <AlertTriangle className="h-3 w-3" />
                          {meetingFalseFav} FF
                        </span>
                      )}
                      <span className="mono text-sm text-ink-400 flex-shrink-0">
                        {meetingRaces.length} race{meetingRaces.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="mono text-sm text-ink-400 sm:hidden flex-shrink-0">
                      {meetingRaces.length}
                    </span>
                  </button>

                  {/* Races */}
                  {!isCollapsed && (
                    <div className="space-y-3 animate-slideDown">
                      {meetingRaces.length === 0 ? (
                        <p className="py-4 text-center text-sm text-ink-400">
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
