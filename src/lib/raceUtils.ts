export type RaceStatus = 'upcoming' | 'starting-soon' | 'in-progress' | 'finished';

export function getRaceStatus(startTime: string, now: Date): RaceStatus {
  const start = new Date(startTime).getTime();
  const diff = start - now.getTime();
  const threeMinMs = 3 * 60 * 1000;

  if (diff > 10 * 60 * 1000) return 'upcoming';
  if (diff > 0) return 'starting-soon';
  if (diff > -threeMinMs) return 'in-progress';
  return 'finished';
}

export function formatCountdown(startTime: string, now: Date): string {
  const start = new Date(startTime).getTime();
  const diff = start - now.getTime();

  if (diff <= 0) {
    const elapsed = Math.abs(diff);
    if (elapsed < 3 * 60 * 1000) return 'In progress';
    return 'Finished';
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `starts in ${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `starts in ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatPostTime(startTime: string): string {
  return new Date(startTime).toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function confidenceColor(confidence: string | null): string {
  switch (confidence) {
    case 'High':
      return 'border-l-green-500';
    case 'Medium':
      return 'border-l-amber-400';
    default:
      return 'border-l-ink-300';
  }
}

export function confidenceBadge(confidence: string | null): { label: string; classes: string } {
  switch (confidence) {
    case 'High':
      return { label: 'High', classes: 'bg-green-100 text-green-700' };
    case 'Medium':
      return { label: 'Medium', classes: 'bg-amber-100 text-amber-700' };
    default:
      return { label: 'Low', classes: 'bg-ink-100 text-ink-500' };
  }
}

export function toNum(val: number | string | null | undefined): number {
  if (val == null) return 0;
  return typeof val === 'string' ? parseFloat(val) : val;
}

export function fmtPct(val: number | string | null | undefined, digits = 1): string {
  if (val == null) return '—';
  return `${toNum(val).toFixed(digits)}%`;
}

export function fmtPrice(val: number | string | null | undefined): string {
  if (val == null) return '—';
  return `$${toNum(val).toFixed(2)}`;
}
