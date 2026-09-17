import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, MapPin, Cpu } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Race, Runner, Meeting } from '@/types/database';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import RaceCard from '@/components/RaceCard';

export default function RaceDetail() {
  const { id } = useParams<{ id: string }>();
  const [race, setRace] = useState<Race | null>(null);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [runners, setRunners] = useState<Runner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      const { data: raceData, error: raceError } = await supabase
        .from('races')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (raceError || !raceData) {
        setError('Race not found.');
        setLoading(false);
        return;
      }

      setRace(raceData as Race);

      const { data: meetingData } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', (raceData as Race).meeting_id)
        .maybeSingle();
      setMeeting(meetingData as Meeting | null);

      const { data: runnerData } = await supabase
        .from('runners')
        .select('*')
        .eq('race_id', id)
        .order('box');
      setRunners((runnerData ?? []) as Runner[]);

      setLoading(false);
    })();
  }, [id]);

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Nav />

      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <Link to="/dashboard" className="btn-ghost mb-4 -ml-2 text-sm group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to dashboard
        </Link>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-2 border-ink-200 border-t-amber-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Cpu className="h-6 w-6 text-amber-500 animate-pulseSubtle" />
              </div>
            </div>
            <p className="font-display text-sm tracking-wide text-ink-700">LOADING RACE ANALYSIS</p>
          </div>
        ) : error ? (
          <div className="card border-red-200 p-8 text-center">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-400" />
            <p className="text-red-600">{error}</p>
            <Link to="/dashboard" className="btn-secondary mt-4">Back to dashboard</Link>
          </div>
        ) : race ? (
          <>
            {meeting && (
              <div className="mb-4 flex items-center gap-2 text-sm text-ink-500 animate-fadeIn">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                  <MapPin className="h-4 w-4 text-amber-600" />
                </div>
                <span className="font-medium text-ink-700">{meeting.venue_name}</span>
                <span className="text-ink-300">·</span>
                <span>{meeting.state}</span>
                <span className="text-ink-300">·</span>
                <span className="mono">{meeting.venue_code}</span>
              </div>
            )}

            <div className="animate-fadeInUp">
              <RaceCard race={race} runners={runners} defaultExpanded={true} />
            </div>

            {/* Disclaimer */}
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 animate-fadeIn">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>
                <span className="font-semibold">Model output — not financial or betting advice.</span>{' '}
                No outcome is guaranteed. Please gamble responsibly.
              </span>
            </div>
          </>
        ) : null}
      </div>

      <Footer />
    </div>
  );
}
