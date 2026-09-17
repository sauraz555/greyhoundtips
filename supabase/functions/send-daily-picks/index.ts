import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Pick {
  race_number: number;
  venue_name: string;
  state: string;
  distance_m: number;
  grade: string | null;
  probable_winner_name: string | null;
  probable_winner_box: number | null;
  probable_winner_win_pct: number | string | null;
  confidence: string | null;
  false_fav_flag: boolean;
  false_fav_reason: string | null;
  start_time: string;
  runner_name: string | null;
  trainer: string | null;
  price: number | string | null;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

function fmtPct(val: number | string | null, decimals = 1): string {
  if (val == null) return '—';
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(n)) return '—';
  return `${n.toFixed(decimals)}%`;
}

function fmtPrice(val: number | string | null): string {
  if (val == null) return '—';
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(n) || n === 0) return '—';
  return `$${n.toFixed(2)}`;
}

function confidenceLabel(c: string | null): string {
  if (!c) return '—';
  return c.toUpperCase();
}

function buildEmailHtml(picks: Pick[], dateStr: string): string {
  const pickCards = picks.map((p, i) => {
    const postTime = new Date(p.start_time).toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const confColor = p.confidence === 'High' ? '#16a34a' : p.confidence === 'Medium' ? '#a16207' : '#78716c';
    const confBg = p.confidence === 'High' ? '#dcfce7' : p.confidence === 'Medium' ? '#fef3c7' : '#f5f5f4';

    return `
    <div style="border:1px solid #e7e5e4;border-radius:12px;overflow:hidden;margin-bottom:16px;">
      <div style="background:#1c1917;padding:16px 20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#fafaf9;font-size:18px;font-weight:bold;font-family:monospace;">PICK ${i + 1} — ${p.venue_name} R${p.race_number}</span>
          <span style="color:#f59e0b;font-size:14px;font-family:monospace;">${postTime} AEST</span>
        </div>
        <div style="color:#a8a29e;font-size:13px;margin-top:4px;font-family:monospace;">
          ${p.distance_m}m · ${p.grade ?? '—'} · ${p.state}
        </div>
      </div>
      <div style="padding:16px 20px;background:#fafaf9;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <div style="background:#1c1917;color:#fafaf9;width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-family:monospace;font-size:14px;flex-shrink:0;">
            ${p.probable_winner_box ?? '?'}
          </div>
          <div>
            <div style="font-size:16px;font-weight:bold;color:#1c1917;">${p.probable_winner_name ?? '—'}</div>
            ${p.trainer ? `<div style="font-size:12px;color:#78716c;">Trainer: ${p.trainer}</div>` : ''}
          </div>
          <div style="margin-left:auto;text-align:right;">
            <div style="font-size:22px;font-weight:bold;color:#1c1917;font-family:monospace;">${fmtPct(p.probable_winner_win_pct, 0)}</div>
            <div style="font-size:12px;color:#78716c;font-family:monospace;">Win prob · ${fmtPrice(p.price)}</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <span style="background:${confBg};color:${confColor};padding:4px 10px;border-radius:6px;font-size:11px;font-weight:bold;">
            ${confidenceLabel(p.confidence)} CONFIDENCE
          </span>
          ${p.false_fav_flag ? `<span style="background:#fef3c7;color:#a16207;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:bold;">FALSE FAVOURITE</span>` : ''}
        </div>
        ${p.false_fav_flag && p.false_fav_reason ? `
        <div style="margin-top:12px;padding:10px 12px;background:#fef3c7;border-radius:8px;font-size:13px;color:#92400e;line-height:1.5;">
          <strong>Why flagged:</strong> ${p.false_fav_reason}
        </div>` : ''}
      </div>
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f1e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <!-- Header -->
    <div style="text-align:center;padding:24px 0;">
      <div style="display:inline-flex;align-items:center;gap:8px;">
        <div style="background:#f59e0b;width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:18px;">🐾</span>
        </div>
        <span style="font-size:20px;font-weight:bold;letter-spacing:0.05em;color:#1c1917;">GREYHOUND<span style="color:#f59e0b;">EDGE</span></span>
      </div>
    </div>

    <!-- Date -->
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="font-size:24px;color:#1c1917;margin:0 0 4px;">Today's Top 3 Picks</h1>
      <p style="color:#78716c;margin:0;font-size:14px;">${dateStr}</p>
    </div>

    <!-- Picks -->
    ${pickCards}

    <!-- Analysis methodology -->
    <div style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:12px;padding:20px;margin:20px 0;">
      <h2 style="font-size:14px;color:#1c1917;margin:0 0 8px;font-weight:bold;">How These Picks Were Chosen</h2>
      <p style="font-size:13px;color:#57534e;line-height:1.6;margin:0 0 8px;">
        Each pick is generated by our statistical model, which analyses <strong>form data</strong>
        (recent race performance), <strong>speed maps</strong> (early speed and box draw
        advantage), and <strong>historical patterns</strong> (track and distance records).
      </p>
      <p style="font-size:13px;color:#57534e;line-height:1.6;margin:0 0 8px;">
        The <strong>win probability</strong> represents the model's assessment of each
        runner's chance of winning, not the market price. The <strong>confidence rating</strong>
        (HIGH / MEDIUM / LOW) reflects how far the model's top pick is ahead of the field.
      </p>
      <p style="font-size:13px;color:#57534e;line-height:1.6;margin:0;">
        A <strong>false favourite</strong> flag means the market has this runner priced
        as a strong favourite, but the model's data doesn't support that price — the
        stats say the runner is overvalued.
      </p>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin:24px 0;">
      <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '') ?? ''}" style="background:#f59e0b;color:#1c1917;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;">
        View Full Dashboard
      </a>
    </div>

    <!-- Disclaimer -->
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin:20px 0;">
      <p style="font-size:12px;color:#92400e;margin:0;line-height:1.5;">
        <strong>Model output — not financial or betting advice.</strong>
        No outcome is guaranteed. You must be 18+. Please gamble responsibly.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:16px 0;border-top:1px solid #e7e5e4;margin-top:20px;">
      <p style="font-size:11px;color:#a8a29e;margin:0;">
        You're receiving this because you opted in to daily picks emails.<br>
        <a href="#" style="color:#78716c;">Manage email preferences</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function buildEmailText(picks: Pick[], dateStr: string): string {
  const lines = picks.map((p, i) => {
    const postTime = new Date(p.start_time).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `
PICK ${i + 1}: ${p.venue_name} R${p.race_number} (${postTime} AEST)
  Runner: Box ${p.probable_winner_box} — ${p.probable_winner_name}
  Win Probability: ${fmtPct(p.probable_winner_win_pct, 0)} | Market Price: ${fmtPrice(p.price)}
  Confidence: ${confidenceLabel(p.confidence)}
  Distance: ${p.distance_m}m | Grade: ${p.grade ?? '—'}${p.false_fav_flag ? `\n  FALSE FAVOURITE: ${p.false_fav_reason ?? 'Market overvalued'}` : ''}`;
  }).join('\n');

  return `GREYHOUND EDGE — Today's Top 3 Picks
${dateStr}

${lines}

How These Picks Were Chosen:
Each pick is generated by our statistical model, which analyses form data,
speed maps, and historical patterns. Win probability reflects the model's
assessment, not the market price. A false favourite flag means the market
has this runner priced as favourite but the model's data doesn't support it.

Model output — not financial or betting advice. No outcome is guaranteed.
You must be 18+. Please gamble responsibly.

You're receiving this because you opted in to daily picks emails.`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine the date to send picks for (default: today AEST)
    const body = await req.json().catch(() => ({}));
    const targetDate = body.date ?? new Date().toLocaleDateString('en-AU', { timeZone: 'Australia/Sydney' });
    const dateStr = new Date(targetDate + 'T00:00:00').toLocaleDateString('en-AU', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    // Fetch all opted-in users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, email_picks_opt_in')
      .eq('email_picks_opt_in', true);

    if (usersError) throw new Error(`Failed to fetch users: ${usersError.message}`);
    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: 'No opted-in users' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch today's top 3 picks: highest probable_winner_win_pct races for the date
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('id, venue_name, state')
      .eq('date', targetDate);

    if (meetingsError) throw new Error(`Failed to fetch meetings: ${meetingsError.message}`);
    if (!meetings || meetings.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: 'No races for this date' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const meetingIds = meetings.map((m) => m.id);
    const meetingLookup: Record<string, { venue_name: string; state: string }> = {};
    meetings.forEach((m) => { meetingLookup[m.id] = { venue_name: m.venue_name, state: m.state }; });

    const { data: races, error: racesError } = await supabase
      .from('races')
      .select('id, meeting_id, race_number, distance_m, grade, start_time, confidence, false_fav_flag, false_fav_reason, probable_winner_name, probable_winner_box, probable_winner_win_pct')
      .in('meeting_id', meetingIds)
      .order('start_time', { ascending: true });

    if (racesError) throw new Error(`Failed to fetch races: ${racesError.message}`);
    if (!races || races.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: 'No races for this date' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sort by win pct descending, take top 3
    const sortedRaces = [...races].sort((a, b) => {
      const aPct = typeof a.probable_winner_win_pct === 'string' ? parseFloat(a.probable_winner_win_pct) : (a.probable_winner_win_pct ?? 0);
      const bPct = typeof b.probable_winner_win_pct === 'string' ? parseFloat(b.probable_winner_win_pct) : (b.probable_winner_win_pct ?? 0);
      return bPct - aPct;
    });
    const top3Races = sortedRaces.slice(0, 3);

    // Fetch runners for those races (for price/trainer info)
    const raceIds = top3Races.map((r) => r.id);
    const { data: runners, error: runnersError } = await supabase
      .from('runners')
      .select('id, race_id, box, name, trainer, price, win_pct')
      .in('race_id', raceIds);

    if (runnersError) throw new Error(`Failed to fetch runners: ${runnersError.message}`);

    // Build pick objects with runner info for the probable winner
    const picks: Pick[] = top3Races.map((race) => {
      const meeting = meetingLookup[race.meeting_id];
      const raceRunners = (runners ?? []).filter((r) => r.race_id === race.id);
      const winnerRunner = raceRunners.find((r) => r.box === race.probable_winner_box);
      return {
        race_number: race.race_number,
        venue_name: meeting?.venue_name ?? 'Unknown',
        state: meeting?.state ?? '',
        distance_m: race.distance_m,
        grade: race.grade,
        probable_winner_name: race.probable_winner_name,
        probable_winner_box: race.probable_winner_box,
        probable_winner_win_pct: race.probable_winner_win_pct,
        confidence: race.confidence,
        false_fav_flag: race.false_fav_flag,
        false_fav_reason: race.false_fav_reason,
        start_time: race.start_time,
        runner_name: winnerRunner?.name ?? null,
        trainer: winnerRunner?.trainer ?? null,
        price: winnerRunner?.price ?? null,
      };
    });

    const html = buildEmailHtml(picks, dateStr);
    const text = buildEmailText(picks, dateStr);

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const user of users) {
      // Check if already sent today for this user
      const { data: existing } = await supabase
        .from('email_log')
        .select('id')
        .eq('user_id', user.id)
        .eq('pick_date', targetDate)
        .eq('status', 'sent')
        .maybeSingle();

      if (existing) {
        continue; // Already sent today
      }

      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Greyhound Edge <picks@greyhoundedge.com>',
            to: user.email,
            subject: `Today's Top 3 Picks — ${dateStr}`,
            html: html,
            text: text,
          }),
        });

        if (!emailResponse.ok) {
          const errBody = await emailResponse.text();
          throw new Error(`Resend API error: ${errBody}`);
        }

        await supabase.from('email_log').insert({
          user_id: user.id,
          email: user.email,
          pick_date: targetDate,
          status: 'sent',
        });
        sentCount++;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`${user.email}: ${errMsg}`);
        await supabase.from('email_log').insert({
          user_id: user.id,
          email: user.email,
          pick_date: targetDate,
          status: 'failed',
          error: errMsg,
        });
        failedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        sent: sentCount,
        failed: failedCount,
        total_users: users.length,
        errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
