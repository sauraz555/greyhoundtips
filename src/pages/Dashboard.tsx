import { useEffect, useState, useMemo, useRef } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, Filter, RefreshCw, MapPin, Radio, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Meeting, Race, Runner } from '@/types/database';
import { getRaceStatus } from '@/lib/raceUtils';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import RaceCard from '@/components/RaceCard';

type FilterType = 'all' | 'soon' | 'falsefav';
const REFRESH_INTERVAL = 60_000;

interface MeetingGroup {
  meeting: Meeting;
  races: Race[];
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

  // Tick every second for countdowns
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    const today = new Date().toISOString().split('T')[0];

    const { data: meetingData, error: meetingError } = await supabase
      .from('meetings')
      .select('*')
      .eq('date', today)
      .order('venue_name');

    if (meetingError) {
      setError('Could not load meetings. Please try again.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const meetingIds = (meetingData ?? []).map((m) => m.id);
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

    setMeetings(meetingData as Meeting[]);
    setRaces(raceData as Race[]);
    setRunners(runnerMap);
    setLoading(false);
    setRefreshing(false);
    setLastRefresh(new Date());
  };

  // Initial load
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh
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

  const toggleMeeting = (id: string) => {
    setCollapsedMeetings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Nav />

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {/* Header with animated stats */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-3xl tracking-wide text-ink-900 sm:text-4xl">
                TODAY'S RACES
              </h1>
              <p className="mt-1 text-sm text-ink-500">
                {totalRaces} races across {meetings.length} meetings
                {falseFavCount > 0 && ` · ${falseFavCount} false-fav flags`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Auto-refresh toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  autoRefresh
                    ? 'bg-green-50 text-green-600 border border-green-200'
                    : 'bg-ink-100 text-ink-500 border border-ink-200'
                }`}
              >
                <Radio className={`h-4 w-4 ${autoRefresh ? 'animate-pulseSubtle' : ''}`} />
                <span className="hidden sm:inline">{autoRefresh ? 'Live' : 'Paused'}</span>
              </button>
              <button
                onClick={() => fetchData(true)}
                className="btn-secondary text-sm"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Last refresh indicator */}
          {lastRefresh && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-400">
              <span className={`h-1.5 w-1.5 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulseSubtle' : 'bg-ink-300'}`} />
              <span className="mono">
                {autoRefresh ? 'Auto-refreshing every 60s · ' : ''}Last updated {lastRefresh.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          )}
        </div>

        {/* Animated stat cards */}
        {!loading && totalRaces > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="stat-card animate-fadeInUp stagger-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Total Races</p>
                  <p className="mono mt-1 text-2xl font-bold text-ink-900">{totalRaces}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-100">
                  <Activity className="h-5 w-5 text-ink-500" />
                </div>
              </div>
            </div>
            <div className="stat-card animate-fadeInUp stagger-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Meetings</p>
                  <p className="mono mt-1 text-2xl font-bold text-ink-900">{meetings.length}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-100">
                  <MapPin className="h-5 w-5 text-ink-500" />
                </div>
              </div>
            </div>
            <div className="stat-card animate-fadeInUp stagger-3 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Jumping Soon</p>
                  <p className={`mono mt-1 text-2xl font-bold ${soonCount > 0 ? 'text-amber-600' : 'text-ink-900'}`}>
                    {soonCount}
                  </p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${soonCount > 0 ? 'bg-amber-100 animate-glow' : 'bg-ink-100'}`}>
                  <Radio className={`h-5 w-5 ${soonCount > 0 ? 'text-amber-600' : 'text-ink-500'}`} />
                </div>
              </div>
              {soonCount > 0 && <div className="dog-track mt-2" />}
            </div>
            <div className="stat-card animate-fadeInUp stagger-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">False Favs</p>
                  <p className={`mono mt-1 text-2xl font-bold ${falseFavCount > 0 ? 'text-amber-600' : 'text-ink-900'}`}>
                    {falseFavCount}
                  </p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${falseFavCount > 0 ? 'bg-amber-100' : 'bg-ink-100'}`}>
                  <AlertTriangle className={`h-5 w-5 ${falseFavCount > 0 ? 'text-amber-600' : 'text-ink-500'}`} />
                </div>
              </div>
            </div>
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
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink-200 border-t-amber-500" />
            <p className="text-sm text-ink-400">Loading today's races...</p>
          </div>
        ) : error ? (
          <div className="card border-red-200 p-6 text-center text-red-600">
            <p>{error}</p>
            <button onClick={() => fetchData()} className="btn-secondary mt-4">Try again</button>
          </div>
        ) : meetingGroups.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-ink-400">No races available for today.</p>
            <p className="mt-1 text-sm text-ink-400">Check back later or refresh the page.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {meetingGroups.map(({ meeting, races: meetingRaces }, mIdx) => {
              if (meetingRaces.length === 0 && filter !== 'all') return null;
              const isCollapsed = collapsedMeetings.has(meeting.id);

              return (
                <div key={meeting.id} className={`animate-fadeInUp stagger-${Math.min(mIdx + 1, 8)}`}>
                  {/* Meeting header */}
                  <button
                    onClick={() => toggleMeeting(meeting.id)}
                    className="group mb-3 flex w-full items-center gap-2 rounded-lg p-2 -ml-2 transition-colors hover:bg-ink-100"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-ink-50 transition-transform group-hover:scale-110">
                      {isCollapsed ? (
                        <ChevronRight className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex items-baseline gap-3">
                      <h2 className="font-display text-xl tracking-wide text-ink-900 group-hover:text-amber-600 transition-colors">
                        {meeting.venue_name}
                      </h2>
                      <span className="badge bg-ink-100 text-ink-500">{meeting.state}</span>
                      <span className="mono text-sm text-ink-400">{meeting.venue_code}</span>
                    </div>
                    <span className="ml-auto text-sm text-ink-400">
                      {meetingRaces.length} race{meetingRaces.length !== 1 ? 's' : ''}
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
