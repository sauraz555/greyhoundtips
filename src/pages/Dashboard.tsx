import { useEffect, useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, Filter, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Meeting, Race, Runner } from '@/types/database';
import { getRaceStatus } from '@/lib/raceUtils';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import RaceCard from '@/components/RaceCard';

type FilterType = 'all' | 'soon' | 'falsefav';

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

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const { data: meetingData, error: meetingError } = await supabase
      .from('meetings')
      .select('*')
      .eq('date', new Date().toISOString().split('T')[0])
      .order('venue_name');

    if (meetingError) {
      setError('Could not load meetings. Please try again.');
      setLoading(false);
      return;
    }

    const meetingIds = (meetingData ?? []).map((m) => m.id);
    if (meetingIds.length === 0) {
      setMeetings([]);
      setRaces([]);
      setRunners({});
      setLoading(false);
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
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-wide text-ink-900 sm:text-4xl">
              TODAY'S RACES
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              {totalRaces} races across {meetings.length} meetings
              {falseFavCount > 0 && ` · ${falseFavCount} false-fav flags`}
            </p>
          </div>
          <button onClick={fetchData} className="btn-secondary text-sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Disclaimer */}
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
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
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('soon')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === 'soon' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
              }`}
            >
              Jumping Soon
              {soonCount > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1 text-xs font-bold text-ink-900">
                  {soonCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter('falsefav')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === 'falsefav' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
              }`}
            >
              False-Fav Flagged
              {falseFavCount > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-100 px-1 text-xs font-bold text-amber-700">
                  {falseFavCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-300 border-t-amber-500" />
          </div>
        ) : error ? (
          <div className="card border-red-200 p-6 text-center text-red-600">
            <p>{error}</p>
            <button onClick={fetchData} className="btn-secondary mt-4">Try again</button>
          </div>
        ) : meetingGroups.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-ink-400">No races available for today.</p>
            <p className="mt-1 text-sm text-ink-400">Check back later or refresh the page.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {meetingGroups.map(({ meeting, races: meetingRaces }) => {
              if (meetingRaces.length === 0 && filter !== 'all') return null;
              const isCollapsed = collapsedMeetings.has(meeting.id);

              return (
                <div key={meeting.id}>
                  {/* Meeting header */}
                  <button
                    onClick={() => toggleMeeting(meeting.id)}
                    className="mb-3 flex w-full items-center gap-2"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-5 w-5 text-ink-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-ink-400" />
                    )}
                    <div className="flex items-baseline gap-3">
                      <h2 className="font-display text-xl tracking-wide text-ink-900">
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
                        meetingRaces.map((race) => (
                          <RaceCard
                            key={race.id}
                            race={race}
                            runners={runners[race.id] ?? []}
                          />
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
